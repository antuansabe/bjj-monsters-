-- ============================================================
-- BJJ MONSTERS · Esquema Supabase · Fase 1
-- Pegar completo en SQL Editor (o aplicar como migración).
-- Decisiones clave:
--   1) El cliente NUNCA escribe elo/lp/wins/level: solo columnas cosméticas.
--   2) Los combates se registran vía RPC (security definer) con rate-limit.
--   3) PvE mueve LP, XP y cinturon. El ELO queda reservado a PvP (Fase 2, server-authoritative).
--   4) El cinturon se calcula desde LP en el servidor: el cliente no puede auto-graduarse.
-- ============================================================

create type public.belt_rank    as enum ('blanco','azul','morado','marron','negro');
create type public.fight_style  as enum ('guardero','pasador_presion','leglocker','judoka_wrestler');
create type public.match_mode   as enum ('pve_trial','pve_adventure','pvp_ranked','pvp_friendly');
create type public.match_result as enum ('submission','points','tapout','draw','forfeit');

-- ---------- PROFILES ----------
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  username         text not null unique check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  level            int  not null default 1    check (level >= 1),
  xp               int  not null default 0    check (xp >= 0),
  elo              int  not null default 1000 check (elo >= 0),
  lp               int  not null default 0    check (lp >= 0),
  belt             public.belt_rank not null default 'blanco',
  rashguard_color  text not null default '#e0483c' check (rashguard_color ~ '^#[0-9A-Fa-f]{6}$'),
  short_color      text not null default '#14151f' check (short_color ~ '^#[0-9A-Fa-f]{6}$'),
  progress         jsonb not null default '{}'::jsonb,
  wins             int  not null default 0 check (wins >= 0),
  losses           int  not null default 0 check (losses >= 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index profiles_rank_idx on public.profiles (elo desc, lp desc);

-- ---------- FIGHTERS ----------
create table public.fighters (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references public.profiles(id) on delete cascade,
  name             text not null check (char_length(name) between 2 and 14),
  style            public.fight_style not null,
  submission       smallint not null check (submission between 1 and 100),
  pressure         smallint not null check (pressure   between 1 and 100),
  gas              smallint not null check (gas        between 1 and 100),
  speed            smallint not null check (speed      between 1 and 100),
  rashguard_color  text not null default '#e0483c' check (rashguard_color ~ '^#[0-9A-Fa-f]{6}$'),
  short_color      text not null default '#14151f' check (short_color ~ '^#[0-9A-Fa-f]{6}$'),
  look             jsonb not null default '{}'::jsonb,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- presupuesto de stats: evita luchadores 100/100/100/100 editados desde el cliente
  constraint fighters_stat_budget check (submission + pressure + gas + speed <= 320)
);
create unique index fighters_one_active_idx on public.fighters (profile_id) where is_active;
create index fighters_profile_idx on public.fighters (profile_id);

-- ---------- MATCHES ----------
create table public.matches (
  id                uuid primary key default gen_random_uuid(),
  mode              public.match_mode not null,
  player1_id        uuid not null references public.profiles(id) on delete cascade,
  player2_id        uuid references public.profiles(id) on delete set null,
  npc_opponent      text,
  winner_id         uuid references public.profiles(id) on delete set null,
  result            public.match_result not null,
  finish_technique  text,
  final_position    text,
  turns             int not null default 0 check (turns between 0 and 200),
  p1_points         int not null default 0,
  p2_points         int not null default 0,
  p1_lp_delta       int not null default 0,
  p1_elo_delta      int not null default 0,
  p2_elo_delta      int not null default 0,
  log               jsonb,
  created_at        timestamptz not null default now(),
  constraint matches_has_opponent check (player2_id is not null or npc_opponent is not null)
);
create index matches_p1_idx on public.matches (player1_id, created_at desc);
create index matches_p2_idx on public.matches (player2_id, created_at desc);

-- ---------- Cinturon por puntos de liga ----------
create or replace function public.belt_for_lp(p_lp int)
returns public.belt_rank language sql immutable set search_path = '' as $$
  select case
    when p_lp >= 1400 then 'negro'::public.belt_rank
    when p_lp >=  800 then 'marron'::public.belt_rank
    when p_lp >=  400 then 'morado'::public.belt_rank
    when p_lp >=  150 then 'azul'::public.belt_rank
    else 'blanco'::public.belt_rank
  end
$$;

-- ---------- updated_at ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger fighters_touch before update on public.fighters for each row execute function public.touch_updated_at();

-- ---------- Perfil automático tras el sign-up ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  wanted text := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  final  text;
begin
  if wanted is null or wanted !~ '^[A-Za-z0-9_]{3,20}$' then
    wanted := 'fighter_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  final := wanted;
  begin
    insert into public.profiles (id, username) values (new.id, final);
  exception when unique_violation then
    final := left(wanted, 15) || '_' || substr(md5(new.id::text), 1, 4);
    insert into public.profiles (id, username) values (new.id, final);
  end;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.fighters enable row level security;
alter table public.matches  enable row level security;

-- profiles: lectura pública (leaderboard), edición solo cosmética del dueño
create policy "profiles: lectura pública" on public.profiles for select to anon, authenticated using (true);
create policy "profiles: editar el propio" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
revoke insert, update, delete on public.profiles from anon, authenticated;
-- el cliente solo edita lo cosmetico y su avance de PvE; LP, ELO, nivel y cinturon los mueve el servidor
grant  update (username, rashguard_color, short_color, progress) on public.profiles to authenticated;

-- fighters: visibles para todos (el rival PvP necesita verlos), CRUD solo del dueño
create policy "fighters: lectura pública" on public.fighters for select to anon, authenticated using (true);
create policy "fighters: crear propios"   on public.fighters for insert to authenticated with check ((select auth.uid()) = profile_id);
create policy "fighters: editar propios"  on public.fighters for update to authenticated
  using ((select auth.uid()) = profile_id) with check ((select auth.uid()) = profile_id);
create policy "fighters: borrar propios"  on public.fighters for delete to authenticated using ((select auth.uid()) = profile_id);
revoke insert, update, delete on public.fighters from anon;

-- matches: solo los participantes leen; nadie inserta directo (solo vía RPC)
create policy "matches: leer los propios" on public.matches for select to authenticated
  using ((select auth.uid()) in (player1_id, player2_id));
revoke insert, update, delete on public.matches from anon, authenticated;

-- ---------- RPC: registrar combate PvE ----------
create or replace function public.record_pve_match(
  p_npc text, p_won boolean, p_result public.match_result,
  p_technique text default null, p_position text default null,
  p_turns int default 0, p_points int default 0, p_opp_points int default 0,
  p_mode public.match_mode default 'pve_trial', p_log jsonb default null
) returns public.profiles
language plpgsql security definer set search_path = '' as $$
declare
  uid     uuid := (select auth.uid());
  lp_d    int;
  xp_d    int;
  prof    public.profiles;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_mode not in ('pve_trial','pve_adventure') then raise exception 'solo modos PvE'; end if;
  -- anti-spam: un combate real no dura menos de 20 s
  if exists (select 1 from public.matches m where m.player1_id = uid and m.created_at > now() - interval '20 seconds') then
    raise exception 'rate limited';
  end if;

  -- el LP que da cada rival vive en el servidor, no en el cliente
  lp_d := case
            when p_won then case p_npc when 'ryker' then 25 when 'spaz' then 5 else 15 end
            when p_result = 'tapout' then -8
            when p_result = 'points'  then -10
            else -15
          end;
  xp_d := case when p_won then 60 else 20 end;

  insert into public.matches (mode, player1_id, npc_opponent, winner_id, result, finish_technique, final_position,
                              turns, p1_points, p2_points, p1_lp_delta, log)
  values (p_mode, uid, left(p_npc, 40), case when p_won then uid end, p_result, left(p_technique, 60), left(p_position, 20),
          least(greatest(p_turns, 0), 200), p_points, p_opp_points, lp_d, p_log);

  update public.profiles p set
    lp     = greatest(0, p.lp + lp_d),
    xp     = p.xp + xp_d,
    level  = 1 + (p.xp + xp_d) / 200,
    belt   = public.belt_for_lp(greatest(0, p.lp + lp_d)),
    wins   = p.wins   + (case when p_won then 1 else 0 end),
    losses = p.losses + (case when p_won then 0 else 1 end)
  where p.id = uid
  returning p.* into prof;

  return prof;
end $$;
revoke execute on function public.record_pve_match(text, boolean, public.match_result, text, text, int, int, int, public.match_mode, jsonb) from public, anon;
grant  execute on function public.record_pve_match(text, boolean, public.match_result, text, text, int, int, int, public.match_mode, jsonb) to authenticated;

-- ---------- Leaderboard ----------
create view public.leaderboard with (security_invoker = true) as
  select username, belt, level, elo, lp, wins, losses,
         rank() over (order by elo desc, lp desc, wins desc) as position
  from public.profiles
  order by position;
grant select on public.leaderboard to anon, authenticated;

-- Fase 2 (PvP): el lobby usa Realtime Presence/Broadcast (no requiere tablas).
-- La resolución de turnos debe vivir en una Edge Function con el mismo motor (bloque ENGINE de index.html).

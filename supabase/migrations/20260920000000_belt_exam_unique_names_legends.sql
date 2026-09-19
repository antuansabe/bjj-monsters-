-- 1) Cada personaje creado es unico en todo el juego
create unique index fighters_name_unique_idx on public.fighters (lower(name));

-- 2) El cinturon se gana con examen. El servidor valida los LP y sube un solo grado por examen.
create or replace function public.promote_belt()
returns public.profiles
language plpgsql security definer set search_path = '' as $$
declare
  uid  uuid := (select auth.uid());
  prof public.profiles;
  nb   public.belt_rank;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select * into prof from public.profiles where id = uid;
  nb := case prof.belt when 'blanco' then 'azul' when 'azul' then 'morado'
                       when 'morado' then 'marron' when 'marron' then 'negro' end;
  if nb is null then raise exception 'ya eres cinta negra'; end if;
  if public.belt_for_lp(prof.lp) < nb then raise exception 'LP insuficientes para cinta %', nb; end if;
  update public.profiles set belt = nb where id = uid returning * into prof;
  return prof;
end $$;
revoke execute on function public.promote_belt() from public, anon;
grant  execute on function public.promote_belt() to authenticated;

-- 3) Salon de la fama: el luchador de quien termina el circuito se vuelve rival para todos
create view public.legends with (security_invoker = true) as
  select f.name, f.style, f.rashguard_color, f.short_color, f.look, p.username, p.belt
  from public.fighters f
  join public.profiles p on p.id = f.profile_id
  where f.is_active
    and jsonb_typeof(p.progress -> 'medals') = 'array'
    and jsonb_array_length(p.progress -> 'medals') >= 4;
grant select on public.legends to anon, authenticated;

-- Nota: esta migracion tambien redefine record_pve_match() sin la linea que subia el cinturon.
-- La definicion vigente esta en supabase/schema.sql.

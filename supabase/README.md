# Base de datos

## Opción A: pegar y listo (2 minutos)
Supabase → SQL Editor → pega `schema.sql` completo → Run.

## Opción B: con la CLI
```bash
supabase link --project-ref <tu-ref>
supabase db push
```
`migrations/20260919000000_init.sql` es el mismo esquema, con el nombre que espera la CLI.

## Qué crea
| Objeto | Para qué |
|---|---|
| `profiles` | Usuario, nivel, XP, LP, ELO, cinturón, victorias, avance del circuito |
| `fighters` | Luchador personalizado, con presupuesto de stats para evitar trampas |
| `matches` | Historial de combates, para auditoría y ranking |
| `record_pve_match()` | Registra el combate y mueve LP, XP y cinturón **en el servidor** |
| `belt_for_lp()` | Tabla de graduación: blanco 0, azul 150, morado 400, marrón 800, negro 1400 |
| `leaderboard` | Vista pública del ranking |

El cliente solo puede escribir su nombre de usuario, sus colores y su avance de PvE.
LP, ELO, nivel y cinturón los mueve la función del servidor, con límite de una partida cada 20 segundos.

## Después de aplicarlo
Authentication → URL Configuration → agrega el dominio de Vercel.
Para probar rápido, desactiva "Confirm email".

## Pruebas de seguridad contra la base real
Este bloque crea un usuario de prueba, registra un combate, intenta hacer trampa y limpia
todo al final. Pégalo en el SQL Editor:

```sql
create temp table smoke(paso text, resultado text);
do $$
declare uid uuid := gen_random_uuid(); prof public.profiles;
begin
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values (uid,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
          'smoke_'||substr(uid::text,1,8)||'@example.test','x',now(),'{}'::jsonb,
          jsonb_build_object('username','smoke_tester'),now(),now());
  select * into prof from public.profiles where id=uid;
  insert into smoke values ('1 trigger crea perfil', coalesce(prof.username,'NO CREADO'));

  perform set_config('request.jwt.claims', json_build_object('sub',uid,'role','authenticated')::text, true);
  select * into prof from public.record_pve_match('ryker',true,'submission','Mata Leon','BACK',7,4,0,'pve_trial');
  insert into smoke values ('2 rpc registra combate','lp='||prof.lp||' wins='||prof.wins);

  begin
    perform public.record_pve_match('spaz',true,'submission','Armbar','MOUNT',4,0,0,'pve_trial');
    insert into smoke values ('3 rate limit','FALLO');
  exception when others then insert into smoke values ('3 rate limit','ok: '||sqlerrm); end;

  begin
    execute 'set local role authenticated';
    execute format('update public.profiles set lp=99999 where id=%L', uid);
    insert into smoke values ('4 cliente no escribe lp','FALLO');
  exception when others then insert into smoke values ('4 cliente no escribe lp','ok: '||split_part(sqlerrm,E'\n',1)); end;
  execute 'reset role';

  delete from auth.users where id=uid;
end $$;
select * from smoke order by paso;
```

Resultado esperado: el perfil se crea solo, la RPC mueve LP, el segundo combate se rechaza
por rate-limit y el cliente no puede escribir LP.

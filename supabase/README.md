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

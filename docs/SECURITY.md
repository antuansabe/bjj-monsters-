# Seguridad

## La llave que está en el repo es pública a propósito
`CONFIG.SUPABASE_ANON_KEY` es la *publishable key*. Viaja al navegador en cualquier aplicación
de Supabase: esconderla no aporta nada, porque cualquiera puede leerla desde las herramientas
del navegador. Lo que protege los datos es **Row Level Security**, no el secreto de esa cadena.

La que nunca debe salir del servidor es la `service_role`. No está en este repo ni en el
navegador, y no debe agregarse.

## Modelo de amenaza: el jugador es el atacante
En un juego con ranking, quien hace trampa es el propio usuario desde su navegador. Por eso:

| Riesgo | Mitigación |
|---|---|
| Editar sus puntos, ELO, nivel o cinturón | El rol del cliente no tiene permiso de escritura sobre esas columnas. Solo puede escribir `username`, colores y `progress`. |
| Inventar combates ganados | Los combates se registran con `record_pve_match()`, una función `security definer` que calcula el LP del lado del servidor. |
| Repetir la llamada mil veces | La función rechaza un combate si hay otro del mismo usuario en los últimos 20 segundos. |
| Auto-graduarse de cinturón | `promote_belt()` sube un solo grado por llamada y solo si los LP reales alcanzan. El minijuego corre en el cliente, pero el requisito de puntos no se puede saltar. |
| Copiar el personaje de otra persona | Índice único sobre `lower(name)`: un nombre de luchador existe una sola vez en todo el juego. |
| Crear un luchador con todas las stats al máximo | Restricción `fighters_stat_budget`: la suma de las cuatro stats no puede pasar de 320. |
| Leer o editar datos ajenos | RLS: los perfiles y luchadores son de lectura pública (ranking), pero solo el dueño escribe. Los combates solo los ve quien participó. |

### Verificación
Estas defensas se probaron contra la base real: alta de usuario, registro de combate,
rate-limit, graduación e intentos de escritura directa desde los roles `authenticated` y `anon`.
Ambos intentos fueron rechazados con `permission denied`.

Para repetirlo, el bloque de pruebas está en `supabase/README.md`.

## Límite conocido
`progress` (medallas del modo aventura) lo escribe el cliente, así que alguien puede marcarse
medallas desde la consola y aparecer en el salón de la fama. No mueve LP, ELO ni cinta.
Se cierra cuando los torneos se registren por RPC, igual que los combates.

## Pendiente para el PvP
El ELO se moverá solo cuando la resolución de turnos viva en el servidor (Edge Function con el
mismo motor). Mientras tanto, la columna existe pero nada la escribe: un cliente no puede
reclamar una victoria PvP.

## Reportar un problema
Abre un issue sin incluir datos de otras personas, o escribe a antuansabe@gmail.com.

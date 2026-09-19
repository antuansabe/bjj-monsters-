# BJJ Monsters

RPG por turnos de Brazilian Jiu-Jitsu en pixel art, pensado para el teléfono. Sitio estático,
sin build: `index.html` lleva motor, gráficos, audio y UI.


## Correr en local
```bash
python3 -m http.server 8000     # y abre http://localhost:8000
```
Sin llaves de Supabase arranca en **modo demo**: el juego completo funciona con guardado local.

## Desplegar
1. **Supabase**: proyecto nuevo → SQL Editor → pega `supabase/schema.sql` → Run.
2. **Llaves**: Settings → API. Copia `Project URL` y `anon public key` al bloque `CONFIG`,
   al inicio del `<script>` de `index.html`.
3. **Auth**: Authentication → URL Configuration → agrega tu dominio. Para probar rápido,
   desactiva "Confirm email".
4. **Vercel**: `vercel --prod` en esta carpeta. Sin framework, sin build command.

## Qué tiene
- **12 luchadores jugables** con retrato, stats, técnicas firma y frases propias, más dos
  personajes especiales: el campeón del circuito y El Espazado (el cinturón blanco de dos semanas).
- **8 posiciones**: de pie, tortuga, guardia, media, lateral, montada, espalda y ashi garami.
  Las sumisiones dependen de la posición (montada y espalda dan +40 %).
- **Cadenas reales de técnicas**: armbar → triángulo → omoplata, kimura → hip bump,
  D'Arce → anaconda, ankle → toe hold → heel hook, mission control → gogoplata.
  Encadenar da +12 % y el menú lo marca en amarillo.
- **Modo aventura**: cuatro torneos encadenados (Copa Academia, IBJJF Worlds, ADCC Trials,
  CJI Invitational). Si pierdes una ronda, el torneo se reinicia. Entre rondas recuperas vida
  parcial. Cada torneo da medalla y LP.
- **Cinco sedes** dibujadas a mano en píxeles, con público animado.
- **Cuatro temas de música** chiptune sintetizados en Web Audio, sin archivos de audio. La música
  cambia sola a un tema más tenso cuando alguien baja de 34 % de vida o quedan menos de dos minutos.
- **Creador de personaje**: nombre, estilo, uniforme (con o sin kimono), tono de piel, corte y
  color de pelo, colores de ropa y banda en la cabeza.
- **Cinturón que sube** por LP, calculado en el servidor.
- **Diálogos con toque para avanzar** (o botón AUTO), hápticos, números de daño y banners de
  técnica firma.

## Estructura
| Ruta | Qué es |
|---|---|
| `index.html` | El juego completo. Bloques marcados: `CONFIG`, `ENGINE`, `GFX`, y la UI. |
| `supabase/schema.sql` | Tablas, RLS, triggers y la función que registra combates. |
| `tools/sim.js` | Simulador de balance: juega miles de combates y reporta porcentajes. |
| `docs/ROSTER.md` | Cómo editar personajes, técnicas, sedes y torneos. |

El bloque `ENGINE-START … ENGINE-END` no toca el DOM. Es el que se mueve tal cual a una Edge
Function cuando llegue el PvP en tiempo real.

## Balance
`node tools/sim.js` juega miles de combates por cruce. Hoy, contra el campeón del circuito, un
jugador óptimo gana entre 32 % y 59 % según el personaje; apretando botones al azar, 11–21 %.

## Pendiente
- Arena global PvP con Supabase Realtime (el motor ya está listo para moverse al servidor).
- Más rondas y rivales por torneo.

## Notas
- Los personajes son originales. Las técnicas y las secuencias sí son reales.
- iOS no soporta `navigator.vibrate`: los hápticos solo se sienten en Android.
- La tipografía Press Start 2P no trae mayúsculas acentuadas; por eso los rótulos en caja alta
  van sin acento. El texto corrido usa Pixelify Sans, que sí las tiene.

## Licencia
MIT. Ver `LICENSE`.

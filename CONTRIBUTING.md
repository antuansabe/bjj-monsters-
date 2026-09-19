# Cómo trabajar en este repo

## Correr en local
```bash
python3 -m http.server 8000   # http://localhost:8000
```
No hay build. `index.html` es el juego completo.

## Antes de abrir un PR
```bash
sed -n '/^<script>$/,/^<\/script>$/p' index.html | sed '1d;$d' > /tmp/game.js && node --check /tmp/game.js
node tools/sim.js 500
```
El simulador valida tres cosas: que no haya IDs de técnica duplicados, que ninguna cadena
apunte a una técnica inexistente, y que el balance siga en rango. Si tocas números de
combate, pega la tabla del simulador en el PR.

## Dónde va cada cosa en `index.html`
| Bloque | Contenido |
|---|---|
| `CONFIG` | Llaves de Supabase |
| `ENGINE-START … ENGINE-END` | Motor de combate. **No toca el DOM.** Es el bloque que se moverá a una Edge Function para el PvP. |
| `GFX-START … GFX-END` | Sprites, retratos y escenarios. Todo dibujado con rectángulos. |
| Resto | UI, audio, autenticación, modo aventura |

Regla importante: el motor no debe importar nada del DOM ni del navegador. Si necesitas un
dato del juego dentro del motor, pásalo como argumento.

## Estilo
- Español en textos de usuario, comentarios y commits.
- Sin dependencias nuevas sin discutirlo: el juego no tiene build y esa es una decisión deliberada.
- Los textos en caja alta van sin acento: la tipografía Press Start 2P no trae mayúsculas acentuadas.

## Commits
Mensaje en imperativo y en español, con el porqué en el cuerpo si el cambio no es obvio.

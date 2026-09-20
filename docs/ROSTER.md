# Cómo editar el roster

Todo el elenco vive en un solo objeto, `ROSTER`, dentro del `<script>` de `index.html`.
Busca `const ROSTER={`. Cada entrada se ve así:

```js
chelo:{
  name:'CHELO MARIPOSA',      // nombre completo en la ficha
  sn:'CHELO',                 // nombre corto del HUD (máx ~8 letras)
  tag:'REY DE LA GUARDIA',    // subtítulo
  from:'BRA',                 // país, 3 letras
  bg:'adcc',                  // sede: dojo | garage | ibjjf | adcc | cji
  spec:'Guardia mariposa…',   // descripción en la ficha
  stats:{SUB:80,PRE:60,GAS:90,VEL:85},
  hp:100,
  sets:['guard'],             // sets de técnicas firma, ver SIG
  q:{intro:'…',win:'…',lose:'…'},   // frases: antes del combate, al ganar, al perder
  pal:{…}                     // paleta del sprite
}
```

## Sobre los nombres
Los nombres actuales son guiños que la gente del jiu-jitsu reconoce, no nombres reales.
Se evitó cualquier apodo que se burle del físico de alguien: un guiño es un homenaje, no un insulto.

## Cambiar un nombre
Edita `name`, `sn` y `tag`. No toques la llave del objeto (`chelo:`), porque `PLAYABLE`,
`CIRCUIT` y los guardados apuntan a esa llave.

**Nota legal, para que decidas con la información completa:** usar el nombre, apodo o imagen de
un atleta real en un producto publicado puede chocar con sus derechos de imagen, y ponerle frases
inventadas es lo más delicado. Si haces ese cambio, la decisión y el riesgo son tuyos.
Si renombras a alguien, cambia también sus frases de `q` por texto propio.

## Paleta del sprite (`pal`)
| Campo | Qué hace |
|---|---|
| `skin` | tono de piel |
| `hair` | color de pelo |
| `style` | `short`, `buzz`, `curly`, `long`, `bun`, `mohawk`, `bald` |
| `beard` | color de barba; quítalo para dejar la cara limpia |
| `ear` | color de oreja de coliflor |
| `top` / `bot` / `legs` | torso, short y piernas |
| `belt` | color del cinturón |
| `gi` | `1` para kimono (agrega solapa) |
| `band` | color de la banda en la cabeza |
| `bulk` | `1` o `2` para cuerpos más anchos |
| `crown`, `angry` | corona y ceño fruncido |

## Sedes
`ARENAS` (arriba del roster) define el nombre que se lee en la pantalla VS. Los dibujos
están en `paintBg()`, dentro del bloque `GFX`.

## Torneos del modo aventura
`CIRCUIT` define los cuatro torneos: qué rivales, en qué orden y cuántos LP dan.

## Técnicas
`U` son las técnicas universales (las tiene todo el mundo, según la posición) y `SIG` son los
sets de técnicas firma. Para dar una técnica nueva a alguien, agrégala a un set de `SIG` y pon
ese set en `sets`. Campos: `sub` (% base de sumisión), `to` (posición destino), `ch` (% base),
`dmg`, `cost` (estamina), `chain` (técnicas que quedan con bono el turno siguiente).

Después de tocar números, corre el simulador para no romper el balance:

```bash
node tools/sim.js
```

## Don Moi

`don_moi` está disponible sin medallas y conserva su lugar entre los personajes iniciales sin cambiar los desbloqueos existentes. Piel morena, kimono crema y cinta morada; HP base 104.

- Pases desde guardia/media guardia: +6 puntos de probabilidad.
- Sumisiones desde espalda dominante: +8 puntos. Especial: **Abrazo de Don Moi**, basado en Mata León y sujeto a carga y posición.
- Guardia cerrada (`GUARD`): −12 puntos a sus sumisiones y transiciones no garantizadas; las sumisiones rivales ganan +8. En sus pases desde guardia cerrada se combinan el bonus de pase y la penalización. Se respetan los límites generales de probabilidad del motor.
- Mochila exclusiva: una unidad de **Porrosetamol**, objeto ficticio, recupera hasta 30 HP y 35 STA, sin superar los máximos. Consume el turno habitual de mochila. En torneos, el inventario restante se conserva entre rondas; no se repone por avanzar.

Pruebas: `node tools/don-moi-test.js` y `node tools/sim.js 500`.
Simulación de esta incorporación, 500 combates por cruce con estrategia automática y mochila: 29% de victorias frente a Rayan, 54% frente a Yugo, 49% frente a Bia, 51% frente a Kolya y 54% frente a Luana. La simulación general usa aleatoriedad: los porcentajes varían entre ejecuciones.

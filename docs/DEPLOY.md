# Despliegue

## Cómo está montado hoy
```
GitHub (antuansabe/bjj-monsters-)  --push-->  Vercel  -->  bjj-monsters.vercel.app
                                                  |
                                                  v
                                   Supabase (proyecto bjj-monsters, us-east-2)
```
No hay build: Vercel sirve los archivos tal cual. Cada `git push` a `main` publica.

## Supabase
| Dato | Valor |
|---|---|
| Proyecto | `bjj-monsters` |
| Referencia | `gxhchitndagpfzjmaeiy` |
| Región | `us-east-2` |
| URL | `https://gxhchitndagpfzjmaeiy.supabase.co` |

El esquema ya está aplicado. Para reproducirlo en otro proyecto: pega `supabase/schema.sql`
en el SQL Editor, o usa `supabase db push` con la migración de `supabase/migrations/`.

### Un paso manual pendiente
En **Authentication → URL Configuration**, agrega el dominio de Vercel a *Site URL* y a
*Redirect URLs*. Sin eso, los correos de confirmación apuntan a `localhost`.

Para que el registro sea inmediato durante las pruebas, desactiva *Confirm email* en
**Authentication → Providers → Email**. Actívalo antes de abrirlo al público.

## Vercel
El proyecto está enlazado al repositorio, así que el despliegue es automático:

```bash
git push origin main      # y listo
```

Para desplegar desde tu máquina sin pasar por GitHub:
```bash
npx vercel --prod
```

## Cabeceras
`vercel.json` fija CSP, HSTS, `nosniff`, `Referrer-Policy` y `Permissions-Policy`.
La CSP permite exactamente tres orígenes externos: jsDelivr (cliente de Supabase),
Google Fonts y la API de Supabase. Si agregas una dependencia, actualiza esa lista o
el navegador la bloqueará en silencio.

## Modo demo
Si `CONFIG.SUPABASE_URL` queda vacío, el juego arranca sin backend y guarda en el
dispositivo. Útil para desarrollo local y para que el juego no se caiga si Supabase falla.

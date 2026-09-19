# Despliegue

## Cómo está montado hoy
```
GitHub (antuansabe/bjj-monsters-)  --push-->  Vercel  -->  https://bjj-monsters.vercel.app
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

### Configuración de Auth (obligatoria)
Sin esto, el enlace del correo de confirmación manda a `localhost:3000`, que es el valor por
defecto de Supabase. La cuenta sí se confirma, pero la persona aterriza en una página rota.

[Authentication → URL Configuration](https://supabase.com/dashboard/project/gxhchitndagpfzjmaeiy/auth/url-configuration):

| Campo | Valor |
|---|---|
| Site URL | `https://bjj-monsters.vercel.app` |
| Redirect URLs | `https://bjj-monsters.vercel.app/**` y `http://localhost:8000/**` |

El juego pide `emailRedirectTo` con su propio origen y, al volver del correo, detecta la sesión,
limpia la URL y entra directo al menú. Supabase solo respeta ese destino si está en la lista
de *Redirect URLs*.

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

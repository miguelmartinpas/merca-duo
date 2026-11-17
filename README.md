# WC SOS

App web (Next.js App Router + Tailwind CSS) para encontrar baños cercanos en una emergencia. Multiidioma (`/en`, `/es`, `/fr`, `/de`, `/pt`, `/zh`, `/ru`, `/ja`). Producción: <https://wcsos.apelogictech.com>.

La definición funcional del proyecto está en `references/app/app.md`; el trabajo se organiza en `specs/`.

## Desarrollo

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. Variables de entorno: ver `.env.template`.

## AdSense

Los anuncios son opcionales y se configuran con dos variables (ver `.env.template`):

| Variable                     | Ejemplo                | Uso                                |
| ---------------------------- | ---------------------- | ---------------------------------- |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `pub-0000000000000000` | ID de editor                       |
| `NEXT_PUBLIC_ADSENSE_SLOT`   | `0000000000`           | ID del bloque de anuncios          |

Si falta alguna (o tiene formato inválido), AdSense queda desactivado: no se carga el script, no hay bloque y `/ads.txt` devuelve 404. Al ser `NEXT_PUBLIC_*`, cambiarlas en Vercel requiere un nuevo despliegue. Define las variables solo en **Production** (no en Preview ni Development) para evitar clics inválidos propios.

### Tareas manuales

1. Dar de alta y verificar el sitio en [AdSense](https://adsense.google.com).
2. Activar el mensaje de consentimiento de Google (TCF) para el EEE y Reino Unido, en el panel de AdSense (Privacidad y mensajes).

# SPEC 05 — Google AdSense configurable por variables de entorno

> **Status:** Implemented
> **Depends on:** SPEC 04
> **Date:** 2026-11-13
> **Objective:** Integrar Google AdSense en la landing con el ID de editor y el bloque de anuncios configurables por variables de entorno (`NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT`), quedando desactivado si no están definidas.

---

## Scope

**In:**

- Dos variables de entorno públicas:
  - `NEXT_PUBLIC_ADSENSE_CLIENT`: ID de editor, en formato `pub-XXXXXXXXXXXXXXXX`. El código añade el prefijo `ca-` donde AdSense lo exige.
  - `NEXT_PUBLIC_ADSENSE_SLOT`: ID del bloque de anuncios.
- Si falta cualquiera de las dos, AdSense queda desactivado: no se carga el script, no se renderiza ningún hueco y `/ads.txt` devuelve 404.
- Carga del script de AdSense (`adsbygoogle.js?client=ca-…`) con `next/script`, en `app/[lang]/layout.tsx` (el layout raíz, que ya contiene `<html>`). Se carga en los ocho idiomas (`en`, `es`, `fr`, `de`, `pt`, `zh`, `ru`, `ja`) y solo cuando AdSense está activo.
- Un componente de anuncio con un único bloque (`<ins class="adsbygoogle">`) entre la sección `HowItWorks` y la sección `Faq` de `app/[lang]/page.tsx`. No se coloca junto a la herramienta (`Tool`).
- Ruta `/ads.txt` (`app/ads.txt/route.ts`), generada desde la variable de entorno con la línea `google.com, pub-…, DIRECT, f08c47fec0942fa0`.
- `.env.local` (ignorado por git) con los valores reales (`pub-8964106244792231` y `6692643577`). Las mismas variables ya están creadas en Vercel.
- `.env.template` con placeholders y comentarios que explican cada variable y el comportamiento sin ellas. Hoy solo contiene `NEXT_PUBLIC_SITE_URL` y está **ignorado por git** (el patrón `.env*` de `.gitignore` lo cubre y no está versionado). Se añade la excepción `!.env.template` a `.gitignore` para versionarlo, de modo que sirva de plantilla real.
- Documentar en el `README.md` (hoy es el de `create-next-app`) una sección «AdSense» con las variables, el comportamiento sin ellas y las tareas manuales: alta y verificación del sitio, y activar el mensaje de consentimiento de Google (TCF) en el panel.

**Out of scope (para futuras specs):**

- CMP de terceros o banner de consentimiento propio. Se usa el mensaje de consentimiento de Google, que se configura en el panel de AdSense, sin código en el repo.
- Más bloques de anuncios, anuncios automáticos (Auto ads) y anuncios distintos por idioma.
- Un flag aparte para activar o desactivar (`NEXT_PUBLIC_ADSENSE_ENABLED`).
- Poner anuncios junto a la herramienta.
- Despliegue en Vercel y verificación del sitio en AdSense. Las variables ya están definidas en el panel de Vercel; decidir en qué entornos (ver riesgos) es tarea manual.
- Medición de ingresos y analítica de anuncios.
- Traducir textos como una etiqueta «Publicidad». El bloque no lleva texto propio.
- Subir la versión del proyecto (`package.json`): se hace en la release.

---

## Data model

Esta spec no añade persistencia ni toca el tipo `Dictionary`. Solo introduce configuración por variables de entorno y un módulo que la lee.

### Variables de entorno

| Variable                     | Ejemplo                | Obligatoria | Uso                                                                                |
| ---------------------------- | ---------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `pub-8964106244792231` | No          | ID de editor. Se usa en el script (`ca-` + valor) y en `ads.txt` (valor tal cual). |
| `NEXT_PUBLIC_ADSENSE_SLOT`   | `6692643577`           | No          | ID del bloque (`data-ad-slot`).                                                    |

Se leen con el prefijo `NEXT_PUBLIC_`, porque el cliente y el HTML necesitan el valor. Next sustituye las variables `NEXT_PUBLIC_*` en build, por lo que cambiarlas en Vercel exige un nuevo despliegue.

### Módulo de configuración

```ts
// app/lib/adsense.ts
export type AdsenseConfig = {
  client: string; // "pub-8964106244792231" (formato ads.txt)
  clientId: string; // "ca-pub-8964106244792231" (formato script y data-ad-client)
  slot: string; // "6692643577"
};

/** Devuelve la config, o null si AdSense está desactivado o mal formado. */
export function getAdsenseConfig(): AdsenseConfig | null;
```

Reglas de `getAdsenseConfig()`:

- Devuelve `null` si falta alguna de las dos variables o si están vacías.
- Valida el formato: `client` debe cumplir `^pub-\d{16}$` y `slot` debe cumplir `^\d+$`. Si no, devuelve `null` y no falla el build.
- Quita espacios sobrantes (`trim`) antes de validar.
- Accede a `process.env.NEXT_PUBLIC_ADSENSE_CLIENT` y `process.env.NEXT_PUBLIC_ADSENSE_SLOT` por nombre literal (no con claves dinámicas), para que Next los sustituya también en el bundle del cliente.

### Constante de `ads.txt`

```ts
// app/lib/adsense.ts
export const ADSENSE_CERT_AUTHORITY_ID = "f08c47fec0942fa0"; // ID fijo de Google en ads.txt
```

Línea resultante: `google.com, pub-8964106244792231, DIRECT, f08c47fec0942fa0`.

---

## Implementation plan

Cada paso deja el sistema funcional. Con las variables sin definir, la app se comporta exactamente como ahora.

1. **Módulo de configuración.** Crear `app/lib/adsense.ts` (junto a `app/lib/site.ts`) con `AdsenseConfig`, `getAdsenseConfig()` (lectura, `trim` y validación de formato) y `ADSENSE_CERT_AUTHORITY_ID`. Todavía no lo usa nadie.
2. **Variables de entorno.**
   - Crear `.env.local` (no existe aún) con: `NEXT_PUBLIC_ADSENSE_CLIENT=pub-8964106244792231` y `NEXT_PUBLIC_ADSENSE_SLOT=6692643577`.
   - Añadir a `.env.template` las dos variables con placeholders (`pub-0000000000000000` y `0000000000`) y comentarios sobre su función y sobre el comportamiento si faltan. Conservar la línea actual de `NEXT_PUBLIC_SITE_URL`.
   - Añadir `!.env.template` a `.gitignore`, tras el patrón `.env*`, y comprobar con `git check-ignore -v` que `.env.template` ya no se ignora y `.env.local` sigue ignorado.
3. **Ruta `/ads.txt`.** Crear `app/ads.txt/route.ts` con un `GET` que:
   - devuelve `google.com, <client>, DIRECT, f08c47fec0942fa0` con `Content-Type: text/plain; charset=utf-8` si `getAdsenseConfig()` no es `null`;
   - devuelve 404 si es `null`.

   Comprobar antes en `node_modules/next/dist/docs/` cómo se declaran las route handlers en esta versión de Next. El matcher de `proxy.ts` (`/((?!_next|.*\\..*).*)`) excluye las rutas con punto, así que `/ads.txt` no se redirige a `/{lang}/ads.txt`. Verificarlo.

4. **Script de AdSense.** En `app/[lang]/layout.tsx`, cuando `getAdsenseConfig()` no sea `null`, renderizar un `<Script>` de `next/script` dentro de `<body>`, tras el `I18nProvider`, con `async`, `crossOrigin="anonymous"`, `strategy="afterInteractive"` y `src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-…"`. Consultar antes `node_modules/next/dist/docs/01-app/03-api-reference/02-components/script.md`.
5. **Componente de anuncio.** Crear `app/components/AdSlot.tsx` (PascalCase, como el resto de `app/components/`), un componente cliente que:
   - devuelve `null` si AdSense está desactivado;
   - renderiza `<ins class="adsbygoogle" data-ad-client data-ad-slot data-ad-format="auto" data-full-width-responsive="true">`;
   - ejecuta `(adsbygoogle = window.adsbygoogle || []).push({})` una vez al montar, protegido con `try/catch` y sin duplicar el push en el doble montaje de StrictMode;
   - reserva altura mínima para evitar saltos de layout (CLS);
   - se oculta si el bloque no se rellena (`data-ad-status="unfilled"`), para no dejar un hueco vacío.
6. **Colocación.** En `app/[lang]/page.tsx`, insertar `<AdSlot />` entre `<HowItWorks />` y `<Faq />`, dentro de `<main>`. Usa el mismo contenedor y espaciado que las demás secciones (`mx-auto max-w-3xl px-4 py-8`) y funciona en claro y oscuro con los tokens `border`/`muted` ya existentes.
7. **Documentación de tareas manuales.** Añadir al `README.md` una sección «AdSense» con las variables, el comportamiento sin ellas, la recomendación de definirlas solo en Production en Vercel, y las tareas manuales: alta y verificación del sitio en AdSense, y activar el mensaje de consentimiento de Google (TCF) para el EEE y Reino Unido.
8. **Verificación.**
   - Ejecutar `npm run lint` y `npm run build`.
   - Sin variables: comprobar en el HTML que no hay script ni `<ins>`, y que `/ads.txt` da 404.
   - Con variables: comprobar que el HTML de los ocho idiomas incluye el script y el bloque, y que `/ads.txt` devuelve la línea correcta.
   - Con una variable mal formada: comprobar que AdSense queda desactivado sin romper el build.
   - Revisar el layout desde 375 px hasta escritorio, en claro y oscuro.

---

## Acceptance criteria

**Configuración**

- [ ] `app/lib/adsense.ts` exporta `getAdsenseConfig()` y `ADSENSE_CERT_AUTHORITY_ID`.
- [ ] `getAdsenseConfig()` devuelve `null` si falta una variable, si está vacía o si no cumple el formato (`^pub-\d{16}$` para el cliente, `^\d+$` para el bloque).
- [ ] `.env.local` contiene `NEXT_PUBLIC_ADSENSE_CLIENT=pub-8964106244792231` y `NEXT_PUBLIC_ADSENSE_SLOT=6692643577`.
- [ ] `.env.template` contiene ambas variables con placeholders y comentarios, no incluye los IDs reales y aparece como fichero versionable en `git status`.
- [ ] `.env.local` sigue ignorado por git (`git status` no lo muestra).

**Con AdSense activo (variables válidas)**

- [ ] El HTML de `/en`, `/es`, `/de`, `/fr`, `/pt`, `/ru`, `/zh` y `/ja` incluye el script `adsbygoogle.js?client=ca-pub-8964106244792231`.
- [ ] Cada una de esas ocho páginas contiene exactamente un `<ins class="adsbygoogle">` con `data-ad-client="ca-pub-8964106244792231"` y `data-ad-slot="6692643577"`.
- [ ] El bloque está entre las secciones `HowItWorks` y `Faq`, y no hay ninguno junto a la herramienta.
- [ ] `GET /ads.txt` devuelve 200, `Content-Type: text/plain` y el cuerpo `google.com, pub-8964106244792231, DIRECT, f08c47fec0942fa0`, sin redirección.
- [ ] El `push` de `adsbygoogle` se ejecuta una sola vez por bloque, sin errores en consola por duplicados.

**Con AdSense desactivado (sin variables o con formato inválido)**

- [ ] El HTML no contiene el script de AdSense ni ningún `<ins class="adsbygoogle">`.
- [ ] `GET /ads.txt` devuelve 404.
- [ ] `npm run build` termina sin errores, también con una variable mal formada.

**Regresión y calidad**

- [ ] Con AdSense desactivado, la página es idéntica a la de la spec 04. `/` sigue redirigiendo según cookie y `Accept-Language`, y un prefijo inválido sigue dando 404. `robots.txt` y `sitemap.xml` no cambian.
- [ ] `npm run lint` y `npm run build` pasan sin errores ni avisos nuevos.
- [ ] No hay desplazamiento horizontal ni saltos de layout visibles al cargar el bloque, entre 375 px y escritorio, en claro y oscuro.
- [ ] Si el bloque no se rellena (`data-ad-status="unfilled"`), no queda un hueco vacío visible.
- [ ] `.env.template` mantiene `NEXT_PUBLIC_SITE_URL` sin cambios.
- [ ] El `README.md` incluye la sección «AdSense» con las variables, el comportamiento sin ellas y las dos tareas manuales (verificación del sitio y mensaje de consentimiento de Google).

---

## Decisions taken and discarded

**Taken**

- **Nombres de variables `NEXT_PUBLIC_ADSENSE_CLIENT` y `NEXT_PUBLIC_ADSENSE_SLOT`.** Siguen la convención de `NEXT_PUBLIC_SITE_URL`. Llevan el prefijo `NEXT_PUBLIC_` porque el valor acaba en el HTML público.
- **La variable guarda `pub-…` sin `ca-`.** AdSense usa `pub-…` en `ads.txt` y `ca-pub-…` en el script, y así se evita duplicar el ID. El código añade el prefijo.
- **Desactivado si falta alguna variable o el formato es inválido.** Evita cargar anuncios en desarrollo y en previews, y evita clics inválidos. Un formato inválido no rompe el build, porque AdSense es opcional.
- **Valores reales en `.env.local`, placeholders en `.env.template`.** La plantilla no debe incluir IDs reales. Se versiona `.env.template` con una excepción en `.gitignore`.
- **Un solo bloque, entre «Cómo funciona» y FAQ.** No tapa la herramienta y queda tras el contenido principal.
- **Script con `next/script` y `afterInteractive`.** Es el mecanismo de la documentación local de Next y no bloquea la hidratación.
- **Módulo y componente bajo `app/`.** El proyecto no tiene `lib/` ni `components/` en la raíz; todo vive en `app/lib` y `app/components`.
- **Mensaje de consentimiento de Google (TCF) configurado en el panel de AdSense.** No añade código ni dependencias. Queda como tarea manual en el README.
- **`/ads.txt` como route handler, generado desde la variable.** Sigue el patrón de `app/robots.ts` y `app/sitemap.ts`, y evita desincronizar el ID entre `.env` y un fichero estático.

**Discarded**

- **Flag aparte `NEXT_PUBLIC_ADSENSE_ENABLED`.** Con dos variables ya se decide si está activo, y un flag añade un tercer estado.
- **CMP de terceros o banner de consentimiento propio.** Es más trabajo y dependencias, y merece su propia spec.
- **Auto ads o varios bloques.** Se prefiere control de la colocación y no degradar la UX de la herramienta.
- **Anuncio junto a la herramienta.** Molesta durante el uso.
- **`ads.txt` estático en `public/`.** Obligaría a editar el fichero a mano al cambiar de editor.
- **IDs reales en `.env.template`.** Los ejemplos llevan placeholders.

---

## Identified risks

- **Consentimiento sin configurar en AdSense.** Si no se activa el mensaje de consentimiento de Google en el panel, los anuncios no se sirven al tráfico del EEE y Reino Unido, y puede haber incumplimiento de GDPR. _Mitigación:_ tarea manual documentada en el README y en los criterios de aceptación.
- **Clics inválidos propios.** Cargar anuncios reales en local o en previews puede acabar en una penalización de la cuenta. _Mitigación:_ en local el valor real vive en `.env.local`. Conviene definir las variables en Vercel solo para Production (no en Preview ni Development), y el README lo recoge.
- **Variables definidas en Vercel en todos los entornos.** Si se crearon también para Preview/Development, los previews cargarán anuncios reales. _Mitigación:_ revisar los entornos en el panel de Vercel (tarea manual).
- **Doble `push` en React StrictMode.** En desarrollo el montaje doble puede lanzar el error «All ins elements already have ads». _Mitigación:_ proteger el `push` con `try/catch` y con una referencia que evite repetirlo.
- **Navegación entre idiomas.** Al cambiar de idioma se remonta el árbol y el bloque pide un anuncio nuevo. _Mitigación:_ un solo `push` por montaje y comprobar que no se acumulan errores en consola.
- **Cambio de layout (CLS).** El anuncio se rellena tras la carga y puede mover el contenido. _Mitigación:_ altura mínima reservada y ocultar el bloque si queda sin rellenar.
- **Bloqueadores de anuncios.** Los usuarios con bloqueador no cargan el script y el bloque queda vacío. _Mitigación:_ el contenedor no deja hueco visible si no hay anuncio.
- **`/ads.txt` y `proxy.ts`.** El matcher excluye rutas con punto, por lo que no debería interferir. _Mitigación:_ se comprueba en el paso 3 y en la verificación.
- **Sitio no verificado o rechazado por AdSense.** Puede ocurrir pese a que el código sea correcto, por ejemplo por poco contenido. _Mitigación:_ queda fuera de esta spec y es una tarea manual del usuario.

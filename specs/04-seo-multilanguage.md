# SPEC 04 — SEO multi-idioma y verificación de Google Search Console

> **Status:** Implemented
> **Depends on:** — (esqueleto base: cabecera, pie e i18n)
> **Date:** 2026-11-13
> **Objective:** Añadir configuración SEO completa (metadatos traducidos, canonical y hreflang, Open Graph y Twitter, sitemap, robots, JSON-LD e imagen para compartir) en los 8 idiomas, más la meta de verificación de Google Search Console.

---

## Scope

**In:**

- **URL del sitio.** Constante nueva `siteUrl` en `app/lib/site.ts`. Lee `process.env.NEXT_PUBLIC_SITE_URL` y, si no está definida, usa `https://wcsos.apelogictech.com`. Sin barra final.
- **Metadatos por idioma.** `app/[lang]/layout.tsx` sustituye el `export const metadata` fijo por `generateMetadata({ params })`, que devuelve:
  - `metadataBase` (a partir de `siteUrl`), `title` y `description` traducidos.
  - `alternates.canonical` (`/{lang}`) y `alternates.languages`, con los 8 idiomas más `x-default` apuntando a `/en`.
  - `openGraph`: `type: "website"`, `siteName: "WC SOS"`, `url`, `title`, `description`, `locale` y `alternateLocale`. Valores de `locale`: `en_US`, `es_ES`, `fr_FR`, `de_DE`, `pt_PT`, `zh_CN`, `ru_RU`, `ja_JP`.
  - `twitter`: `card: "summary_large_image"`, con título y descripción.
  - `robots`: `index: true, follow: true`.
  - `verification: { google: "UvrLAlw31qayA0K5dtd_R3uCw0h-CCzNGJgVIQjGGPE" }`. Next lo emite como `<meta name="google-site-verification" ...>`. Va en todos los idiomas, porque se declara en el layout.
- **Textos SEO.** Claves nuevas `seo.title` y `seo.description` en `app/i18n/dictionaries.ts`, en los 8 idiomas. Open Graph y Twitter reutilizan esas mismas claves. No hay `keywords`.
- **Sitemap.** `app/sitemap.ts` con las 8 URLs `/{lang}`. Cada una lleva `alternates.languages` con los 8 idiomas. La raíz `/` no aparece, porque `proxy.ts` la redirige.
- **Robots.** `app/robots.ts` con `allow: "/"` para todos los agentes y `sitemap: {siteUrl}/sitemap.xml`.
- **JSON-LD.** Un `<script type="application/ld+json">` con un `WebApplication` en `app/[lang]/page.tsx`. Campos: `name`, `description` y `inLanguage` por idioma, `url`, `applicationCategory: "UtilitiesApplication"`, `operatingSystem: "Any"` y `offers` con precio 0 USD.
- **Imagen para compartir.** `app/opengraph-image.tsx` generada con `ImageResponse` de `next/og`, de 1200×630. Es la misma en todos los idiomas y solo lleva la marca "WC SOS" y un lema corto en inglés. Motivo: la fuente por defecto de `ImageResponse` no cubre ruso, chino ni japonés. La imagen de Twitter se reutiliza.

**Out of scope (para futuras specs):**

- Verificación de otros buscadores (Bing, Yandex) y analítica.
- `keywords`, JSON-LD de FAQ o de `Organization`.
- Imágenes de Open Graph traducidas por idioma.
- `manifest.webmanifest` y cambios en el favicon (`app/icon.svg`).
- Páginas nuevas, rutas por sección o cambios en la redirección de `proxy.ts`.
- Dar de alta el sitio y enviar el sitemap en Search Console (es manual, fuera del código).
- Subir la versión del proyecto (`package.json`): se hace en la release.
- Traducir `siteName` ("WC SOS" es la marca).

---

## Data model

Esta feature no introduce datos persistentes. Añade dos claves a los diccionarios, una constante y un tipo auxiliar para el mapeo de `og:locale`.

```ts
// app/i18n/dictionaries.ts  (los 8 idiomas, claves planas)
"seo.title": string;       // nuevo. Ej. en: "WC SOS — Find the nearest toilet in an emergency"
"seo.description": string; // nuevo. Ej. en: "Find public toilets and venues with restrooms near you, with a walking route in one tap."

// app/lib/site.ts
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://wcsos.apelogictech.com"
).replace(/\/$/, "");

export const googleSiteVerification = "UvrLAlw31qayA0K5dtd_R3uCw0h-CCzNGJgVIQjGGPE";

export const OG_LOCALES: Record<Locale, string> = {
  en: "en_US", es: "es_ES", fr: "fr_FR", de: "de_DE",
  pt: "pt_PT", zh: "zh_CN", ru: "ru_RU", ja: "ja_JP",
};
```

**Notas:**

- `OG_LOCALES` usa el tipo `Locale` de `app/lib/types.ts`, que ya existe. Hay que importarlo en `site.ts`.
- `NEXT_PUBLIC_SITE_URL` es la única variable de entorno nueva y es opcional gracias al valor por defecto.
- Los textos de `seo.title` y `seo.description` de los 8 idiomas se redactarán en la implementación, con el inglés como base.

---

## Implementation plan

Cada paso deja el sistema funcional y compilable.

1. **Constantes del sitio.** En `app/lib/site.ts` añadir `siteUrl`, `googleSiteVerification` y `OG_LOCALES` (importando `Locale`). _Verificación:_ `npm run build` pasa.
2. **Textos SEO.** Añadir `seo.title` y `seo.description` en `app/i18n/dictionaries.ts`, primero en `en` y luego en los otros 7 idiomas. _Verificación:_ `tsc` no se queja, porque `Dict` obliga a que las 8 claves existan.
3. **Metadatos del layout.** En `app/[lang]/layout.tsx`, sustituir `export const metadata` por `generateMetadata({ params })`. Contenido: `metadataBase`, `title`, `description`, `alternates` (canonical, `languages` y `x-default`), `openGraph`, `twitter`, `robots` y `verification.google`. Los textos salen de `dictionaries[lang]`. Si `lang` no es válido, devuelve `{}`, y `notFound()` del layout sigue haciendo su trabajo. _Verificación:_ `curl` a `/es` muestra `<title>`, `canonical`, `hreflang` y `google-site-verification`.
4. **Imagen para compartir.** Crear `app/opengraph-image.tsx` (1200×630, `ImageResponse`, marca "WC SOS" y lema en inglés). _Verificación:_ `/opengraph-image` devuelve un PNG, y `og:image` y `twitter:image` aparecen en el HTML de todos los idiomas. Si el `openGraph` del paso 3 pisara la imagen del archivo, se corrige aquí.
5. **Sitemap.** Crear `app/sitemap.ts` con las 8 URLs y sus `alternates.languages`. _Verificación:_ `/sitemap.xml` lista 8 entradas con `xhtml:link` para cada idioma.
6. **Robots.** Crear `app/robots.ts` con `allow: "/"` y la URL del sitemap. _Verificación:_ `/robots.txt` muestra `Allow: /` y `Sitemap: https://wcsos.apelogictech.com/sitemap.xml`.
7. **JSON-LD.** En `app/[lang]/page.tsx`, convertir `Home` en función `async` que lea `params` e inyecte el `<script type="application/ld+json">` de `WebApplication` con `name`, `description` e `inLanguage` por idioma. _Verificación:_ el HTML de `/ja` contiene el JSON con `"inLanguage":"ja"`.
8. **Revisión final.** `npm run lint` y `npm run build`, y comprobar a mano `/en`, `/es`, `/ja` y `/ru` (el `<head>` completo). _Verificación:_ ver los criterios de aceptación.

**Notas:**

- El paso 1 va antes que el 2 porque los dos son independientes y no rompen nada por separado. El orden solo sirve para llegar a los pasos 3 y 7 con todo listo.
- Si existiera `.env.example`, se documentaría `NEXT_PUBLIC_SITE_URL` en el paso 1. No se ha comprobado.

---

## Acceptance criteria

Cada criterio es booleano y se comprueba con `curl` sobre `npm run start` (tras `npm run build`) o con el propio build.

- [ ] `npm run lint` y `npm run build` terminan sin errores ni avisos nuevos.
- [ ] El HTML de `/en`, `/es`, `/fr`, `/de`, `/pt`, `/zh`, `/ru` y `/ja` contiene exactamente una vez `<meta name="google-site-verification" content="UvrLAlw31qayA0K5dtd_R3uCw0h-CCzNGJgVIQjGGPE"/>`.
- [ ] En cada idioma, `<title>` y `<meta name="description">` coinciden con `seo.title` y `seo.description` de ese idioma, y el texto de `/es` no es el de `/en`.
- [ ] En cada idioma, `<link rel="canonical">` apunta a `https://wcsos.apelogictech.com/{lang}`.
- [ ] En cada idioma hay 9 `<link rel="alternate" hreflang>`: los 8 idiomas más `x-default` apuntando a `/en`.
- [ ] En cada idioma, `og:locale` coincide con `OG_LOCALES[lang]`. `og:title`, `og:description`, `og:url` y `og:site_name` existen, y `twitter:card` vale `summary_large_image`.
- [ ] `og:image` y `twitter:image` apuntan a una URL absoluta bajo `siteUrl`, y esa URL devuelve un PNG de 1200×630 con estado 200.
- [ ] `/sitemap.xml` contiene exactamente 8 `<url>`, cada una con sus 8 `xhtml:link`, y no contiene la raíz `/`.
- [ ] `/robots.txt` contiene `Allow: /` y `Sitemap: https://wcsos.apelogictech.com/sitemap.xml`.
- [ ] El HTML de `/ja` contiene un `<script type="application/ld+json">` con JSON válido, `"@type":"WebApplication"` y `"inLanguage":"ja"`, y lo mismo ocurre en los demás idiomas con su código.
- [ ] Con `NEXT_PUBLIC_SITE_URL=https://example.com` en el build, canonical, sitemap y robots usan `example.com`.
- [ ] `/xx` sigue devolviendo 404.
- [ ] La landing se ve y funciona igual que antes: no cambia ningún componente visual.

---

## Decisions taken and discarded

| Decisión                                                                                      | Alternativas descartadas                            | Por qué                                                                                                            |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| URL del sitio en `NEXT_PUBLIC_SITE_URL`, con `https://wcsos.apelogictech.com` por defecto | Constante fija; variable obligatoria                | Permite cambiar de dominio sin tocar código, y el valor por defecto evita que el build falle en local.             |
| Alcance completo: metadatos, Open Graph/Twitter, sitemap, robots, JSON-LD e imagen            | Solo metadatos y hreflang; metadatos más Open Graph | Cada pieza es pequeña y son todas de la misma área. Se decidió con el usuario.                                     |
| Imagen de Open Graph generada con `ImageResponse`                                             | Sin imagen; PNG aportado por el usuario             | No hay que mantener un binario y la marca queda versionada en código.                                              |
| Una sola imagen, sin traducir, con lema en inglés                                             | Una imagen por idioma                               | La fuente por defecto de `ImageResponse` no cubre ruso, chino ni japonés, y cargar fuentes extra complica la spec. |
| Textos SEO como claves `seo.*` en `dictionaries.ts`                                           | Archivo aparte                                      | Sigue la convención del proyecto (spec 03: `header.donate`) y el tipo `Dict` obliga a traducir los 8 idiomas.      |
| Sin `keywords`                                                                                | Incluirlas                                          | Google las ignora desde hace años.                                                                                 |
| `x-default` apunta a `/en`                                                                    | `x-default` sin definir                             | `/en` ya es el idioma por defecto de `proxy.ts`.                                                                   |
| El sitemap no incluye `/`                                                                     | Incluirla                                           | `proxy.ts` la redirige a `/{lang}`, y las URLs con redirección no deben ir en un sitemap.                          |
| `robots` permite todo y apunta al sitemap                                                     | Bloquear rutas                                      | Es una landing pública sin zonas privadas.                                                                         |
| La verificación de Google va en el layout, o sea en los 8 idiomas                             | Solo en `/en`                                       | Cualquier URL del sitio queda verificable, y es lo que se pidió ("en todos los idiomas").                          |
| `og:locale` con `pt_PT` y `zh_CN`                                                             | `pt_BR`, `zh_TW`                                    | Suposición confirmada por el usuario. Se puede cambiar en `OG_LOCALES` sin tocar nada más.                         |
| Token de verificación como constante `googleSiteVerification` en `site.ts`                    | Variable de entorno                                 | No es un secreto (es público en el HTML), así que no hace falta que sea configurable.                              |

---

## Identified risks

| Riesgo                                                                                                               | Efecto                                                        | Mitigación                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| El `openGraph` de `generateMetadata` y `app/opengraph-image.tsx` pueden pisarse entre sí                             | Falta `og:image` o aparece duplicada                          | El paso 4 lo comprueba en el HTML, y si hace falta se declara la imagen explícitamente en `generateMetadata`. |
| `ImageResponse` en la raíz no conoce el idioma                                                                       | Imagen igual para todos                                       | Es una decisión tomada: solo lleva la marca y un lema en inglés.                                              |
| `NEXT_PUBLIC_SITE_URL` se inlinea en build, no en runtime                                                            | Cambiar la variable en Vercel sin redesplegar no surte efecto | Hay que volver a desplegar tras cambiarla.                                                                    |
| Si el dominio real difiere de `wcsos.apelogictech.com`, los canonical y el sitemap apuntan a un sitio equivocado | Google indexa la URL incorrecta                               | Definir `NEXT_PUBLIC_SITE_URL` en el entorno de producción antes de desplegar.                                |
| `proxy.ts` excluye rutas con punto, pero `/sitemap.xml` y `/robots.txt` deben seguir sirviéndose sin redirección     | Los dos archivos quedarían redirigidos a `/en/...`            | El matcher ya excluye `.*\\..*`, así que no hay cambio. Los criterios de aceptación lo verifican con `curl`.  |
| Google tarda en reconocer el token de verificación                                                                   | Search Console puede mostrar "no verificado" un tiempo        | Es normal. Hay que desplegar primero y pulsar Verificar después.                                              |

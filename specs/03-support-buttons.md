# SPEC 03 — Botones de Buy me a coffee y Donate de PayPal

> **Status:** Implemented
> **Depends on:** — (esqueleto base: cabecera, pie e i18n)
> **Date:** 2026-11-13
> **Objective:** Añadir a la cabecera un botón de Buy me a coffee y otro de Donate de PayPal, con icono y texto desde `lg` (1024 px) y solo icono por debajo.

---

## Scope

**In:**

- **Botón Buy me a coffee.** Componente `app/components/CoffeeButton.tsx`, un `<a>` a `https://www.buymeacoffee.com/myitutilities`. Fondo `#FFDD00`, borde y texto `#000000`. Texto "Buy me a coffee" en fuente Cookie y emoji ☕. Texto fijo en inglés, sin clave en los diccionarios. `aria-label="Buy me a coffee"` en todos los idiomas. La taza va centrada en vertical con el texto (`inline-flex` con `items-center`, `leading-none` en el emoji).
- **Botón Donate de PayPal.** Componente `app/components/DonateButton.tsx`, un `<a>` al enlace de donación facilitado, tal cual (`business=2PZ3L74E8C3JJ`, `currency_code=USD`, `item_name=…`). Fondo `#FFC439`, borde y texto `#003087`. Icono SVG propio de la "P" doble (`#003087` y `#009cde`), `PayPalIcon` definido dentro de `DonateButton.tsx`. `aria-label` igual al texto de `header.donate`.
- **Responsive.**
  - Desde `lg` (1024 px): icono y texto, con altura `h-10` (40 px), como el selector de idioma.
  - Por debajo de `lg`: solo icono, en un círculo de 40×40 (`size-10 rounded-full`).
  - La hamburguesa de `Header.tsx` pasa de `h-9 w-9` a `h-10 w-10` y mantiene sus esquinas `rounded-md` (cuadrada).
- **Ubicación**, todo en `app/components/Header.tsx`:
  - Desde `md`: a la izquierda del selector de idioma. Orden: marca, café, PayPal, idioma, tema.
  - Por debajo de `md`: en la barra, entre la marca y la hamburguesa. Orden: marca, café, PayPal, hamburguesa. El panel desplegable no los duplica.
- **Fuente Cookie.** Con `next/font/google` (peso 400, `display: swap`), expuesta como variable CSS `--font-cookie` desde `app/[lang]/layout.tsx`, junto a las fuentes de la marca.
- **URLs.** Dos constantes nuevas en `app/lib/site.ts` (archivo nuevo): `buyMeACoffeeUrl` y `paypalDonateUrl`.
- **i18n.** Clave nueva `header.donate` en `app/i18n/dictionaries.ts`, en los 8 idiomas. Se usa como texto desde `lg` y como `aria-label` en todos los tamaños.
- **Enlaces externos.** `target="_blank"` y `rel="noopener noreferrer"`.
- **Impresión.** Los dos botones llevan la clase `no-print`, y `app/globals.css` gana una regla `@media print` que oculta `.no-print`. El resto de la cabecera no se toca.
- **Foco.** Ambos botones muestran un anillo de foco visible (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`).

**Out of scope (para futuras specs):**

- El pie de página.
- Subir la versión del proyecto (`package.json`, `package-lock.json`): se hace en la release.
- Cargar el script oficial de Buy me a coffee (`button.prod.min.js`).
- Traducir "Buy me a coffee".
- Cambiar el tamaño o el diseño de la marca, del selector de idioma o del de tema.
- Colores distintos en modo oscuro: ambos botones usan colores de marca fijos.
- Meter los botones en el panel desplegable o en el pie.
- Medir clics (analítica).
- Usar el logo oficial de PayPal con licencia en lugar del SVG simplificado.
- Traducir el `item_name` del enlace de PayPal: se queda en inglés.
- Ocultar la cabecera entera al imprimir.

---

## Data model

Esta feature no introduce estructuras de datos persistentes. Solo añade una clave a los diccionarios y dos constantes con las URLs de los botones.

```ts
// app/i18n/dictionaries.ts  (los 8 idiomas, claves planas)
"header.donate": string; // nuevo, junto a "header.menu", "header.language" y "header.theme"

// app/lib/site.ts  (archivo nuevo)
export const buyMeACoffeeUrl = "https://www.buymeacoffee.com/myitutilities";
export const paypalDonateUrl =
  "https://www.paypal.com/donate/?business=2PZ3L74E8C3JJ&no_recurring=0&currency_code=USD&item_name=I+am+a+software+developer+who+loves+little+projects+in+my+spare+time.+If+you+enjoy+what+I+create%2C+your+support+helps+me.";
```

Valores de `header.donate`:

| Idioma | Valor        |
| ------ | ------------ |
| en     | Donate       |
| es     | Donar        |
| de     | Spenden      |
| fr     | Faire un don |
| pt     | Doar         |
| ru     | Пожертвовать |
| zh     | 捐赠         |
| ja     | 寄付         |

Convenciones:

- `DictKey` se deriva de `en` (`keyof typeof en`) y cada idioma es `Record<DictKey, string>`, así que TypeScript marca `header.donate` si falta en algún idioma.
- "Buy me a coffee" no tiene clave: es texto fijo en inglés dentro de `CoffeeButton.tsx`.
- Las URLs viven en `app/lib/site.ts`, no incrustadas en el JSX.
- La fuente Cookie se expone como variable CSS `--font-cookie`, igual que `--font-sans-brand`.
- Los componentes reciben por props lo que necesitan: `DonateButton({ label }: { label: string })` y `CoffeeButton()` sin props. `Header.tsx` pasa `t("header.donate")`.

---

## Implementation plan

Cada paso deja el sistema funcional y se puede commitear solo.

1. **Constantes y diccionarios.** Crear `app/lib/site.ts` con `buyMeACoffeeUrl` y `paypalDonateUrl`. Añadir `header.donate` a los 8 idiomas de `app/i18n/dictionaries.ts` con los valores del Data model.
   Probar: `npx tsc --noEmit` pasa y la UI no cambia.

2. **Fuente y regla de impresión.** En `app/[lang]/layout.tsx`, cargar `Cookie` con `next/font/google` (peso 400, `display: swap`, `variable: "--font-cookie"`, `fallback: ["cursive"]`) y añadir `cookie.variable` a la `className` del `<html>`. En `app/globals.css`, añadir `@media print { .no-print { display: none !important; } }`.
   Probar: `npm run build` pasa y el HTML de `/es` incluye la clase de la fuente. La UI no cambia.

3. **Botón Buy me a coffee.** Crear `app/components/CoffeeButton.tsx`: un `<a>` con `href={buyMeACoffeeUrl}`, `target="_blank"`, `rel="noopener noreferrer"`, `aria-label="Buy me a coffee"` y clase `no-print`. Fondo `#FFDD00`, borde 2 px `#000`, texto negro en `font-[family-name:var(--font-cookie)]`. El emoji ☕ va en un `<span aria-hidden="true">` con `leading-none`. Por debajo de `lg`: solo el emoji en un círculo `size-10 rounded-full`. Desde `lg`: emoji y texto, con `h-10` y `px` horizontal. El texto se muestra con `hidden lg:inline`.
   En `app/components/Header.tsx`, añadir un `<div className="ml-auto flex items-center gap-2">` entre la marca y el bloque de idioma y tema, y poner el botón dentro. Este grupo debe ir antes del `<div className="hidden … md:flex">` de idioma y tema y antes de la hamburguesa.
   Probar: en `localhost:3000/es` el botón aparece a 375 y a 1280 px, abre la URL en pestaña nueva y la taza queda centrada en vertical.

4. **Botón Donate de PayPal.** Crear `app/components/DonateButton.tsx` con `DonateButton({ label })` y `PayPalIcon` definido en el mismo archivo (SVG con `aria-hidden`, `#003087` y `#009cde`). Misma estructura que el de café: `<a href={paypalDonateUrl}>`, `target="_blank"`, `rel="noopener noreferrer"`, `aria-label={label}`, clase `no-print`, fondo `#FFC439`, borde 2 px `#003087`, texto `#003087`. El texto `label` se muestra con `hidden lg:inline`. Montarlo en `Header.tsx` dentro del mismo grupo, después del de café, con `label={t("header.donate")}`.
   Probar: en `/ja` el texto sale "寄付" desde 1024 px y el enlace abre la URL de PayPal en pestaña nueva.

5. **Hamburguesa, foco y ajuste.** En `Header.tsx`, cambiar la hamburguesa de `h-9 w-9` a `h-10 w-10` (se mantiene `rounded-md`). Añadir a ambos botones nuevos `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`. Revisar la cabecera a 375, 768, 1024 y 1280 px de ancho, en los 8 idiomas: todo cabe sin desbordar, el contenido ocupa una sola fila y "WC SOS" no se parte. Ajustar `gap` y `px`, o el punto de corte del texto (ver Risks), si hace falta.
   Probar: sin scroll horizontal a 375 px y una sola fila a 768 y 1024 px; el anillo de foco se ve con el tabulador.

6. **Verificación final.** Comprobar que no hay peticiones a `cdnjs.buymeacoffee.com`, `fonts.googleapis.com` ni `fonts.gstatic.com` en runtime, y que la vista de impresión no muestra los botones.
   Probar: `npx tsc --noEmit`, `npm run lint` y `npm run build` terminan sin errores.

---

## Acceptance criteria

**Botones y ubicación**

- [ ] La cabecera de las 8 rutas (`/en`, `/es`, `/fr`, `/de`, `/pt`, `/zh`, `/ru`, `/ja`) muestra, de izquierda a derecha, la marca, el botón de café y el de PayPal; por debajo de `md`, después la hamburguesa, y desde `md`, después los selectores de idioma y tema.
- [ ] Con un ancho de 1024 px o más, el botón de café muestra ☕ y el texto "Buy me a coffee" en fuente Cookie, con fondo `#FFDD00` y borde negro, y mide 40 px de alto.
- [ ] Con un ancho de 1024 px o más, el botón de PayPal muestra el icono y el texto de `header.donate` en el idioma de la ruta, con fondo `#FFC439` y borde `#003087`, y mide 40 px de alto.
- [ ] Con menos de 1024 px, ambos botones muestran solo el icono, en un círculo de 40×40 px.
- [ ] Con menos de 768 px, la hamburguesa mide 40×40 px y mantiene sus esquinas `rounded-md` (cuadrada).
- [ ] La taza ☕ queda centrada en vertical con el texto en desktop y centrada en el círculo en móvil: la distancia entre el borde superior del botón y la taza es igual (±1 px) a la del borde inferior.
- [ ] El panel desplegable de la hamburguesa no contiene los botones.

**Enlaces y accesibilidad**

- [ ] El botón de café enlaza a `https://www.buymeacoffee.com/myitutilities` y el de PayPal a `paypalDonateUrl`, sin cambios en sus parámetros.
- [ ] Ambos enlaces tienen `target="_blank"` y `rel="noopener noreferrer"`.
- [ ] El botón de café tiene `aria-label="Buy me a coffee"` y el de PayPal tiene `aria-label` igual a `header.donate` del idioma de la ruta, en todos los anchos.
- [ ] Ambos botones muestran un anillo de foco visible al navegar con tabulador.

**i18n**

- [ ] Los 8 idiomas de `app/i18n/dictionaries.ts` contienen `header.donate` con los valores del Data model y `npx tsc --noEmit` pasa.

**Fuente y peticiones externas**

- [ ] La página no carga `cdnjs.buymeacoffee.com` ni ningún script externo de Buy me a coffee.
- [ ] La fuente Cookie se sirve desde el propio dominio, sin peticiones a `fonts.googleapis.com` ni `fonts.gstatic.com` en runtime.

**Responsive e impresión**

- [ ] A 375 px de ancho no hay scroll horizontal, la cabecera ocupa una sola fila y "WC SOS" no se parte, en los 8 idiomas.
- [ ] A 768 px y a 1024 px de ancho la cabecera ocupa una sola fila en los 8 idiomas.
- [ ] En la vista de impresión no aparecen los botones; el resto de la cabecera no cambia.

**Alcance acotado**

- [ ] El pie de página, `package.json` y `package-lock.json` no tienen cambios.

**Calidad del código**

- [ ] `npx tsc --noEmit`, `npm run lint` y `npm run build` terminan sin errores.

---

## Decisions

- **Sí:** botón de café nativo en React, no el script oficial de Buy me a coffee. El script inyecta el botón tras la hidratación (salto de layout), choca con `cacheComponents`, no se puede traducir ni corregir por dentro y producía una taza mal alineada. Con un `<a>` propio controlamos la alineación.
- **No:** cargar `button.prod.min.js` con `next/script` y parchear con CSS. Depende del DOM interno del script y se rompe si BMC lo cambia.
- **Sí:** replicar los parámetros del script como estilos fijos: `#FFDD00`, borde y texto `#000000`, fuente Cookie y emoji ☕.
- **Sí:** "Buy me a coffee" fijo en inglés, sin clave en los diccionarios. Es el nombre de la marca del servicio.
- **Sí:** "Donate" traducido en los 8 idiomas con `header.donate`. Es una palabra de interfaz y sirve también como `aria-label`.
- **Sí:** fuente Cookie con `next/font/google`. Next la descarga en el build y la sirve desde el propio dominio, sin peticiones a Google en runtime. Coste: un archivo de fuente pequeño extra.
- **Sí:** los botones salen de la hamburguesa y se quedan siempre visibles en la barra. Por debajo de `md`: café, PayPal y hamburguesa. Desde `md`: a la izquierda del selector de idioma.
- **Sí:** texto visible solo desde `lg` (1024 px). Es el mismo punto de corte que se eligió en otro proyecto, donde con `md` la cabecera saltaba a dos líneas; aquí se verifica en el paso 5 y los Risks.
- **Sí:** altura de 40 px (`h-10`), igual que el selector de idioma, en lugar de 42 px. Así solo hay que tocar la hamburguesa (36 → 40 px) y no los controles existentes.
- **Sí:** la hamburguesa pasa a 40×40 px pero mantiene `rounded-md`, a petición del usuario. Los botones nuevos, por debajo de `lg`, son círculos (`rounded-full`).
- **Sí:** SVG propio y simplificado de la "P" de PayPal, con los azules `#003087` y `#009cde`, definido dentro de `DonateButton.tsx`. No usamos el logo oficial con licencia ni el botón oficial de PayPal.
- **Sí:** colores fijos de marca en ambos botones, iguales en modo claro y oscuro.
- **Sí:** URLs en `app/lib/site.ts` como constantes. Un solo sitio donde cambiarlas.
- **Sí:** enlace de PayPal tal cual lo dio el usuario, incluido el `item_name` en inglés. Cambiarlo altera el texto que ve quien dona.
- **Sí:** nombres de archivo en PascalCase (`CoffeeButton.tsx`, `DonateButton.tsx`), igual que `Header.tsx` y `ThemeToggle.tsx`.
- **Sí:** impresión con una regla `@media print` y la clase `no-print` solo en los dos botones, en lugar de ocultar toda la cabecera. No existía ninguna regla de impresión en el proyecto.
- **No:** meter los botones en el panel desplegable o en el pie. Duplicaría los enlaces y no se pidió.
- **No:** analítica de clics. Si hace falta, va en su propia spec.
- **No:** tocar el pie de página ni la versión. La versión se sube en la release,.
- **Sí:** depender solo del esqueleto base.
- **Sí:** reescribir esta spec a partir de una copia de otro proyecto. Rutas, nombres y claves (`components/`, `lib/site.ts`, `MobileMenu.tsx`, diccionarios JSON, Fraunces) no existían aquí; se adaptaron al repo y el estado vuelve a `Draft`.

---

## Risks

| Riesgo                                                                                                                                                                                | Mitigación                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A 1024 px (justo en `lg`) la cabecera lleva marca, dos botones con texto, idioma y tema, y puede no caber en una fila; el `max-w-5xl` (1024 px) limita el contenido a ~992 px útiles. | Paso 5 y criterio a 1024 px. Si no cabe, subir el texto de los botones a `xl` (1280 px) o dejar solo el icono hasta `xl`. Se confirma con el usuario antes de aplicarlo. |
| A 375 px, marca, dos botones de 40 px y la hamburguesa de 40 px compiten por el espacio.                                                                                              | Paso 5 y criterio a 375 px. Reducir `gap` y `px`, o dejar que la marca se trunque con `truncate`, antes de quitar un botón.                                              |
| En desktop, el texto traducido de "Donate" es más largo en algunos idiomas (`fr`: "Faire un don", `ru`: "Пожертвовать") y empuja la cabecera.                                         | Probar los 8 idiomas en los pasos 4 y 5. Si alguno desborda, se aplica la misma mitigación del primer riesgo.                                                            |
| La fuente Cookie no carga (fallo del build o bloqueo) y el texto sale en la fuente por defecto.                                                                                       | `display: swap` y `fallback: ["cursive"]`. El botón sigue siendo legible; solo cambia el estilo.                                                                         |
| El emoji ☕ se dibuja distinto según el sistema (Apple, Windows, Android) y su alineación vertical varía entre plataformas.                                                           | `leading-none` e `inline-flex` con `items-center`. Verificar en Chrome y Safari. Plan B: sustituir el emoji por un SVG propio de taza.                                   |
| `ml-auto` en un contenedor con `justify-between` coloca mal el grupo de botones (centrado, o a la derecha de idioma y tema) en algún ancho.                                           | Paso 5: revisar a 375, 768, 1024 y 1280 px. Plan B: quitar `justify-between` y repartir el espacio con `ml-auto` solo en el primer grupo de controles.                   |
| Buy me a coffee o PayPal cambian la URL de sus páginas.                                                                                                                               | Las URLs están en `app/lib/site.ts`, un solo sitio donde actualizarlas.                                                                                                  |
| `next/font/google` necesita red en el build.                                                                                                                                          | Falla en el build, no en producción, y Vercel tiene red. En local sin red, el build avisa de forma explícita.                                                            |
| Los botones enlazan a servicios externos.                                                                                               | Son enlaces con `rel="noopener noreferrer"` que no cargan scripts ni envían datos de la app. Se comprueba en el paso 6.                                        |

---

## What is **not** in this spec

- El pie de página.
- Subir la versión del proyecto.
- El script oficial de Buy me a coffee (`button.prod.min.js`).
- Traducir "Buy me a coffee".
- Colores distintos en modo oscuro.
- Los botones en el panel desplegable o en el pie.
- Analítica de clics.
- El logo oficial de PayPal con licencia.
- Ocultar la cabecera entera al imprimir.

Cada uno de esos puntos, si se aborda, va en su propia spec.

# SPEC 06 — Landing multilingüe con acciones Explorar y SOS

> **Status:** Draft
> **Depends on:** SPEC 03, SPEC 04, SPEC 05 (esqueleto base: cabecera, pie e i18n)
> **Date:** 2026-11-16
> **Objective:** Construir la landing de `/[lang]` con titular, subtítulo y dos botones (Explorar y SOS directo) que cambian la vista de la página entre landing y mapa.

---

## Scope

**In:**

- **Componente `app/components/LandingHero.tsx`.** Titular, subtítulo y dos botones grandes: «Explorar baños cercanos» y «SOS: ruta al más cercano». Identidad visual propia (señalética de emergencia, ver `app/globals.css`): el botón SOS es el elemento memorable, en ámbar/azul de señal; Explorar es secundario.
- **Máquina de vista en cliente.** Componente `app/components/AppShell.tsx` con el estado `view: "landing" | "explore" | "sos"`, sin ruta nueva: la URL sigue siendo `/[lang]`. Botón «atrás» del navegador vuelve a la landing (`history.pushState` / `popstate`).
- **Destino provisional.** Hasta las SPEC 08 y 09, las vistas `explore` y `sos` muestran un bloque vacío con un botón «Volver». Es el punto de enganche de las specs siguientes.
- **i18n.** Claves nuevas en `app/i18n/dictionaries.ts`, en los 8 idiomas: `hero.title`, `hero.subtitle`, `hero.explore`, `hero.sos`, `common.back`.
- **SEO.** El `<h1>` es el titular; la landing sigue siendo renderizada en servidor (el estado de vista vive en un componente cliente hijo).
- **Accesibilidad.** Foco visible, botones de al menos 48 px de alto, `prefers-reduced-motion` respetado.

**Out of scope (para futuras specs):**

- El botón de instalación PWA (SPEC 07).
- El mapa, la lista y la ruta (SPEC 08 y 09).
- Secciones de contenido extra (FAQ, cómo funciona).
- Una ruta `/[lang]/map` propia.
- Analítica de clics.

---

## Data model

```ts
// app/components/AppShell.tsx
export type View = "landing" | "explore" | "sos";
```

No se persiste nada: la vista inicial es siempre `landing`.

---

## Implementation plan

1. **Claves i18n.** Añadir las 5 claves en los 8 idiomas. _Verificación:_ `tsc` falla si falta alguna (el tipo `Dict` lo exige).
2. **`LandingHero.tsx`.** Maquetar titular, subtítulo y botones con props `onExplore` y `onSos`. _Verificación:_ se ve a 375, 768 y 1280 px sin scroll horizontal, en los 8 idiomas.
3. **`AppShell.tsx`.** Estado `view`, `pushState` al salir de la landing y `popstate` para volver. Vista provisional con «Volver». _Verificación:_ Explorar y SOS cambian de vista; atrás del navegador vuelve a la landing.
4. **Integrar en `app/[lang]/page.tsx`.** Sustituir el `<main>` vacío por `<AppShell />` y mantener el `AdSlot` solo en la vista landing. _Verificación:_ `npm run build` y `npm run lint` sin errores.

---

## Acceptance criteria

- [ ] `/en`, `/es`, `/fr`, `/de`, `/pt`, `/zh`, `/ru`, `/ja` muestran titular, subtítulo y dos botones traducidos.
- [ ] El HTML servido contiene el `<h1>` (visible sin JavaScript).
- [ ] Pulsar Explorar o SOS cambia a la vista provisional; «Volver» y el botón atrás del navegador regresan a la landing.
- [ ] La URL no cambia de `/[lang]` en ningún momento.
- [ ] A 375 px no hay scroll horizontal y los botones miden ≥ 48 px de alto.
- [ ] Navegación completa por teclado con foco visible.
- [ ] `npm run build` y `npm run lint` pasan sin errores.

---

## Decisions

| Decisión                                  | Alternativa descartada | Motivo                                                                      |
| ----------------------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| Misma URL `/[lang]`, vista en estado      | Ruta `/[lang]/map`     | Una sola URL indexable por idioma; el mapa necesita cliente de todos modos. |
| Vista provisional en lugar de botones off | Botones deshabilitados | Deja el flujo navegable y fija el punto de enganche para SPEC 08/09.        |
| `pushState` propio                        | Router de Next         | Evita un render de servidor por un cambio de vista solo de cliente.         |

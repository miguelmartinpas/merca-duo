# SPEC 07 — Geolocalización y PWA instalable

> **Status:** Draft
> **Depends on:** SPEC 06
> **Date:** 2026-11-16
> **Objective:** Obtener la ubicación del usuario con la API nativa del navegador y permitir instalar la app en la pantalla de inicio como PWA.

---

## Scope

**In:**

- **Hook `app/lib/useGeolocation.ts`.** Expone `position`, `status` y `request()`. Usa `getCurrentPosition` con `enableHighAccuracy: true` y `timeout` de 10 s. La ubicación solo se pide cuando el usuario pulsa Explorar o SOS (nunca al cargar la página).
- **Estados y errores.** `idle | requesting | granted | denied | unavailable | timeout`. Cada error muestra un mensaje traducido con un botón «Reintentar»; `denied` explica cómo activar el permiso.
- **Manifest.** `app/manifest.ts` (`MetadataRoute.Manifest`): `name`, `short_name` «WC SOS», `start_url: "/"`, `display: "standalone"`, `theme_color` y `background_color` del diseño base.
- **Iconos.** `public/icons/icon-192.png`, `icon-512.png` y `icon-maskable-512.png`, generados a partir de `app/icon.svg`.
- **Botón de instalación.** `app/components/InstallButton.tsx` en la landing: captura `beforeinstallprompt` y llama a `prompt()`. En iOS Safari (sin ese evento) muestra instrucciones «Compartir → Añadir a pantalla de inicio». Se oculta si la app ya está instalada (`display-mode: standalone`).
- **i18n.** Claves `geo.*` e `install.*` en los 8 idiomas.

**Out of scope (para futuras specs):**

- Service worker y soporte offline (decisión cerrada: la app necesita red).
- Notificaciones push.
- Seguimiento continuo con `watchPosition` (SPEC 10).
- Guardar la última posición entre sesiones.

---

## Data model

```ts
// app/lib/types.ts
export interface Coords {
  lat: number;
  lng: number;
  accuracy?: number; // metros
}

export type GeoStatus =
  "idle" | "requesting" | "granted" | "denied" | "unavailable" | "timeout";
```

La posición no se guarda en `localStorage`: vive solo en memoria.

---

## Implementation plan

1. **Tipos y claves i18n.** Añadir `Coords`, `GeoStatus` y las claves en los 8 idiomas. _Verificación:_ `tsc` sin errores.
2. **`useGeolocation`.** Implementar el hook y mapear los códigos de `GeolocationPositionError`. _Verificación:_ en el navegador se pide permiso solo tras pulsar un botón; denegarlo muestra el mensaje.
3. **Conectar a la landing.** Explorar y SOS llaman a `request()` antes de cambiar de vista; si falla, se queda en la landing con el error. _Verificación:_ los 4 estados de error se ven al simularlos desde DevTools (Sensors).
4. **Manifest e iconos.** Crear `app/manifest.ts` y los PNG. _Verificación:_ DevTools → Application → Manifest sin avisos de instalabilidad.
5. **`InstallButton`.** Captura del evento, instrucciones iOS y ocultado en modo standalone. _Verificación:_ en Chrome aparece el botón y abre el diálogo; instalada, desaparece.

---

## Acceptance criteria

- [ ] No se solicita permiso de ubicación al cargar la página.
- [ ] Tras conceder el permiso, el hook devuelve `lat`, `lng` y `accuracy`.
- [ ] `denied`, `unavailable` y `timeout` muestran su mensaje traducido y permiten reintentar.
- [ ] `/manifest.webmanifest` responde y Lighthouse marca la app como instalable.
- [ ] El botón de instalación aparece en Chrome/Android, muestra instrucciones en iOS y no aparece en modo standalone.
- [ ] `npm run build` y `npm run lint` pasan sin errores.

---

## Decisions

| Decisión                          | Alternativa descartada   | Motivo                                                          |
| --------------------------------- | ------------------------ | --------------------------------------------------------------- |
| Pedir ubicación solo tras un clic | Pedirla al cargar        | Mejor tasa de aceptación y cumple las guías de permisos.        |
| Sin service worker                | Cachear el shell offline | Mapa, Overpass y OSRM necesitan red; el beneficio sería mínimo. |
| Posición solo en memoria          | `localStorage`           | Es un dato sensible y caduca enseguida.                         |

---

## Risks

| Riesgo                               | Impacto                     | Mitigación                                        |
| ------------------------------------ | --------------------------- | ------------------------------------------------- |
| La geolocalización exige HTTPS       | Falla en `dev:lan` por HTTP | Usar `npm run dev:https` para probar en el móvil. |
| iOS no dispara `beforeinstallprompt` | Sin diálogo de instalación  | Mostrar instrucciones manuales.                   |

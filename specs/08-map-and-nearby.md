# SPEC 08 — Mapa Leaflet y baños cercanos (Overpass)

> **Status:** Draft
> **Depends on:** SPEC 06, SPEC 07
> **Date:** 2026-11-16
> **Objective:** Mostrar un mapa Leaflet claro/oscuro con la posición del usuario, pines de baños y locales con aseo cercanos (Overpass) y una lista ordenada por distancia.

---

## Scope

**In:**

- **Dependencias.** `leaflet` y `react-leaflet` (+ `@types/leaflet`). Antes de escribir código, comprobar su compatibilidad con React 19.3 y Next 16 en la documentación instalada.
- **`app/components/MapaBanos.tsx`.** Mapa cargado con `next/dynamic` y `ssr: false`. Pin del usuario y pines personalizados (SVG propio, color de acento) para cada lugar. Teselas sin API key que cambian con el tema claro/oscuro.
- **`app/lib/overpass.ts`.** Consulta Overpass QL por radio alrededor de la posición: `amenity=toilets` y nodos/vías de `amenity=bar|restaurant|cafe|fast_food|pub` y `shop=convenience` con `toilets=yes`, más `amenity=fuel` con `toilets=yes`. Servidores en orden: `overpass-api.de`, luego `overpass.private.coffee` si el primero falla o supera 8 s.
- **Radio escalonado.** 1 km; si no hay resultados, 2 km y después 5 km.
- **Distancia.** Función Haversine en `app/lib/geo.ts`; resultados ordenados por distancia ascendente.
- **Lista de cercanos.** Bajo o sobre el mapa (según viewport) con nombre, tipo, distancia y accesibilidad/tarifa si el dato existe en OSM (`wheelchair`, `fee`). Tocar un elemento centra el mapa en él.
- **Atribución.** Texto «© OpenStreetMap contributors» visible en el mapa.
- **Estados.** Cargando, sin resultados, error de red (con «Reintentar»), todos traducidos. Claves `map.*` y `place.*` en los 8 idiomas.
- Sustituye la vista provisional `explore` de la SPEC 06.

**Out of scope (para futuras specs):**

- Rutas y panel inferior (SPEC 09).
- Seguimiento GPS (SPEC 10).
- Filtros por accesibilidad o tipo, y búsqueda por dirección.
- Caché de resultados Overpass entre sesiones.
- Alta o edición de baños en OSM.

---

## Data model

```ts
// app/lib/types.ts
export type PlaceKind = "toilets" | "venue";

export interface Place {
  id: string; // "node/123456789"
  kind: PlaceKind;
  name?: string;
  coords: Coords;
  distanceM: number; // Haversine desde el usuario
  wheelchair?: "yes" | "limited" | "no";
  fee?: boolean;
}
```

Convención: Leaflet usa `[lat, lng]`; las coordenadas internas son siempre `{ lat, lng }` y se convierten en el borde (ver SPEC 09 para OSRM).

---

## Implementation plan

1. **Instalar y validar dependencias.** Añadir Leaflet y react-leaflet; importar el CSS de Leaflet. _Verificación:_ `npm run build` pasa y un mapa vacío se renderiza sin errores de hidratación.
2. **`geo.ts` y `overpass.ts`.** Haversine, construcción de la consulta, fallback entre servidores y radio escalonado. _Verificación:_ prueba manual con una posición fija en una ciudad devuelve lugares ordenados; apagar el primer servidor (bloqueándolo en DevTools) usa el segundo.
3. **`MapaBanos`.** Mapa dinámico, teselas por tema, pines y atribución. _Verificación:_ cambiar el tema recarga las teselas adecuadas y no hay errores en consola.
4. **Lista de cercanos.** Ordenada, con foco y centrado del mapa al seleccionar. _Verificación:_ navegable por teclado y consistente con los pines.
5. **Estados y i18n.** Cargando, vacío y error. _Verificación:_ simular offline muestra el error con «Reintentar».
6. **Enganchar a la vista `explore`.** _Verificación:_ el flujo landing → ubicación → mapa funciona en los 8 idiomas.

---

## Acceptance criteria

- [ ] El mapa no se renderiza en servidor (sin errores de hidratación ni de `window`).
- [ ] Con ubicación concedida se ven el pin del usuario y los lugares del radio.
- [ ] La lista está ordenada por distancia ascendente y coincide con los pines.
- [ ] Si Overpass principal falla, la app usa el servidor de respaldo sin intervención.
- [ ] Sin resultados a 1 km, la app amplía a 2 km y luego a 5 km; si sigue vacío, muestra el estado vacío.
- [ ] Las teselas cambian entre claro y oscuro con el selector de tema.
- [ ] La atribución de OpenStreetMap es visible.
- [ ] `npm run build` y `npm run lint` pasan sin errores.

---

## Decisions

| Decisión                          | Alternativa descartada | Motivo                                                         |
| --------------------------------- | ---------------------- | -------------------------------------------------------------- |
| Baños + locales con `toilets=yes` | Solo `amenity=toilets` | En muchas zonas hay pocos baños públicos; los locales amplían. |
| Radio escalonado 1 → 2 → 5 km     | Radio fijo             | Respuesta rápida en ciudad y resultado útil en zonas rurales.  |
| Overpass con respaldo             | Un solo servidor       | El servidor público limita peticiones y cae a menudo.          |
| `{ lat, lng }` interno            | Arrays `[lat, lng]`    | Evita el error de orden con OSRM, que usa `[lng, lat]`.        |

---

## Risks

| Riesgo                                               | Impacto                   | Mitigación                                                                     |
| ---------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------ |
| Límites de uso de Overpass y de las teselas públicas | Errores 429 o bloqueo     | Una consulta por solicitud, `User-Agent`/`Referer` correctos, reintento único. |
| Datos de OSM incompletos o desactualizados           | Un baño listado no existe | Mostrar siempre enlace de respaldo a Google Maps (SPEC 09).                    |

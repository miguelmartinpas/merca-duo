# SPEC 09 — Ruta a pie (OSRM), panel inferior y SOS directo

> **Status:** Draft
> **Depends on:** SPEC 08
> **Date:** 2026-11-16
> **Objective:** Calcular y dibujar la ruta a pie hasta un baño con OSRM, mostrar distancia y tiempo en un panel inferior deslizante, y hacer que SOS trace en un toque la ruta al más cercano.

---

## Scope

**In:**

- **`app/lib/osrm.ts`.** Petición a `https://routing.openstreetmap.de/routed-foot/route/v1/foot/{lng},{lat};{lng},{lat}?overview=full&geometries=geojson`. Convierte `{ lat, lng }` a `lng,lat` para OSRM y la geometría GeoJSON devuelta a `[lat, lng]` para Leaflet. Devuelve `{ distanceM, durationS, path }`.
- **Polilínea de ruta** en `MapaBanos` (color de acento, grosor visible en ambos temas) y encuadre automático de usuario + destino.
- **`app/components/PanelInferior.tsx`.** Panel deslizante con nombre del destino, distancia, tiempo estimado y enlace «Abrir en Google Maps» (`https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&travelmode=walking`). Se puede plegar y desplegar; en escritorio se ancla abajo con ancho máximo.
- **Selección manual.** Tocar un lugar de la lista o un pin abre el panel y traza la ruta a ese destino.
- **SOS directo.** La vista `sos` obtiene ubicación, consulta Overpass (radio escalonado de la SPEC 08), toma los 3 más cercanos por Haversine, pide ruta OSRM a cada uno y traza la de menor distancia a pie. Sin pasos intermedios.
- **Estados y errores.** Calculando ruta, error de OSRM (cae al enlace de Google Maps y a la distancia en línea recta), sin lugares cercanos. Claves `route.*` y `sos.*` en los 8 idiomas.
- Sustituye la vista provisional `sos` de la SPEC 06.

**Out of scope (para futuras specs):**

- Seguimiento GPS y recálculo (SPEC 10).
- Instrucciones giro a giro.
- Otros modos de transporte.
- Servidor OSRM propio.

---

## Data model

```ts
// app/lib/types.ts
export interface Route {
  distanceM: number;
  durationS: number;
  path: [number, number][]; // [lat, lng] listo para Leaflet
}
```

Regla de coordenadas: a OSRM siempre `lng,lat`; a Leaflet siempre `[lat, lng]`. La conversión vive solo en `osrm.ts`.

---

## Implementation plan

1. **`osrm.ts`.** Cliente con conversión de coordenadas, `AbortController` y timeout de 8 s. _Verificación:_ una ruta de prueba devuelve distancia, tiempo y trazado coherentes.
2. **Polilínea y encuadre.** Pintar la ruta y ajustar el mapa. _Verificación:_ la línea sigue calles, no una recta, y se ve en claro y oscuro.
3. **`PanelInferior`.** Contenido, plegado/desplegado y enlace a Google Maps. _Verificación:_ operable por teclado y por táctil; el enlace abre la ruta a pie correcta.
4. **Selección desde lista/pin.** _Verificación:_ cambiar de destino cancela la petición anterior y actualiza el panel.
5. **Flujo SOS.** Ubicación → Overpass → 3 candidatos → OSRM → la más corta. _Verificación:_ un solo toque desde la landing termina con la ruta trazada y el panel abierto.
6. **Errores y i18n.** _Verificación:_ con OSRM bloqueado se ve el aviso, la distancia en línea recta y el enlace de Google Maps.

---

## Acceptance criteria

- [ ] Las peticiones a OSRM llevan `lng,lat` (se comprueba en la pestaña Red) y el trazado aparece en la ubicación correcta.
- [ ] El panel muestra distancia (m/km) y tiempo (min) y un enlace funcional a Google Maps.
- [ ] SOS traza una ruta con un solo toque, eligiendo la más corta a pie entre los 3 más cercanos.
- [ ] Cambiar de destino cancela la ruta anterior sin parpadeos ni rutas cruzadas.
- [ ] Si OSRM falla, la app sigue siendo usable con distancia en línea recta y enlace de respaldo.
- [ ] Todos los textos del panel y errores están traducidos en los 8 idiomas.
- [ ] `npm run build` y `npm run lint` pasan sin errores.

---

## Decisions

| Decisión                               | Alternativa descartada      | Motivo                                                                         |
| -------------------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| SOS compara 3 rutas reales a pie       | Elegir solo por línea recta | El más cercano en recta puede tener un camino largo; 3 llamadas es poco coste. |
| Fallback a Google Maps y línea recta   | Mostrar solo un error       | En una emergencia la app debe seguir dando una salida.                         |
| Conversión de coordenadas en `osrm.ts` | Convertir donde se use      | Un único punto evita el error clásico de orden `lat/lng`.                      |

---

## Risks

| Riesgo                                              | Impacto                      | Mitigación                                      |
| --------------------------------------------------- | ---------------------------- | ----------------------------------------------- |
| El servicio OSRM público tiene límites y puede caer | SOS sin ruta                 | Timeout, fallback y reintento único.            |
| Tres llamadas OSRM encadenadas alargan SOS          | Espera percibida en urgencia | Lanzarlas en paralelo con `Promise.allSettled`. |

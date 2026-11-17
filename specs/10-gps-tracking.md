# SPEC 10 — Seguimiento GPS en tiempo real

> **Status:** Draft
> **Depends on:** SPEC 09
> **Date:** 2026-11-16
> **Objective:** Seguir la posición del usuario con `watchPosition`, mover su marcador con fluidez y recalcular la ruta cuando se desplace más de 15 metros.

---

## Scope

**In:**

- **Botón de seguimiento** en `PanelInferior`: activa/desactiva el seguimiento, con estado visible (`aria-pressed`) y texto traducido.
- **`useGeolocation.watch()`** (ampliación del hook de la SPEC 07) basado en `watchPosition` con `enableHighAccuracy: true`; se cancela con `clearWatch` al desactivar, al volver a la landing y al desmontar.
- **Marcador fluido.** El pin del usuario se actualiza en cada lectura; el mapa lo sigue (re-centrado) mientras el seguimiento está activo y deja de seguirlo si el usuario arrastra el mapa, con un botón «Recentrar».
- **Recálculo de ruta.** Si la distancia (Haversine) entre la última posición usada para calcular y la actual supera 15 m, se pide una ruta OSRM nueva al mismo destino. Una sola petición en vuelo; las lecturas intermedias se descartan.
- **Llegada.** Al estar a menos de 20 m del destino, el panel muestra «Has llegado» y el seguimiento se detiene.
- **Errores.** Pérdida de señal o permiso revocado muestran aviso traducido sin romper la última ruta. Claves `track.*` en los 8 idiomas.

**Out of scope (para futuras specs):**

- Seguimiento con la pantalla apagada o en segundo plano.
- Navegación por voz y giro a giro.
- Orientación de la brújula del dispositivo.
- Historial de recorridos.

---

## Data model

```ts
// app/lib/types.ts
export type TrackingState = "off" | "on" | "arrived" | "lost";

// Estado interno del recálculo
interface RouteAnchor {
  at: Coords; // posición con la que se calculó la última ruta
  inFlight: boolean;
}
```

Constantes en `app/lib/geo.ts`: `RECALC_THRESHOLD_M = 15`, `ARRIVAL_THRESHOLD_M = 20`.

---

## Implementation plan

1. **`watch()` en el hook.** Alta, baja y limpieza garantizada. _Verificación:_ activar y desactivar no deja watchers vivos (se comprueba con logs temporales y simulando posiciones en DevTools → Sensors).
2. **Marcador y re-centrado.** Actualizar el pin y seguir/soltar el mapa. _Verificación:_ arrastrar el mapa detiene el seguimiento visual y aparece «Recentrar».
3. **Recálculo por umbral.** Comparar contra `RouteAnchor` y evitar peticiones solapadas. _Verificación:_ mover la posición 10 m no pide ruta; 20 m sí, y solo una a la vez.
4. **Llegada y errores.** Detectar a < 20 m y manejar pérdida de señal. _Verificación:_ el panel cambia a «Has llegado» y detiene el watch.
5. **Botón e i18n.** _Verificación:_ operable por teclado y traducido en los 8 idiomas.

---

## Acceptance criteria

- [ ] Activar el seguimiento mueve el marcador con cada lectura sin saltos visibles.
- [ ] Desplazamientos de ≤ 15 m no generan peticiones OSRM; > 15 m generan una nueva ruta.
- [ ] Nunca hay más de una petición de ruta en vuelo.
- [ ] Desactivar el seguimiento, volver a la landing o desmontar el mapa llama a `clearWatch`.
- [ ] Al llegar a < 20 m aparece «Has llegado» y se detiene el seguimiento.
- [ ] La pérdida de señal muestra un aviso y conserva la última ruta.
- [ ] `npm run build` y `npm run lint` pasan sin errores.

---

## Decisions

| Decisión                             | Alternativa descartada     | Motivo                                                      |
| ------------------------------------ | -------------------------- | ----------------------------------------------------------- |
| Umbral de 15 m para recalcular       | Recalcular en cada lectura | Cuida la cuota de OSRM público y la batería.                |
| Dejar de seguir al arrastrar el mapa | Re-centrar siempre         | No pelea con el gesto del usuario; «Recentrar» lo recupera. |
| Parar el seguimiento al llegar       | Dejarlo activo             | Ahorra batería y evita recálculos innecesarios.             |

---

## Risks

| Riesgo                                                      | Impacto                | Mitigación                                                       |
| ----------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------- |
| Lecturas GPS ruidosas disparan recálculos en parado         | Cuota OSRM y parpadeo  | Ignorar lecturas con `accuracy` > 50 m y exigir los 15 m reales. |
| Navegadores móviles pausan `watchPosition` en segundo plano | Seguimiento se detiene | Avisarlo en la UI; fuera de alcance en esta spec.                |

# Prompt / Plan de Proyecto: App Web de Emergencia para Buscar Baños (Multilingüe, Multi-tema & Footer)

Quiero desarrollar una aplicación web progresiva (PWA), ultrarrápida y optimizada para móviles en Next.js (App Router) y Tailwind CSS para encontrar baños públicos y establecimientos con aseo cercano en caso de emergencia.

⚠️ INSTRUCCIÓN DE DISEÑO CRÍTICA: No quiero que copies diseños existentes ni utilices la estética visual, tipografías o combinaciones de colores de otras webs del sector. Utiliza tu capacidad de diseño frontend (frontend-design) para crear una identidad visual propia, moderna, limpia y original, con una paleta de colores renovada (por ejemplo, tonos oscuros elegantes, un estilo minimalista-futurista de alta visibilidad, combinando acentos vibrantes de emergencia). Generarle su famicon y actulizarlo para que nest.js lo muestre

---

1. Pila Tecnológica & Internacionalización (Tech Stack & i18n)
- Framework: Next.js (App Router) + Tailwind CSS.
- Estructura de Rutas Multiidioma: Enrutamiento basado en prefijos de idioma obligatorios (/es, /en, /fr, /de, /ru, /zh, /ja, /pt) para asegurar SEO nativo independiente en cada idioma.
- SEO Internacional: Implementación de etiquetas hreflang y metadatos dinámicos traducidos (OpenGraph, Title, Description) para cada idioma soportado.
- Mapas: Leaflet (react-leaflet o Leaflet puro) con SSR desactivado (ssr: false).
- Teselas: Mapas limpios compatibles con modo claro y oscuro (sin API key).
- Datos: Overpass API de OpenStreetMap con servidores de fallback (overpass-api.de, overpass.private.coffee).
- Rutas: OSRM público (https://routing.openstreetmap.de/routed-foot/route/v1/foot/...) para calcular metros, minutos y dibujar la ruta a pie.
- Geolocalización: API nativa del navegador (getCurrentPosition + watchPosition) y soporte PWA.

---

2. Cabecera y Pie de Página (Header & Footer)
- Cabecera (Header) Desktop: Logo corporativo y nombre de la aplicación a la izquierda. A la derecha, selector desplegable de idioma (8 idiomas: es, en, fr, de, ru, zh, ja, pt) y selector de tema (Claro / Oscuro / Sistema).
- Cabecera (Header) Mobile: Logo y nombre a la izquierda. A la derecha solo un icono de menú hamburguesa que al pulsarlo despliega un panel con el selector de idioma y el selector de tema.
- Pie de Página (Footer): Discreto, limpio y adaptable al tema claro/oscuro, mostrando siempre el nombre de la aplicación y la versión actual (ej. "v1.0.0", leída dinámicamente desde package.json o una constante de configuración).

---

3. Flujo de Usuario y Landing Page
A. Landing Page:
- basada en https://meestoycagando.com/, pero no usemos nada de su diseño, solo la idea
- Titular multilingüe impactante y moderno adaptado a la ruta activa.
- Dos Botones principales: Botón de exploración (abre mapa y lista de cercanos) y Botón SOS Directo (traza la ruta al baño más cercano en un solo toque).
- Acceso rápido: Botón de instalación PWA en pantalla de inicio.

B. Vista de Mapa y Navegación:
- Mapa interactivo con pines personalizados.
- Panel inferior deslizante con distancia, tiempo, botón de seguimiento GPS en tiempo real y enlace de respaldo a Google Maps.

---

4. Estructura de Archivos en Next.js
- tomememos cono referencia la estructura que ya existe y añadamamos lo siguiente si no existe
- app/[lang]/layout.tsx: Layout global con soporte para atributos lang, metadatos SEO/hreflang, tema, Header y Footer.
- app/[lang]/page.tsx: Landing Page localizada según el parámetro [lang] y transición a la vista de mapa.
- components/Header.tsx: Cabecera responsive con logo, menú hamburguesa en móvil, selector de idioma y selector de tema.
- components/Footer.tsx: Pie de página con el nombre de la app y la versión actual.
- components/LandingHero.tsx: Interfaz de inicio con identidad original.
- components/MapaBanos.tsx: Mapa Leaflet adaptativo (claro/oscuro) y polilínea de ruta OSRM.
- components/PanelInferior.tsx: Panel de información de ruta y GPS.
- utils/overpass.ts: Lógica de consulta Overpass, Haversine y fallbacks.
- utils/osrm.ts: Peticiones de ruta peatonal y conversión de coordenadas.
- dictionaries/: Archivos de traducción JSON o TS independientes para cada uno de los 8 idiomas (es, en, fr, de, ru, zh, ja, pt).

---

5. Requisitos Técnicos Clave
1. Enrutamiento i18n por prefijos (/es, /en, etc.) obligatorio para indexación SEO correcta en buscadores.
2. Coordenadas en OSRM: Enviar siempre [longitud, latitud] a routing.openstreetmap.de (mientras Leaflet usa [latitud, longitud]).
3. Seguimiento GPS fluido: Actualizar el marcador y recalcular la ruta si el usuario se desplaza más de 15 metros.

---

6. Entregable Esperado
Por favor, utiliza tus herramientas de diseño frontend para concebir una interfaz visualmente rompedora y original, y genérame el código completo y funcional en Next.js (App Router) con Tailwind CSS, incluyendo el sistema de rutas multiidioma, la cabecera responsive, el pie de página con versión y listo para desplegar en Vercel.
## 06. Convenciones y Buenas Prácticas

### Código

- Nombres descriptivos (evitar abreviaciones crípticas).
- Utilizar helpers de `src/utils/helpers.ts` en lugar de duplicar lógica.
- Mantener componentes pequeños y reutilizables (Atomic Design).

### Estilos

- Estilos globales en `src/styles/global.css`.
- Variables del sistema en `src/styles/atoms/variables.css`.
- Estilos locales dentro del bloque `<style>` de cada `.astro` cuando aplique.

### Sistema de Diseño

- **Paleta de colores**: Utilizar las variables CSS definidas en `variables.css`
- **Colores principales**:
  - `--color-primary`: Jade (#00a878ff) para elementos principales
  - `--color-background`: Bone White (#f5f5f0) para fondos
  - `--color-surface`: Blanco puro para tarjetas y superficies
- **Efectos visuales**: Glassmorphism en navegación, sombras sutiles verdes
- **Animaciones**: Transiciones suaves de 0.2s, efectos hover elegantes

### Tipado

- Preferir TypeScript en utilidades y configuración.
- Evitar `any` y `as` innecesarios.

### Estructura de datos

- Centralizar reglas en `app.config.ts` (incluye `description` de Suramericana JI SAS).
- Acceder a `localStorage` mediante utilidades (`getStorageData`, `setStorageData`).
- Exportaciones PDF: reutilizar `jspdf` + `jspdf-autotable` en `src/utils/` (lista de precios, orden de compra).

### Commits

- Mensajes claros: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.

### Rendimiento

- Evitar cargar todo el catálogo en memoria si se implementan nuevas vistas: considerar paginación.
- Usar `debounce`/`throttle` en entradas de búsqueda intensivas.

### Seguridad

- No exponer datos personales reales.
- Revisar que el número WhatsApp productivo esté sólo en despliegues productivos.

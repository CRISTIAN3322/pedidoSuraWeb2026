## 05. Configuración

### Astro (`astro.config.mjs`)

```js
// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [react()],
  site: "https://sura-pedidos-web.vercel.app",
  vite: {
    optimizeDeps: {
      include: ["xlsx", "jspdf", "jspdf-autotable"],
    },
    ssr: {
      noExternal: ["xlsx", "jspdf", "jspdf-autotable"],
    },
  },
});
```

- Integra React para componentes interactivos (`CarteraGestion`, `ClienteSelectorReact`).
- `vite.optimizeDeps`: necesario para exportación Excel/PDF en desarrollo (`npm run dev`).
- `site`: dominio de producción.

### TypeScript (`tsconfig.json`)

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- Configuración estricta recomendada por Astro.

### Configuración de la app (`src/config/app.config.ts`)

- `name` / `description`: identidad de la app (`description`: *Sistema de gestión de pedidos para Suramericana JI SAS*; usado en layout y PDF).
- `schedule`: horario de atención y `timezone`.
- `whatsapp.number`: número para enlaces `wa.me` (p. ej. envío de pedido desde `carrito.astro`). Plantillas en `whatsapp.messageTemplate`.
- `currency`: `code`, `locale`, `symbol`.
- `inventory`: reglas de inventario.
- `portfolio`:
  - `warningDays` / `criticalDays`: colores y clasificación en tablas de cartera (p. ej. ≥11 y ≥30 días).
  - `blockDays`: umbral de **bloqueo al continuar** al catálogo; si alguna factura cumple `Number(dias) > blockDays`, se deshabilita el flujo en `ClienteSelectorReact.jsx` y en `ClienteSelectorTemplate.astro`.
- `ui`: paginación, límites y animaciones.
- `storage`: claves de `localStorage`.

Mantener estos valores como única fuente de verdad para reglas de negocio y UI.

### Sistema de Diseño

El proyecto utiliza un sistema de diseño basado en Atomic Design con una paleta de colores personalizada:

**Paleta de Colores**:

- **Primario**: Jade (#00a878ff) - Verde jade principal
- **Fondo**: Bone White (#f5f5f0) - Blanco suave y cálido
- **Secundario**: Earth Yellow (#f3c178ff) - Amarillo tierra
- **Accento**: Tomato (#fe5e41ff) - Naranja vibrante
- **Texto**: Smoky Black (#0b0500ff) - Negro ahumado

**Variables CSS** (`src/styles/atoms/variables.css`):

- Sistema completo de colores, tipografía, espaciado y sombras
- Breakpoints responsive y transiciones
- Estados de componentes y accesibilidad

### Página de inicio y comandos

- `npm run dev` levanta el servidor accesible en red local (`--host`).
- Vista local por defecto: `http://localhost:4321`.

### Dependencias de exportación

Instaladas en `package.json`:

- `xlsx` — archivos `.xlsx` (lista de precios)
- `jspdf` + `jspdf-autotable` — archivos `.pdf` (lista de precios y orden de compra en carrito)

Tras modificar `astro.config.mjs` o dependencias, reiniciar el servidor de desarrollo.

Ver también: [13-orden-compra-pdf.md](./13-orden-compra-pdf.md).

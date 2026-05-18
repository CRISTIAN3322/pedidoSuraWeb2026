# 12. Gestión de cartera y exportación de lista de precios

## Gestión de cartera (`/cartera`)

Página dedicada para consultar la cartera de facturas por vendedor, con control de acceso según rol.

### Acceso

- Menú: **📋 Cartera**
- Ruta: `/cartera`
- Requiere sesión activa (redirige a `/login` si no hay sesión)

### Roles

| Rol | Vista |
|-----|--------|
| **Administrador** | Todos los vendedores en acordeón, ordenados por facturas vencidas (≥30 días) y máximo de días |
| **Vendedor** | Solo su cartera asignada |

### Ordenamiento

- **Por vendedor:** más facturas vencidas primero, luego mayor `maxDias`, luego total de cartera.
- **Dentro de cada vendedor:** facturas ordenadas por `dias` descendente (más vencidas arriba).

### Filtros

- **Todas las facturas**
- **Solo vencidas** (≥ 30 días)
- **Por vencer** (11–29 días)

Las facturas se filtran por estado de días (todas / vencidas / por vencer), no por un campo `activo` en `cartera.json`.

### WhatsApp (solo administrador)

En cada vendedor con facturas vencidas (≥30 días), el botón **📱 Enviar WhatsApp** abre un mensaje al teléfono del vendedor (`vendedores.json`, campo `telefono`) con:

- Nombre del vendedor
- Por cada factura vencida: NIT, cliente, factura, fecha, valor, días

El mensaje se arma en `src/utils/carteraUtils.ts` (`buildWhatsAppMessage`, `buildWhatsAppUrl`).

### Archivos relacionados

| Archivo | Uso |
|---------|-----|
| `src/pages/cartera.astro` | Página |
| `src/components/organisms/CarteraGestion.jsx` | UI React |
| `src/utils/carteraUtils.ts` | Filtros, orden, WhatsApp |
| `src/pages/api/carteras.json.ts` | API agrupada por vendedor |
| `src/pages/api/vendedores-contacto.json.ts` | Teléfonos (sin contraseñas) |

---

## Exportación lista de precios (`/producto`)

Botones debajo del título **Catálogo de Productos** para descargar Excel o PDF.

### Acceso

- Ruta: `/producto`
- Componente: `src/components/molecules/ExportListaPrecios.astro`

### Columnas exportadas

Solo estas columnas (nombre de archivo: `lista_de_precios`):

| Campo | Descripción |
|-------|-------------|
| `codigo` | Código interno |
| `barra` | Código de barras |
| `nombre` | Nombre del producto |
| `subtotal` | Subtotal |
| `iva` | IVA (ej. 0.19) |
| `ipoconsumo` | Impoconsumo |
| `precioUnidad` | Precio por unidad |
| `precio` | Precio (despacho/caja según catálogo) |

### Filtro por proveedor

Usa el mismo selector **Filtrar por proveedor** del catálogo:

| Selector | Exportación |
|----------|-------------|
| **Todos** | Todos los productos **activos** |
| Proveedor específico | Solo activos de ese proveedor |

Los productos personalizados en `localStorage` (`customProducts`) se incluyen si están activos y coinciden con el proveedor.

### Formatos

- **Excel:** `lista_de_precios.xlsx` o `lista_de_precios_<PROVEEDOR>.xlsx`
- **PDF:** `lista_de_precios.pdf` (orientación horizontal, tabla con `jspdf-autotable`)

### Archivos relacionados

| Archivo | Uso |
|---------|-----|
| `src/utils/listaPreciosExport.ts` | Generación Excel/PDF |
| `src/pages/api/productos-export.json.ts` | Datos ligeros para export (sin imágenes) |
| `astro.config.mjs` | `optimizeDeps` para `xlsx`, `jspdf`, `jspdf-autotable` |

### Dependencias npm

```json
"xlsx": "^0.18.5",
"jspdf": "^4.2.1",
"jspdf-autotable": "^5.0.8"
```

### Solución de problemas (exportación)

| Error | Solución |
|-------|----------|
| `Failed to fetch dynamically imported module ... xlsx` | Reiniciar `npm run dev` tras cambios en `astro.config.mjs`. Los imports son **estáticos** en `listaPreciosExport.ts`. |
| No descarga nada | Recargar con Ctrl+F5. Verificar consola (F12). |
| Caché Vite | `Remove-Item -Recurse -Force node_modules\.vite` y `npm run dev` |

---

## APIs estáticas (build)

Generadas en `dist/api/` al hacer `npm run build`:

| Endpoint | Descripción |
|----------|-------------|
| `/api/carteras.json` | Cartera agrupada por vendedor |
| `/api/vendedores-contacto.json` | Contacto vendedores (rol, teléfono) |
| `/api/productos-export.json` | Campos mínimos para lista de precios |
| `/api/ventas.json` | Ventas por vendedor |
| `/api/datos-version.json` | Hashes para detectar cambios en datos |

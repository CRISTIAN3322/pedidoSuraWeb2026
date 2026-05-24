## 08. Componentes: Props y Ejemplos

### `layouts/BaseLayout.astro`
- Props:
  - `title?: string`
  - `description?: string`
  - `keywords?: string`
  - `showNavigation?: boolean` (default: `true`)
- Ejemplo de uso:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Catálogo" description="Lista de productos">
  <h1>Contenido</h1>
</BaseLayout>
```

### `organisms/ProductosSelector.astro`
- Props: N/A (lee datos internos y/o `products.json`).
- Comportamiento: agrega items al `localStorage.cartItems`.

### `organisms/ClienteSelector.astro`
- Props: N/A. Carga datos desde `clientes.json`, `cupo.json`, `cartera.json`.
- Resultado: persiste `datosCliente` en `localStorage` y navega (o permite navegar) a `/carrito` con parámetros.

### `organisms/ClienteSelectorReact.jsx`
- Props: N/A. Variante React para búsqueda con mayor interactividad.

### `organisms/BloqueoHorario.astro`
- Props: N/A. Usa `APP_CONFIG.schedule` y helpers para validar horario.

### `molecules/CarteraCliente.astro`
- Props esperadas:
  - `cartera: any[]`
  - `totalCartera: number`
  - `cupoDisponible: number`
  - `sinCupo: boolean`
- Ejemplo de uso:
```astro
---
import CarteraCliente from '../components/molecules/CarteraCliente.astro';
const cartera = [];
---
<CarteraCliente cartera={cartera} totalCartera={0} cupoDisponible={1000000} sinCupo={false} />
```

### `molecules/CupoCliente.astro`
- Props: relacionadas a cupo del cliente (ver componente para detalle).

### `molecules/Navigation.astro`
- Props: N/A. Renderiza navegación global.

### `molecules/ExportListaPrecios.astro`
- Props: N/A. Botones Excel/PDF; usa `#proveedorSelect` y `/api/productos-export.json`.
- Ver [12-gestion-cartera-y-exportacion.md](./12-gestion-cartera-y-exportacion.md).

### `pages/carrito.astro`
- Props de URL opcionales: `clienteId`, `clienteNombre`, `sucursalDireccion`, `sucursalVendedor`.
- Scripts: renderizado de carrito, WhatsApp (`#checkout`), PDF (`#download-pdf` → `exportOrdenCompraPdf`).
- Ver [13-orden-compra-pdf.md](./13-orden-compra-pdf.md).

### Helpers (`src/utils/helpers.ts`)
- `formatCurrency(amount: number): string`
- `formatNumber(num: number): string`
- `isValidEmail(email: string): boolean`
- `isValidPhone(phone: string): boolean`
- `debounce(func, wait)` / `throttle(func, limit)`
- `generateId()`
- `capitalizeWords(str: string)`
- `truncateText(text: string, maxLength: number)`
- `isBusinessHours()` / `getTimeUntilNextBusinessHour()`
- `getStorageData(key, defaultValue)` / `setStorageData(key, value)` / `removeStorageData(key)`


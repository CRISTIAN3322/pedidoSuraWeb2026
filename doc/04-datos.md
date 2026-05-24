## 04. Datos

### Fuentes
- `src/data/products.json`: catálogo de productos (~700 ítems).
- `src/data/clientes.json`: clientes e identificadores.
- `src/data/cartera.json`: facturas de cartera por cliente/vendedor.
- `src/data/cupo.json`: cupo de crédito por cliente.
- `src/data/vendedores.json`: credenciales, rol y teléfono para WhatsApp.
- `src/data/ventas.json`: ventas por vendedor y proveedor.

### Esquema: Producto (`products.json`)

```json
{
  "id": 1,
  "codigo": "JAL0001",
  "nombre": "NOMBRE DEL PRODUCTO",
  "subtotal": 2378,
  "iva": 0.19,
  "ipoconsumo": 0,
  "precioUnidad": 2830,
  "precio": 67916,
  "imagen": "../assets/toWEBP/7703207400248.webp",
  "barra": 7703207400248,
  "invetario": 960,
  "unidad": "unidad",
  "despacho": 1,
  "proveedor": "NOMBRE PROVEEDOR",
  "activo": true
}
```

**Exportación lista de precios:** solo `codigo`, `barra`, `nombre`, `subtotal`, `iva`, `ipoconsumo`, `precioUnidad`, `precio`, y únicamente registros con `activo: true`.

### Esquema: Cartera (`cartera.json`)

```json
{
  "id": 17077445,
  "cliente": "NOMBRE CLIENTE",
  "vendedor": "NOMBRE VENDEDOR",
  "fac": "SURA 53988",
  "fecha": "10/04/2026",
  "valor": 679747,
  "dias": 4,
  "nota": ""
}
```

- `id`: NIT / identificador del cliente.
- `dias`: días de vencimiento (positivo = vencido; negativo = por vencer).
- Umbrales UI: vencida ≥30, por vencer 11–29 (alineado con `ventas.astro` y `carteraUtils`).

### Esquema: Vendedor (`vendedores.json`)

```json
{
  "id": 52530962,
  "vendedor": "ANA SOFIA ROLDAN RIQUE",
  "pass": 52530962,
  "rol": "vendedor",
  "telefono": 3045428015
}
```

- `rol`: `"administrador"` | `"vendedor"`.
- `telefono`: usado para WhatsApp de cartera vencida (prefijo país 57 en `carteraUtils`).

### APIs generadas en build

| Ruta | Origen | Uso |
|------|--------|-----|
| `/api/carteras.json` | `cartera.json` | Cartera agrupada por vendedor |
| `/api/productos-export.json` | `products.json` | Export Excel/PDF |
| `/api/vendedores-contacto.json` | `vendedores.json` | Sin `pass` |
| `/api/ventas.json` | `ventas.json` | Página ventas |
| `/api/datos-version.json` | hashes de JSON | Toast de actualización |

### Acceso a datos
- Catálogo y cartera en cliente: fetch a APIs estáticas o import en build.
- Persistencia de pedido: `localStorage` (`cartItems`, `datosCliente`, `customProducts`).

### Claves de almacenamiento
Definidas en `APP_CONFIG.storage`:
- `cartKey` = `cartItems`
- `clientKey` = `datosCliente`
- `settingsKey` = `appSettings`
- `customProducts` = productos personalizados (local, no en JSON base)

### Formatos y utilidades
- Moneda: `helpers.formatCurrency(amount)` usa `Intl.NumberFormat('es-CO','COP')`.
- Números: `helpers.formatNumber(num)`.
- Cartera: `carteraUtils.ts`.
- Lista de precios: `listaPreciosExport.ts`.
- Orden de compra (carrito): `ordenCompraPdf.ts` lee `localStorage.cartItems` y `datosCliente`.

### Carrito (`localStorage.cartItems`)

Array de ítems con al menos: `codigo`, `nombre`, `precio`, `cantidad`.

### Cliente en pedido (`localStorage.datosCliente`)

Incluye `clienteNombre`, `clienteId`, `sucursalDireccion`, `sucursalVendedor`, `formaPago`, y datos de cartera/cupo cuando aplica.

### Consideraciones
- No subir datos personales reales a control de versiones.
- Actualizar `vendedores.json` con teléfonos reales por vendedor para WhatsApp de cartera.
- Tras cambiar JSON de datos, ejecutar `npm run build` y desplegar.

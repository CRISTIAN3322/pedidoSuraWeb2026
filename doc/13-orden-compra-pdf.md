# 13. Orden de compra en PDF (carrito)

Exportación de la orden de compra desde la página del carrito, con formato tipo factura.

## Acceso

- Ruta: `/carrito`
- Botón: **Descargar PDF** (junto a Seguir Comprando, Vaciar Carrito y Enviar Pedido)
- Requiere sesión activa y cliente seleccionado

## Contenido del PDF

| Sección | Datos incluidos |
|---------|-----------------|
| Encabezado | Nombre de la app (`APP_CONFIG.name`), descripción de Suramericana JI SAS |
| Título | **ORDEN DE COMPRA** |
| Metadatos | Número de orden (`OC-…`), fecha y hora de generación |
| Datos del pedido | Cliente, ID, dirección, vendedor, forma de pago |
| Detalle | Tabla: #, código, producto, cantidad, precio unitario, subtotal |
| Total | Recuadro destacado con el total del pedido (COP) |
| Observaciones | Texto del campo «Notas adicionales» del carrito (si existe) |
| Pie | Aviso de que no es factura electrónica; versión de la app |

## Requisitos

1. Al menos un producto en `localStorage.cartItems`
2. Cliente seleccionado (`datosCliente` en `localStorage` o datos visibles en `.datos-card`)

Si falta alguno, se muestra un `alert` y no se genera el archivo.

## Comportamiento

- **No vacía el carrito** ni borra `datosCliente` (a diferencia de «Enviar Pedido»)
- Nombre de archivo: `orden_compra_{clienteId}_{fecha}.pdf`
- Moneda: configuración `APP_CONFIG.currency` (`es-CO`, COP)

## Archivos relacionados

| Archivo | Uso |
|---------|-----|
| `src/utils/ordenCompraPdf.ts` | Generación del PDF (`exportOrdenCompraPdf`) |
| `src/pages/carrito.astro` | Botón y lectura de carrito / cliente / observaciones |
| `src/config/app.config.ts` | `name`, `description`, `version`, `currency` |

## Dependencias

Mismas que la lista de precios:

- `jspdf`
- `jspdf-autotable`

Configuradas en `astro.config.mjs` (`vite.optimizeDeps`).

## Ejemplo de uso programático

```typescript
import { exportOrdenCompraPdf } from '../utils/ordenCompraPdf';

exportOrdenCompraPdf({
  cliente: {
    clienteNombre: 'Cliente Ejemplo S.A.S.',
    clienteId: '900123456',
    sucursalDireccion: 'Calle 1 # 2-3',
    sucursalVendedor: 'JUAN PÉREZ',
    formaPago: 'Crédito 30 días',
  },
  items: [
    { codigo: 'JAL0001', nombre: 'Producto demo', precio: 10000, cantidad: 2 },
  ],
  observaciones: 'Entregar en bodega principal',
});
```

## Solución de problemas

| Problema | Solución |
|----------|----------|
| «El carrito está vacío» | Agregar productos antes de descargar |
| «Seleccione un cliente» | Completar flujo en `/principal` o `/` |
| PDF no descarga en dev | Reiniciar `npm run dev`; verificar consola (F12) |
| Error de módulo jspdf | Ver [12-gestion-cartera-y-exportacion.md](./12-gestion-cartera-y-exportacion.md) (misma configuración Vite) |

## Ver también

- [12. Gestión de cartera y exportación](./12-gestion-cartera-y-exportacion.md) — Excel/PDF lista de precios
- [05. Configuración](./05-configuracion.md) — `app.config.ts`

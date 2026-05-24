# 🛍️ Sura Pedidos Web v2.0

**Sistema de gestión de pedidos para Suramericana JI SAS**

Plataforma web para vendedores: selección de clientes, catálogo de productos, carrito, envío de pedidos por WhatsApp y gestión de cartera. Desarrollada con **Astro 6**, **React 19** y **Atomic Design**.

## ✨ Características principales

### Funcionalidades core

- **Autenticación**: Login con validación contra `vendedores.json` y sesión en `sessionStorage`
- **Selección de clientes**: Búsqueda, sucursales, cupo, cartera y forma de pago
- **Catálogo de productos**: Búsqueda, filtros por proveedor y agregar al carrito
- **Carrito**: Persistencia en `localStorage`, validación de cupo y envío por WhatsApp
- **Orden de compra en PDF**: Descarga desde `/carrito` con estilo de factura (cliente, dirección, vendedor, forma de pago, detalle y total)
- **Exportación lista de precios**: Excel y PDF desde `/producto` (solo productos activos, filtro por proveedor)
- **Gestión de cartera** (`/cartera`): Vista por vendedor, orden por días vencidos, WhatsApp a vendedores (admin)
- **Bloqueo por deudas**: Clientes con facturas que superan el umbral configurado no pueden continuar al catálogo
- **Bloqueo horario**: Control de horario de atención (5:00–18:00, zona `America/Bogota`)
- **Carga de imágenes**: Imágenes de productos en `localStorage` (base64)
- **Ventas** (`/ventas`): Consulta de datos de ventas por vendedor

### UI/UX

- Diseño responsive (móvil y escritorio)
- Navegación con contador de carrito
- Tema con variables CSS y componentes reutilizables
- Arquitectura Atomic Design (átomos, moléculas, organismos, plantillas)

## 🛠️ Tecnologías

| Tecnología | Uso |
|------------|-----|
| [Astro 6](https://astro.build/) | Framework y build estática |
| [React 19](https://react.dev/) | Componentes interactivos (cartera, selector de clientes) |
| [TypeScript 5](https://www.typescriptlang.org/) | Tipado en utilidades y configuración |
| [SheetJS (xlsx)](https://sheetjs.com/) | Exportación Excel |
| [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) | PDF lista de precios y orden de compra |
| Vercel | Hosting en producción |

## 📁 Estructura del proyecto

```
suraPedidosWeb/
├── src/
│   ├── components/           # Atomic Design
│   │   ├── atoms/
│   │   ├── molecules/        # Navigation, ExportListaPrecios, CarteraCliente, etc.
│   │   ├── organisms/        # ClienteSelectorReact, CarteraGestion, ProductosSelector
│   │   └── templates/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro       # Catálogo principal
│   │   ├── login.astro
│   │   ├── principal.astro   # Selección de clientes
│   │   ├── producto.astro    # Catálogo + exportación lista de precios
│   │   ├── carrito.astro     # Carrito, WhatsApp y PDF orden de compra
│   │   ├── ventas.astro
│   │   ├── cartera.astro
│   │   └── api/              # JSON en build estático
│   ├── data/                 # products, clientes, cartera, cupo, vendedores, ventas
│   ├── config/
│   │   └── app.config.ts     # Horarios, WhatsApp, moneda, umbrales de cartera
│   ├── hooks/
│   │   └── useClienteData.js
│   └── utils/
│       ├── auth.ts
│       ├── carteraUtils.ts
│       ├── listaPreciosExport.ts
│       ├── ordenCompraPdf.ts   # PDF orden de compra desde el carrito
│       ├── imageUtils.ts
│       └── atomic-design/deudaUtils.ts
├── public/assets/img_catalogo/
├── doc/                      # Documentación técnica
└── astro.config.mjs
```

## 🚀 Instalación y uso

### Prerrequisitos

- Node.js 18.0.0 o superior
- npm

### Pasos

```bash
git clone https://github.com/CRISTIAN3322/suraPedidosWeb.git
cd suraPedidosWeb
npm install
npm run dev
```

Abre **http://localhost:4321** (el dev server usa `--host` para acceso en red local).

### Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Vista previa de la build |
| `npm run lint` | Astro check |
| `npm run type-check` | Verificación TypeScript |
| `npm start` | Build + preview |

## 📋 Flujo de pedido

1. **Login** en `/login` con credenciales de vendedor
2. **Seleccionar cliente** en `/principal` (o flujo desde `/`)
3. Revisar **cupo y cartera**; si hay facturas vencidas por encima del umbral, el cliente queda bloqueado
4. Agregar productos desde el **catálogo**
5. En **Carrito** (`/carrito`):
   - Revisar ítems y notas
   - **Descargar PDF**: orden de compra con datos del cliente y detalle del pedido
   - **Enviar pedido**: abre WhatsApp con el mensaje formateado

## 📄 Orden de compra (PDF)

Desde el carrito, el botón **Descargar PDF** genera un documento con:

- Título **ORDEN DE COMPRA** y encabezado con nombre de la aplicación
- Cliente, ID, dirección, vendedor y forma de pago
- Tabla de productos (código, nombre, cantidad, precio unitario, subtotal)
- Total y observaciones (si las hay)
- Número de orden y fecha de generación

La lógica está en `src/utils/ordenCompraPdf.ts`. Requiere cliente seleccionado y al menos un producto en el carrito.

## 🔐 Autenticación

- Validación contra `src/data/vendedores.json`
- Sesión en `sessionStorage` (`vendedorSession`)
- Rutas protegidas redirigen a `/login` si no hay sesión

```typescript
import { isAuthenticated, getSession, logout } from './utils/auth';
```

## 🔒 Bloqueo por deudas

El umbral se define en `APP_CONFIG.portfolio.blockDays` (`src/config/app.config.ts`). Por defecto: **30 días**.

Si alguna factura cumple `Number(factura.dias) > blockDays`, el cliente no puede continuar al catálogo.

```typescript
import { APP_CONFIG } from './config/app.config';

const { blockDays } = APP_CONFIG.portfolio;
const clienteBloqueado = cliente.cartera?.some(
  (factura) => Number(factura.dias) > blockDays
);
```

| Situación | Resultado |
|-----------|-----------|
| Todas las facturas con `dias ≤ blockDays` | ✅ Puede pedir |
| Alguna factura con `dias > blockDays` | 🚫 Bloqueado |
| Sin cartera | ✅ Puede pedir |

Más detalle: [doc/10-guia-verificacion-deudas.md](doc/10-guia-verificacion-deudas.md).

## ⚙️ Configuración

Archivo central: `src/config/app.config.ts`

| Opción | Descripción |
|--------|-------------|
| `description` | Sistema de gestión de pedidos para Suramericana JI SAS |
| `schedule` | Horario permitido (5:00–18:00) |
| `whatsapp.number` | Número para envío de pedidos |
| `portfolio.blockDays` | Días de mora para bloquear cliente |
| `currency` | COP / `es-CO` |

## 🌐 Despliegue

- **Producción**: https://sura-pedidos-web.vercel.app
- **Build**: estática en `dist/`, compatible con Vercel u otro hosting estático

```bash
npm run build
npm run preview
```

## 📚 Documentación

| Recurso | Contenido |
|---------|-----------|
| [doc/README.md](doc/README.md) | Índice de documentación |
| [doc/01-guia-inicio.md](doc/01-guia-inicio.md) | Inicio y configuración |
| [doc/12-gestion-cartera-y-exportacion.md](doc/12-gestion-cartera-y-exportacion.md) | Cartera y exportaciones |
| [doc/10-guia-verificacion-deudas.md](doc/10-guia-verificacion-deudas.md) | Bloqueo por deudas |
| [BLOQUEO_HORARIO.md](BLOQUEO_HORARIO.md) | Bloqueo por horario |
| [CHANGELOG.md](CHANGELOG.md) | Historial de versiones |

## 🧪 Calidad

```bash
npm run type-check
npm run lint
npm run build
```

## 🤝 Contribución

1. Fork del repositorio
2. Rama feature: `git checkout -b feature/nueva-caracteristica`
3. Cambios y commit descriptivo
4. Push y Pull Request

Convenciones: Atomic Design, TypeScript donde aplique, commits en español, actualizar `doc/` si agregas funcionalidades relevantes.

## 📄 Licencia

MIT — ver detalle en el repositorio.

## ✉️ Contacto

**CCPOVEDA** — ccpoveda.programador@gmail.com

---

_Desarrollado para **Suramericana JI SAS** con Astro, React y Atomic Design_

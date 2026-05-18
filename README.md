# 🛍️ Sura Pedidos Web v2.0

Sistema web moderno para gestión de pedidos desarrollado con **Astro 5**, **React 19** y **Atomic Design**. Plataforma completa para la gestión de clientes, productos y pedidos con sistema de bloqueo automático por deudas.

## ✨ Características Principales

### 🎯 Funcionalidades Core

- **🔐 Sistema de Autenticación**: Login seguro con validación de vendedores
- **Catálogo de Productos**: Búsqueda avanzada y filtros por proveedor
- **Exportación lista de precios**: Excel y PDF desde `/producto` (solo productos activos, filtro por proveedor)
- **Gestión de Cartera** (`/cartera`): Vista por vendedor, orden por días vencidos, WhatsApp a vendedores (admin)
- **Gestión de Clientes**: Selección con información de cupo y cartera
- **Carrito Inteligente**: Persistencia local y validaciones
- **Sistema de Bloqueo**: Control de horarios de atención
- **🔒 Bloqueo por Deudas**: Control automático de clientes con facturas vencidas > 20 días
- **📷 Carga de Imágenes**: Sistema para cargar y gestionar imágenes de productos
- **Integración WhatsApp**: Envío automático de pedidos

### 🎨 Mejoras de UI/UX

- **Diseño Moderno**: Interfaz limpia y profesional
- **Responsive Design**: Optimizado para móviles y tablets
- **Navegación Intuitiva**: Menú sticky con contador de carrito
- **Animaciones Suaves**: Transiciones y efectos visuales
- **Tema Consistente**: Variables CSS y componentes reutilizables
- **Atomic Design**: Arquitectura escalable y mantenible

### ⚡ Optimizaciones Técnicas

- **Arquitectura Modular**: Componentes organizados por atomic design (Atoms, Molecules, Organisms, Templates, Pages)
- **TypeScript**: Tipado estático para mayor robustez
- **Configuración Centralizada**: Archivos de configuración y utilidades
- **Sistema de Sesiones**: Gestión de autenticación con sessionStorage
- **Gestión de Archivos**: Carga y almacenamiento de imágenes en base64
- **Performance**: Lazy loading y optimizaciones de carga
- **SEO Optimizado**: Meta tags y estructura semántica
- **Accesibilidad**: Cumple con estándares WCAG 2.1 AA

## 🛠️ Tecnologías

- **[Astro 6](https://astro.build/)** - Framework web moderno
- **[React 19](https://reactjs.org/)** - Componentes interactivos con hooks
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Tipado estático completo
- **CSS Variables** - Sistema de diseño consistente y personalizable
- **LocalStorage API** - Persistencia de datos del cliente
- **WhatsApp API** - Integración de mensajería automática
- **[SheetJS (xlsx)](https://sheetjs.com/)** - Exportación Excel
- **[jsPDF](https://github.com/parallax/jsPDF)** - Exportación PDF
- **Vercel** - Despliegue y hosting estático

## 📁 Estructura del Proyecto

```
suraPedidosWeb/
├── src/
│   ├── components/           # 🧩 Componentes Atomic Design
│   │   ├── atoms/            # 🧱 Componentes básicos indivisibles
│   │   │   ├── Button.astro    # Botones reutilizables con variantes
│   │   │   ├── Input.astro     # Campos de entrada estandarizados
│   │   │   ├── StatusBadge.astro # Indicadores de estado con colores
│   │   │   └── Icon.astro      # Iconos consistentes en toda la app
│   │   ├── molecules/        # 🔗 Combinaciones de átomos
│   │   │   ├── SearchInput.astro    # Campo de búsqueda con ícono
│   │   │   ├── CupoInfo.astro       # Información de cupo formateada
│   │   │   ├── CarteraTable.astro   # Tabla de facturas del cliente
│   │   │   ├── CarteraCliente.astro # Resumen de cartera del cliente
│   │   │   ├── ClienteInfo.astro    # Información del cliente seleccionado
│   │   │   ├── CupoCliente.astro    # Información de cupo del cliente
│   │   │   ├── SucursalList.astro   # Lista de sucursales
│   │   │   ├── Navigation.astro     # Navegación principal
│   │   │   ├── LoginForm.astro      # Formulario de autenticación
│   │   │   ├── ExportListaPrecios.astro # Exportar Excel/PDF lista de precios
│   │   │   ├── ImageUploader.astro  # Componente para carga de imágenes
│   │   │   └── ClienteResults.astro # Resultados de búsqueda
│   │   ├── organisms/        # 🏗️ Secciones funcionales completas
│   │   │   ├── ClienteSelector.astro      # Selector de clientes
│   │   │   ├── ClienteSelectorReact.jsx   # Lógica de selección React
│   │   │   ├── ProductosSelector.astro    # Selector de productos
│   │   │   ├── ProductCreator.astro       # Creación de productos
│   │   │   ├── CarteraGestion.jsx         # Gestión de cartera (admin/vendedor)
│   │   │   └── BloqueoHorario.astro       # Control de horarios
│   │   └── templates/        # 📄 Estructuras de página
│   │       └── ClienteSelectorTemplate.astro # Plantilla completa
│   ├── layouts/
│   │   └── BaseLayout.astro    # Layout base de la aplicación
│   ├── pages/                # 📋 Páginas de la aplicación
│   │   ├── index.astro         # Página principal (catálogo)
│   │   ├── login.astro         # Página de autenticación
│   │   ├── principal.astro     # Página de selección de clientes
│   │   ├── producto.astro      # Catálogo + exportación lista de precios
│   │   ├── carrito.astro       # Carrito de compras
│   │   ├── ventas.astro        # Ventas por vendedor
│   │   ├── cartera.astro       # Gestión de cartera
│   │   └── api/                # Endpoints API (build estático)
│   │       ├── ventas.json.ts
│   │       ├── carteras.json.ts
│   │       ├── productos-export.json.ts
│   │       ├── vendedores-contacto.json.ts
│   │       └── datos-version.json.ts
│   ├── data/                 # 📊 Datos de la aplicación
│   │   ├── products.json       # Catálogo de productos
│   │   ├── clientes.json       # Información de clientes
│   │   ├── cartera.json        # Facturas y deudas (15,004 líneas)
│   │   ├── cupo.json          # Cupos de crédito
│   │   ├── vendedores.json    # Información de vendedores
│   │   └── ventas.json        # Datos de ventas
│   ├── styles/               # 🎨 Estilos organizados
│   │   ├── global.css          # Estilos globales y variables CSS
│   │   └── atoms/
│   │       └── variables.css   # Variables del sistema de diseño
│   ├── config/
│   │   └── app.config.ts      # Configuración centralizada
│   ├── hooks/                # 🪝 Hooks personalizados
│   │   └── useClienteData.js   # Lógica de datos de clientes
│   └── utils/                # 🛠️ Utilidades y helpers
│       ├── helpers.ts          # Utilidades generales
│       ├── auth.ts             # Utilidades de autenticación y sesiones
│       ├── carteraUtils.ts     # Cartera, orden, WhatsApp vencidos
│       ├── listaPreciosExport.ts # Export Excel/PDF lista de precios
│       ├── imageUtils.ts       # Utilidades para manejo de imágenes
│       └── atomic-design/      # Lógica de negocio Atomic Design
│           └── deudaUtils.ts   # Utilidades para verificación de deudas
├── public/
│   └── assets/
│       └── img_catalogo/      # 🖼️ Imágenes de productos (629 archivos)
├── doc/                      # 📚 Documentación técnica completa
│   ├── 01-guia-inicio.md      # Guía de inicio y configuración
│   ├── 02-arquitectura.md     # Arquitectura del sistema
│   ├── 03-componentes.md      # Documentación de componentes
│   ├── 04-datos.md           # Estructura de datos
│   ├── 05-configuracion.md   # Configuración del proyecto
│   ├── 06-convenciones.md    # Convenciones y buenas prácticas
│   ├── 07-diagramas.md       # Diagramas del sistema
│   ├── 08-componentes-props.md # Props y ejemplos de componentes
│   ├── 09-arquitectura-atomic-design.md # Arquitectura Atomic Design
│   ├── 10-guia-verificacion-deudas.md   # Guía de bloqueo por deudas
│   ├── 11-ejemplos-codigo-verificacion-deudas.md # Ejemplos de código
│   ├── 12-gestion-cartera-y-exportacion.md # Cartera y lista de precios
│   └── README.md              # Índice de documentación
├── astro.config.mjs           # ⚙️ Configuración de Astro
├── tsconfig.json             # 🔧 Configuración de TypeScript
├── package.json              # 📦 Dependencias y scripts del proyecto
├── CHANGELOG.md              # 📋 Historial de cambios y versiones
├── BLOQUEO_HORARIO.md        # 🕒 Documentación del sistema de bloqueo
└── README.md                 # 📖 Este archivo
```

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18.0.0 o superior
- npm (o yarn/pnpm)

### Instalación

1. **Clona el repositorio:**

```bash
git clone https://github.com/CRISTIAN3322/suraPedidosWeb.git
cd suraPedidosWeb
```

2. **Instala las dependencias:**

```bash
npm install
```

3. **Inicia el servidor de desarrollo:**

```bash
npm run dev
```

4. **Abre tu navegador en:** `http://localhost:4321`

### Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo con host habilitado
npm run build      # Construir aplicación para producción
npm run preview    # Vista previa de la build local
npm run lint       # Verificar código con Astro Check
npm run type-check # Verificar tipos TypeScript
npm run clean      # Limpiar archivos generados y cache
npm start          # Build completo y preview en un comando
npm run astro      # Comando directo de Astro
```

## 🔐 Sistema de Autenticación

### Gestión de Sesiones

El sistema implementa un sistema de autenticación basado en sesiones del navegador:

- **Login**: Validación de credenciales contra `vendedores.json`
- **Sesión**: Almacenada en `sessionStorage` con información del vendedor
- **Protección de Rutas**: Todas las páginas principales verifican sesión activa
- **Cierre de Sesión**: Botón disponible en la navegación

### Flujo de Autenticación

1. Usuario accede a cualquier página protegida
2. Si no hay sesión, redirige a `/login`
3. Usuario ingresa ID y contraseña
4. Sistema valida contra `vendedores.json`
5. Si es válido, guarda sesión y redirige a `/principal`
6. Todas las páginas verifican sesión antes de renderizar

### Utilidades de Autenticación

```typescript
// Verificar si hay sesión activa
import { isAuthenticated, getSession, logout } from './utils/auth';

if (isAuthenticated()) {
  const session = getSession();
  console.log(`Usuario: ${session?.nombre}`);
}

// Cerrar sesión
logout();
```

## 📷 Sistema de Carga de Imágenes

### Características

El sistema permite cargar y gestionar imágenes de productos:

- **Formatos Soportados**: JPG, JPEG, PNG, GIF, WEBP, SVG, BMP, ICO
- **Tamaño Máximo**: 5MB por archivo
- **Almacenamiento**: LocalStorage con codificación base64
- **Vista Previa**: Visualización inmediata tras carga
- **Validación**: Verificación de tipo y tamaño antes de guardar

### Uso del Componente

```astro
---
import ImageUploader from '../components/molecules/ImageUploader.astro';
---

<ImageUploader productId="123" />
```

### Utilidades de Imágenes

```typescript
import { 
  saveProductImage, 
  getProductImage, 
  isValidImageFile 
} from './utils/imageUtils';

// Guardar imagen
saveProductImage(productId, imageData);

// Obtener imagen
const image = getProductImage(productId);

// Validar archivo
const validation = isValidImageFile(file);
```

## 🔒 Funcionalidad de Bloqueo por Deudas

### Sistema automático de control

El umbral lo define **`APP_CONFIG.portfolio.blockDays`** en `src/config/app.config.ts` (por defecto **80**). Si alguna factura cumple `Number(factura.dias) > blockDays`, el cliente **no puede continuar** al catálogo. La misma regla aplica en `ClienteSelectorReact.jsx` y `ClienteSelectorTemplate.astro`.

- 🚫 **Botón deshabilitado**: El botón "Continuar al Producto" se deshabilita automáticamente
- 📝 **Texto dinámico**: Cambia a "Cliente bloqueado por factura"
- 💬 **Mensaje explicativo**: Incluye el valor actual de `blockDays`
- 🎨 **Indicadores visuales**: Colores rojos y estados de error claros

### Cómo funciona

```typescript
import { APP_CONFIG } from "./config/app.config";

const { blockDays } = APP_CONFIG.portfolio;
const clienteBloqueado = cliente.cartera?.some(
  (factura) => Number(factura.dias) > blockDays
);
```

### Estados del sistema

| Facturas              | Condición                         | Estado        | Acción           |
| --------------------- | --------------------------------- | ------------- | ---------------- |
| Ninguna supera umbral | Todas con `dias ≤ blockDays`      | ✅ Habilitado | Permitir pedido  |
| Alguna supera umbral  | Existe `dias > blockDays`         | 🚫 Bloqueado  | Bloquear sistema |
| Sin cartera           | Sin facturas                      | ✅ Habilitado | Permitir pedido  |

### Proceso de Desbloqueo

1. **Identificar facturas** vencidas en la tabla de cartera
2. **Contactar al área de cartera** para regularización
3. **Actualizar datos** en el sistema
4. **Verificar desbloqueo** automático

## 📝 Componentes Principales

### Pages

#### login.astro

Página de autenticación del sistema. Características:

- Formulario de login con validación
- Validación contra archivo `vendedores.json`
- Gestión de sesiones con sessionStorage
- Redirección automática si ya hay sesión activa
- Diseño responsive y accesible

#### index.astro

Página principal que muestra el catálogo de productos disponibles. Incluye:

- Protección de ruta (requiere autenticación)
- Encabezado con información de actualización
- Selector de clientes con funcionalidad de búsqueda
- Información de cupo y cartera del cliente
- Sistema de bloqueo automático por deudas
- Navegación al catálogo de productos

#### carrito.astro

Página del carrito de compras donde se pueden gestionar los productos seleccionados.

#### ventas.astro

Página de ventas con acceso a datos de ventas y endpoints API (`/api/ventas.json`, `/api/carteras.json`).

#### producto.astro

Catálogo completo con `ProductosSelector` y botones **Exportar Excel / PDF** (`ExportListaPrecios`). Respeta el filtro de proveedor y solo exporta productos activos.

#### cartera.astro

Gestión de cartera con `CarteraGestion` (React). Administradores ven todos los vendedores y pueden enviar WhatsApp con facturas vencidas; vendedores solo ven su cartera.

Ver [doc/12-gestion-cartera-y-exportacion.md](doc/12-gestion-cartera-y-exportacion.md).

### Components

#### ClienteSelectorReact.jsx

**Organismo principal** que maneja toda la lógica de selección de clientes:

- 🔍 **Búsqueda avanzada** por nombre o ID
- 👤 **Selección de cliente** con información completa
- 🏢 **Selección de sucursal** con detalles del vendedor
- 💰 **Información de cupo** y cartera actualizada
- 🚫 **Bloqueo automático** por facturas vencidas
- 📊 **Tabla de facturas** con estados visuales

#### ProductosSelector.astro

Componente que maneja la visualización y selección de productos disponibles.

### Molecules

#### LoginForm.astro

Formulario de autenticación que valida credenciales contra el archivo `vendedores.json`:

- Validación de ID de vendedor y contraseña
- Manejo de errores con mensajes descriptivos
- Almacenamiento de sesión en sessionStorage
- Redirección automática tras login exitoso
- Diseño responsive y accesible

#### ImageUploader.astro

Componente para cargar imágenes de productos:

- Soporte para múltiples formatos (JPG, PNG, GIF, WEBP, SVG, BMP, ICO)
- Vista previa de imágenes
- Validación de tipo y tamaño de archivo (máx. 5MB)
- Almacenamiento en localStorage con base64
- Integración con utilidades de manejo de imágenes

### Arquitectura Atomic Design

#### Átomos (Atoms) 🧱

- **Button.astro**: Botones reutilizables con variantes
- **Input.astro**: Campos de entrada estandarizados
- **StatusBadge.astro**: Indicadores de estado con colores
- **Icon.astro**: Iconos consistentes en toda la app

#### Moléculas (Molecules) 🔗

- **SearchInput.astro**: Campo de búsqueda con ícono
- **CupoInfo.astro**: Información de cupo formateada
- **CupoCliente.astro**: Información de cupo del cliente
- **CarteraTable.astro**: Tabla de facturas del cliente
- **CarteraCliente.astro**: Resumen de cartera del cliente
- **ClienteInfo.astro**: Información del cliente seleccionado

#### Plantillas (Templates) 📄

- **ClienteSelectorTemplate.astro**: Estructura completa de la página de selección

## 🎨 Estilos

El proyecto utiliza CSS modular con estilos específicos para cada componente y estilos globales en `global.css`.

## Despliegue

- Sitio: https://sura-pedidos-web.vercel.app
- Build estática (`dist/`) apta para Vercel u hosting estático

## 🤝 Contribución

Si deseas contribuir al proyecto:

1. Haz un Fork del repositorio
2. Crea una nueva rama (`git checkout -b feature/nueva-caracteristica`)
3. Realiza tus cambios
4. Haz commit de tus cambios (`git commit -m 'Agrega nueva característica'`)
5. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
6. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📚 Documentación

### 📋 Historial de Versiones

- **[CHANGELOG.md](CHANGELOG.md)**: Historial completo de cambios y nuevas funcionalidades

### 🚀 Guías Técnicas

- **[Guía de Inicio](doc/01-guia-inicio.md)**: Configuración inicial y primeros pasos
- **[Arquitectura Atomic Design](doc/09-arquitectura-atomic-design.md)**: Documentación completa de la arquitectura de componentes
- **[Guía de Verificación de Deudas](doc/10-guia-verificacion-deudas.md)**: Manual completo del sistema de bloqueo por deudas
- **[Gestión de cartera y exportación](doc/12-gestion-cartera-y-exportacion.md)**: Página `/cartera`, WhatsApp, Excel/PDF
- **[Sistema de Bloqueo Horario](BLOQUEO_HORARIO.md)**: Documentación del control de horarios

### 📖 Recursos Adicionales

- **Documentación Técnica**: Ver [doc/README.md](doc/README.md) para índice completo
- **Diseño de Sistema**: Variables CSS y componentes reutilizables
- **Casos de Uso**: Ejemplos prácticos de implementación
- **Mejores Prácticas**: Guías para desarrollo y mantenimiento
- **Solución de Problemas**: Troubleshooting común

## 🧪 Testing y Calidad

### Estrategias de Testing

- **Componentes Unitarios**: Cada átomo y molécula testeable independientemente
- **Integración**: Flujos completos de usuario
- **Accesibilidad**: Validación WCAG 2.1 AA
- **Performance**: Métricas de carga y optimización

### Comandos de Testing

```bash
npm run type-check  # Verificar tipos TypeScript
npm run lint        # Verificar código (astro check)
npm run build       # Verificar build de producción
```

## 🚀 Despliegue

### Entornos

- **Desarrollo**: `http://localhost:4321` (npm run dev)
- **Producción**: https://sura-pedidos-web.vercel.app
- **Build**: `dist/` - Build estática optimizada para hosting estático

### Configuración de Producción

```bash
npm run build      # Construir para producción
npm run preview    # Vista previa local de la build
```

### Características del Despliegue

- **Hosting**: Vercel con despliegue automático desde GitHub
- **Build**: Estática optimizada con Astro
- **Performance**: Lazy loading y optimizaciones automáticas
- **SEO**: Meta tags y estructura semántica incluida

## 🤝 Contribución

Si deseas contribuir al proyecto:

1. Haz un Fork del repositorio
2. Crea una nueva rama (`git checkout -b feature/nueva-caracteristica`)
3. Realiza tus cambios
4. Haz commit de tus cambios (`git commit -m 'Agrega nueva característica'`)
5. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
6. Abre un Pull Request

### Estándares de Código

- **Atomic Design**: Seguir la arquitectura de componentes establecida
- **TypeScript**: Tipado estricto en todos los archivos
- **CSS**: BEM methodology para clases
- **Commits**: Mensajes descriptivos y en español
- **Documentación**: Actualizar guías cuando se agreguen características

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## ✉️ Contacto

**CCPOVEDA** — ccpoveda.programador@gmail.com

**Documentación técnica ampliada**: `doc/`

---

_Desarrollado con ❤️ usando Astro, React y Atomic Design_

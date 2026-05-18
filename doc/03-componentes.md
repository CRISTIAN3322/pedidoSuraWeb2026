## 03. Componentes

Estructurados según Atomic Design. A continuación, un mapa funcional de los principales.

### Layouts

- `layouts/BaseLayout.astro`: layout base. Inyecta `global.css`, SEO, `Navigation` y `<slot/>`.

### Molecules

- `molecules/Navigation.astro`: 
  - Navegación principal con información de usuario logueado
  - Botón de cierre de sesión
  - Contador de productos en carrito
  - Diseño glassmorphism responsive

- `molecules/LoginForm.astro`: 
  - Formulario de autenticación con validación de credenciales
  - Validación contra archivo `vendedores.json`
  - Manejo de errores y estados de carga
  - Almacenamiento de sesión en sessionStorage
  - Diseño responsive y accesible

- `molecules/ImageUploader.astro`: 
  - Componente para carga de imágenes de productos
  - Soporte para múltiples formatos (JPG, PNG, GIF, WEBP, SVG, BMP, ICO)
  - Validación de tipo y tamaño (máx. 5MB)
  - Vista previa de imágenes
  - Almacenamiento en localStorage con base64
  - Props: `productId` (opcional)

- `molecules/CarteraCliente.astro`: muestra cartera, cupo y estado del cliente.
- `molecules/CupoCliente.astro`: desglosa cupo disponible.

- `molecules/ExportListaPrecios.astro`:
  - Botones **Exportar Excel** y **Exportar PDF** (lista de precios).
  - Usa el filtro `#proveedorSelect` del catálogo (Todos = todos los activos).
  - Datos desde `/api/productos-export.json` + productos personalizados en `localStorage`.
  - Lógica en `utils/listaPreciosExport.ts` (xlsx, jspdf).

### Organisms

- `organisms/ProductosSelector.astro`:
  - Fuente: `src/data/products.json` (catálogo grande).
  - Render: tarjetas/lista de productos, buscador y filtros.
  - Acción: agrega al carrito usando `localStorage.cartItems`.

- `organisms/ClienteSelector.astro` y `ClienteSelectorReact.jsx`:
  - Fuente: `src/data/clientes.json`, `cartera.json`, `cupo.json`.
  - Acción: persiste `datosCliente` en `localStorage` y redirige a `/carrito` con query params.

- `organisms/BloqueoHorario.astro`:
  - Lógica: lee horario de `APP_CONFIG.schedule` o `helpers.isBusinessHours()`.
  - Comportamiento: bloquea UI fuera de horario y muestra tiempo restante.

- `organisms/CarteraGestion.jsx` (React, `client:load` en `/cartera`):
  - **Admin:** acordeón por vendedor, estadísticas, tabla de facturas, WhatsApp de cartera vencida.
  - **Vendedor:** solo su cartera.
  - Filtros: todas / vencidas (≥30) / por vencer (11–29).
  - APIs: `/api/carteras.json`, `/api/vendedores-contacto.json`.

### Pages

- `pages/login.astro`:
  - Página de autenticación del sistema
  - Redirige a `/principal` si ya hay sesión activa
  - Integra el componente `LoginForm`

- `pages/index.astro`:
  - Página principal (catálogo de productos)
  - Protección de ruta (requiere autenticación)
  - Incluye selector de clientes y bloqueo horario

- `pages/principal.astro`:
  - Página de selección de clientes
  - Protección de ruta (requiere autenticación)
  - Incluye selector de clientes completo

- `pages/producto.astro`:
  - Catálogo de productos (`ProductosSelector`)
  - Exportación lista de precios (`ExportListaPrecios`)

- `pages/cartera.astro`:
  - Gestión de cartera (`CarteraGestion`)

- `pages/ventas.astro`:
  - Ventas por vendedor y mes; integra datos de `/api/carteras.json`

### Utilidades

- `utils/auth.ts`:
  - Funciones para gestión de autenticación
  - `isAuthenticated()`: verifica sesión activa
  - `getSession()`: obtiene datos de sesión
  - `logout()`: cierra sesión y redirige
  - `protectRoute()`: protege rutas

- `utils/imageUtils.ts`:
  - Funciones para manejo de imágenes
  - `saveProductImage()`: guarda imagen de producto
  - `getProductImage()`: obtiene imagen guardada
  - `isValidImageFile()`: valida archivo de imagen
  - `fileToBase64()`: convierte archivo a base64

- `utils/carteraUtils.ts`:
  - Filtros y orden de cartera por días vencidos
  - Mensaje y URL de WhatsApp para cartera vencida (≥30 días)

- `utils/listaPreciosExport.ts`:
  - `exportListaPreciosExcel()` / `exportListaPreciosPdf()`
  - Solo productos activos; columnas: código, barra, nombre, subtotal, iva, ipoconsumo, precioUnidad, precio

### Props y convenciones

- Props opcionales de `BaseLayout`:
  - `title`, `description`, `keywords`, `showNavigation`.

### Estilos

- Global: `src/styles/global.css`.
- Variables del sistema: `src/styles/atoms/variables.css`.
- Componentes: estilos locales dentro de cada `.astro` según necesidad.

### Paleta de Colores Actual

- **Jade** (#00a878ff) - Color primario verde jade
- **Mindaro** (#d8f1a0ff) - Verde claro para fondos
- **Earth Yellow** (#f3c178ff) - Amarillo tierra para elementos secundarios
- **Tomato** (#fe5e41ff) - Naranja/tomate para acentos y danger
- **Smoky Black** (#0b0500ff) - Negro ahumado para texto
- **Bone White** (#f5f5f0) - Blanco suave para fondos

### Diseño Visual

- **Fondo principal**: Blanco suave (bone-white) para una apariencia cálida y elegante
- **Navegación**: Diseño glassmorphism con fondo verde jade semi-transparente
- **Efectos**: Sombras verdes sutiles, gradientes y efectos blur para modernidad
- **Tarjetas**: Bordes delicados y efectos hover suaves

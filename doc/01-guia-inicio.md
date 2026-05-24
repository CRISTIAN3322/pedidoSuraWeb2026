# 🚀 01. Guía de Inicio

## 📋 Prerrequisitos
- **Node.js:** 18.0.0 o superior
- **npm:** 9+ (o yarn/pnpm si prefieres)
- **Memoria:** >= 4GB recomendada (catálogo de imágenes extenso)
- **Almacenamiento:** >= 1GB (imágenes y datos)

## ⚙️ Instalación

```bash
git clone https://github.com/CRISTIAN3322/suraPedidosWeb.git
cd suraPedidosWeb
npm install
```

## 🔧 Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo con host habilitado
npm run build      # Construcción para producción
npm run preview    # Vista previa de la build local
npm run lint       # Revisión estática con Astro Check
npm run type-check # Verificación de tipos TypeScript
npm run clean      # Limpieza de artefactos generados y cache
npm start          # Build completo y preview en un comando
npm run astro      # Comando directo de Astro
```

## 🔧 Configuración

### Variables de Entorno
Actualmente el proyecto no requiere variables sensibles. La configuración general está en `src/config/app.config.ts` (incluye `whatsapp.number`, `portfolio.blockDays` para bloqueo por cartera en la selección de cliente, y umbrales `warningDays` / `criticalDays` para tablas).

### Requisitos del Sistema
- **Memoria:** >= 4GB recomendada (catálogo de 629 imágenes)
- **Almacenamiento:** >= 1GB (imágenes y datos JSON)
- **Navegador:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🚀 Estructura Básica de Ejecución

1. **Iniciar servidor:** `npm run dev`
2. **Abrir navegador:** `http://localhost:4321`
3. **Flujos principales:**
   - 🔐 **Login** (`/login`)
   - 👤 **Selección de cliente** (`/principal`)
   - 📦 **Catálogo de productos** (`/producto`) — incluye exportar lista de precios (Excel/PDF)
   - 🛒 **Carrito de compras** (`/carrito`) — envío WhatsApp y **descarga PDF** (orden de compra)
   - 💰 **Ventas** (`/ventas`)
   - 📋 **Gestión de cartera** (`/cartera`) — admin ve todo; vendedor solo su cartera
   - 📱 **Envío por WhatsApp** (pedidos y avisos de cartera vencida)

Documentación de exportaciones: [12-gestion-cartera-y-exportacion.md](./12-gestion-cartera-y-exportacion.md) (lista de precios), [13-orden-compra-pdf.md](./13-orden-compra-pdf.md) (carrito).

## 🌐 Despliegue

- **Hosting:** Plataformas estáticas (Vercel recomendado)
- **Build:** `npm run build` genera `dist/`
- **URL Producción:** https://sura-pedidos-web.vercel.app

## 🔧 Solución de Problemas

| Problema | Solución |
|----------|----------|
| **Puerto ocupado** | `astro dev --host --port 4322` |
| **Errores TypeScript** | `npm run type-check` |
| **Caché corrupto** | `npm run clean` + reinstalar dependencias |
| **Caché Vite (export Excel)** | Borrar `node_modules/.vite` y reiniciar `npm run dev` |
| **Imágenes no cargan** | Verificar `public/assets/img_catalogo/` |
| **Sistema bloqueado** | Verificar horario (5:00 AM - 6:00 PM) |
| **Exportación no descarga** | Ver [12-gestion-cartera-y-exportacion.md](./12-gestion-cartera-y-exportacion.md) |

## 📞 Soporte

- **Desarrollador:** CCPOVEDA
- **Email:** ccpoveda.programador@gmail.com
- **Documentación:** Ver carpeta `doc/` para más detalles


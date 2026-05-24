# 📚 Documentación Técnica: Sura Pedidos Web v2.0

**Sistema de gestión de pedidos para Suramericana JI SAS**

Bienvenido a la documentación técnica y funcional del proyecto. Aquí encontrarás guías para instalar, ejecutar, mantener y evolucionar la aplicación.

## 📋 Índice de Documentación

### 🚀 Guías de Inicio
- [01. Guía de inicio](./01-guia-inicio.md) - Configuración inicial y primeros pasos
- [05. Configuración](./05-configuracion.md) - Configuración del proyecto y entorno

### 🏗️ Arquitectura y Diseño
- [02. Arquitectura](./02-arquitectura.md) - Arquitectura general del sistema
- [09. Arquitectura Atomic Design](./09-arquitectura-atomic-design.md) - Diseño de componentes atómicos
- [07. Diagramas](./07-diagramas.md) - Diagramas del sistema y flujos

### 🧩 Componentes y Desarrollo
- [03. Componentes](./03-componentes.md) - Documentación de componentes
- [08. Componentes: Props y ejemplos](./08-componentes-props.md) - Props y ejemplos de uso
- [06. Convenciones y buenas prácticas](./06-convenciones.md) - Estándares de desarrollo

### 📊 Datos y Configuración
- [04. Datos](./04-datos.md) - Estructura y manejo de datos

### 🔒 Funcionalidades Especiales
- [10. Guía de verificación de deudas](./10-guia-verificacion-deudas.md) - Bloqueo por cartera (`APP_CONFIG.portfolio.blockDays`)
- [11. Ejemplos de código - Verificación de deudas](./11-ejemplos-codigo-verificacion-deudas.md) - Ejemplos prácticos
- [12. Gestión de cartera y exportación](./12-gestion-cartera-y-exportacion.md) - `/cartera`, WhatsApp, Excel/PDF lista de precios
- [13. Orden de compra en PDF](./13-orden-compra-pdf.md) - Descarga PDF desde `/carrito`
- [Guía de Bloqueo de Horario](../BLOQUEO_HORARIO.md) - Sistema de control horario

### 🔐 Seguridad y Autenticación
- **Sistema de Login**: Validación de credenciales contra `vendedores.json`
- **Protección de Rutas**: Verificación de sesión en páginas principales
- **Gestión de Sesiones**: Almacenamiento seguro en sessionStorage

## ⚡ Información Rápida

| Aspecto | Detalles |
|---------|----------|
| **Empresa** | Suramericana JI SAS |
| **Framework** | Astro 6 + React 19 |
| **Lenguaje** | TypeScript 5.0 / JavaScript |
| **Requisitos** | Node.js >= 18.0.0 |
| **Build** | Estática optimizada |
| **Hosting** | Vercel |

### 🔧 Comandos Clave

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build para producción
npm run preview    # Vista previa local
npm run lint       # Verificación de código
npm run type-check # Verificación de tipos
```

## 🎨 Características del Diseño

### Sistema de Diseño
- **Paleta de colores personalizada**: Verde jade, blanco suave, amarillo tierra
- **Navegación glassmorphism**: Efectos modernos con fondo verde semi-transparente
- **Diseño responsivo**: Optimizado para móviles y desktop
- **Accesibilidad**: Alto contraste y focus visible
- **Sistema de diseño atómico**: Componentes reutilizables y consistentes

### Arquitectura de Componentes
- **Atoms**: Componentes básicos (Button, Input, Icon, StatusBadge)
- **Molecules**: Combinaciones de átomos (SearchInput, CupoInfo, CarteraTable)
- **Organisms**: Secciones completas (ClienteSelector, ProductosSelector)
- **Templates**: Estructuras de página (ClienteSelectorTemplate)

## 🔗 Enlaces Útiles

- **Sitio en producción**: https://sura-pedidos-web.vercel.app
- **Repositorio**: https://github.com/CRISTIAN3322/suraPedidosWeb
- **Issues**: https://github.com/CRISTIAN3322/suraPedidosWeb/issues

## 📞 Contacto

**Desarrollador**: CCPOVEDA  
**Email**: ccpoveda.programador@gmail.com

---

*Documentación para Suramericana JI SAS — Sura Pedidos Web v2.0 — Astro, React y Atomic Design*

## 07. Diagramas

### Flujo principal de usuario

```mermaid
flowchart TD
    A[Inicio /] --> B{Horario de atención}
    B -- No --> BH[Componente BloqueoHorario]
    B -- Sí --> C[Ver catálogo de productos]
    C --> D[Agregar productos al carrito (localStorage.cartItems)]
    D --> E[Ir a Selección de Cliente /principal]
    E --> F[Buscar y seleccionar cliente]
    F --> G[Persistir datosCliente en localStorage]
    G --> H[Ir a Carrito /carrito]
    H --> P[Opcional: Descargar PDF orden de compra]
    P --> I{Cliente con cupo?}
    I -- Sí --> J[Construir mensaje de pedido]
    I -- No --> K[Construir mensaje de alerta sin cupo]
    J --> L[Abrir enlace WhatsApp y enviar]
    K --> L[Abrir enlace WhatsApp y enviar]
    L --> M[Vaciar carrito y limpiar datosCliente]
```

### Arquitectura de módulos

```mermaid
graph LR
  subgraph UI
    BaseLayout --> Navigation
    BaseLayout --> Pages
    Pages --> Index[index.astro]
    Pages --> Principal[principal.astro]
    Pages --> Carrito[carrito.astro]
  end

  subgraph Components
    Index --> ProductosSelector
    Index --> BloqueoHorario
    Principal --> ClienteSelector
    Carrito --> CarteraCliente
    Carrito --> OrdenCompraPdf[ordenCompraPdf.ts]
  end

  subgraph Data
    ProductosSelector --> products.json
    ClienteSelector --> clientes.json
    ClienteSelector --> cartera.json
    ClienteSelector --> cupo.json
  end

  subgraph Config
    BloqueoHorario --> APP_CONFIG
    Carrito --> APP_CONFIG
  end

  subgraph Utils
    Components --> helpers.ts
  end
```

Nota: Para visualizar los diagramas en GitHub/GitLab, asegúrate de que el visor soporte Mermaid. De lo contrario, exporta a imagen con herramientas externas.


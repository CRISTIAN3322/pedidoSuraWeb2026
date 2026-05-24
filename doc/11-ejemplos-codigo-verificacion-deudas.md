# Ejemplos de Código - Verificación de Deudas

## 📋 Introducción

Este documento proporciona ejemplos prácticos de código para implementar y utilizar la funcionalidad de verificación de deudas en **Sura Pedidos Web** (Suramericana JI SAS). Incluye ejemplos de uso de las utilidades, componentes y mejores prácticas.

### Umbral de bloqueo en pantalla

`ClienteSelectorReact.jsx` y `ClienteSelectorTemplate.astro` leen **`APP_CONFIG.portfolio.blockDays`** (`src/config/app.config.ts`, por defecto **30**). Varios ejemplos siguientes usan `40` como `diasLimite` porque coincide con el **default** de `deudaUtils.ts`; para igualar la UI, pasa siempre `APP_CONFIG.portfolio.blockDays`.

## 🛠️ Ejemplos de Utilidades

### 1. Verificación Básica de Facturas Vencidas

```typescript
// Ejemplo ilustrativo (rutas relativas según el archivo desde el que importes)
import { APP_CONFIG } from "../config/app.config";
import { tieneFacturasVencidas, Factura, ClienteDeuda } from "./types";

const cliente: ClienteDeuda = {
  id: 12345,
  nombre: "EMPRESAS ABC SAS",
  sucursales: [...],
  cartera: [
    { id: 1, fac: "SURA 001", fecha: "15/08/2025", valor: "1000000", dias: 95 },
    { id: 2, fac: "SURA 002", fecha: "20/08/2025", valor: "2500000", dias: 15 },
  ],
};

// Mismo criterio que el botón "Continuar al Producto" (blockDays por defecto 30):
const estaBloqueadoUI = tieneFacturasVencidas(
  cliente,
  APP_CONFIG.portfolio.blockDays
);

// Default de deudaUtils (40); solo coincide con la UI si blockDays === 40:
const estaBloqueadoUtilsDefault = tieneFacturasVencidas(cliente);
console.log(estaBloqueadoUI, estaBloqueadoUtilsDefault);
```

### 2. Obtener Facturas Vencidas

```typescript
import { obtenerFacturasVencidas } from "../utils/atomic-design/deudaUtils";

const facturasVencidas = obtenerFacturasVencidas(cliente, 40);
console.log(`Facturas vencidas: ${facturasVencidas.length}`);
facturasVencidas.forEach((factura) => {
  console.log(`- ${factura.fac}: ${factura.dias} días`);
});
```

### 3. Calcular Deuda Total Vencida

```typescript
import {
  calcularDeudaVencida,
  formatearMoneda,
} from "../utils/atomic-design/deudaUtils";

const deudaTotal = calcularDeudaVencida(cliente, 40);
const deudaFormateada = formatearMoneda(deudaTotal);
console.log(`Deuda total vencida: ${deudaFormateada}`);
```

## 🎨 Ejemplos de Componentes

### 1. Uso de Button Atómico con Estado Bloqueado

```astro
---
// En cualquier componente Astro
import Button from '../atoms/Button.astro';
import { tieneFacturasVencidas } from '../utils/atomic-design/deudaUtils';

const cliente = Astro.props.cliente;
const estaBloqueado = tieneFacturasVencidas(cliente, 40);
---

<Button
  variant={estaBloqueado ? 'blocked' : 'primary'}
  size="lg"
  disabled={estaBloqueado}
>
  {estaBloqueado ? 'Cliente bloqueado por factura' : 'Continuar al Producto'}
</Button>
```

### 2. Uso de StatusBadge para Estados de Facturas

```astro
---
// En CarteraTable.astro
import StatusBadge from '../atoms/StatusBadge.astro';

const getDiasStatus = (dias) => {
  const diasNum = Number(dias) || 0;
  if (diasNum >= 30) return 'danger';
  if (diasNum >= 11) return 'warning';
  if (diasNum >= 1) return 'info';
  return 'success';
};
---

<td>
  <StatusBadge status={getDiasStatus(factura.dias)}>
    {factura.dias || 0}
  </StatusBadge>
</td>
```

### 3. Componente Molecular con Verificación de Deudas

```astro
---
// En CupoInfo.astro
import StatusBadge from '../atoms/StatusBadge.astro';
import { tieneFacturasVencidas } from '../utils/atomic-design/deudaUtils';

const cliente = Astro.props.cliente;
const estaBloqueado = tieneFacturasVencidas(cliente, 40);
---

<div class={estaBloqueado ? 'cliente-bloqueado' : 'cliente-normal'}>
  <StatusBadge status={estaBloqueado ? 'blocked' : 'success'}>
    {estaBloqueado ? '🚫 BLOQUEADO' : '✅ HABILITADO'}
  </StatusBadge>
</div>
```

## ⚛️ Ejemplos con React

### 1. Hook Personalizado para Verificación de Deudas

```typescript
// hooks/useDeudaVerification.js
import { useMemo } from "react";
import { APP_CONFIG } from "../config/app.config";
import {
  tieneFacturasVencidas,
  obtenerEstadoRiesgoCliente,
} from "../utils/atomic-design/deudaUtils";

export const useDeudaVerification = (cliente) => {
  const estaBloqueado = useMemo(
    () => tieneFacturasVencidas(cliente, APP_CONFIG.portfolio.blockDays),
    [cliente]
  );

  const estadoRiesgo = useMemo(
    () => obtenerEstadoRiesgoCliente(cliente),
    [cliente]
  );

  const mensajeBloqueo = useMemo(() => {
    if (!estaBloqueado) return "";
    return `Cliente bloqueado por facturas vencidas mayores a ${APP_CONFIG.portfolio.blockDays} días.`;
  }, [estaBloqueado]);

  return {
    estaBloqueado,
    estadoRiesgo,
    mensajeBloqueo,
  };
};
```

### 2. Uso del Hook en Componente React

```jsx
// En ClienteSelectorReact.jsx
import React, { useState, useCallback } from "react";
import { useClienteData } from "../../hooks/useClienteData";
import { useDeudaVerification } from "../../hooks/useDeudaVerification";

function ClienteSelectorReact() {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const { cupoDisponible, totalCartera, carteraCliente } =
    useClienteData(clienteSeleccionado);

  // Usar el hook de verificación de deudas
  const { estaBloqueado, estadoRiesgo, mensajeBloqueo } =
    useDeudaVerification(clienteSeleccionado);

  const handleContinue = useCallback(() => {
    if (estaBloqueado) {
      alert(mensajeBloqueo);
      return;
    }

    // Lógica para continuar al producto
    window.location.href = "/producto";
  }, [estaBloqueado, mensajeBloqueo]);

  return (
    <div>
      <button
        onClick={handleContinue}
        disabled={estaBloqueado}
        className={`continue-button ${estaBloqueado ? "blocked" : "enabled"}`}
      >
        {estaBloqueado
          ? "Cliente bloqueado por factura"
          : "Continuar al Producto"}
      </button>

      {estaBloqueado && <div className="bloqueo-message">{mensajeBloqueo}</div>}
    </div>
  );
}
```

## 🎯 Casos de Uso Completos

### Caso 1: Verificación en Tiempo Real

```jsx
// Componente que verifica deudas en tiempo real
function ClienteDashboard({ cliente }) {
  const { estaBloqueado, estadoRiesgo } = useDeudaVerification(cliente);

  return (
    <div className={`dashboard ${estadoRiesgo}`}>
      <header>
        <h2>{cliente.nombre}</h2>
        <EstadoClienteBadge riesgo={estadoRiesgo} />
      </header>

      <main>
        {estaBloqueado ? (
          <BloqueoMessage cliente={cliente} />
        ) : (
          <ProductosDisponibles cliente={cliente} />
        )}
      </main>
    </div>
  );
}
```

### Caso 2: Validación en Formulario

```jsx
// Formulario con validación de deudas
function PedidoForm({ cliente, productos }) {
  const { estaBloqueado, mensajeBloqueo } = useDeudaVerification(cliente);

  const handleSubmit = (e) => {
    if (estaBloqueado) {
      e.preventDefault();
      alert(mensajeBloqueo);
      return false;
    }

    // Procesar pedido normal
    return true;
  };

  return (
    <form onSubmit={handleSubmit}>
      <ClienteInfo cliente={cliente} />
      <ProductosList productos={productos} />

      <button
        type="submit"
        disabled={estaBloqueado}
        className={estaBloqueado ? "btn-blocked" : "btn-primary"}
      >
        {estaBloqueado ? "Cliente Bloqueado" : "Realizar Pedido"}
      </button>
    </form>
  );
}
```

## 🔧 Utilidades Avanzadas

### 1. Filtro de Clientes por Estado de Deuda

```typescript
// Filtrar clientes según estado de deuda
const filtrarClientesPorDeuda = (clientes, opciones = {}) => {
  const {
    soloBloqueados = false,
    soloHabilitados = false,
    diasLimite = 40,
  } = opciones;

  return clientes.filter((cliente) => {
    const tieneDeudasVencidas = tieneFacturasVencidas(cliente, diasLimite);

    if (soloBloqueados) return tieneDeudasVencidas;
    if (soloHabilitados) return !tieneDeudasVencidas;
    return true;
  });
};
```

### 2. Estadísticas de Cartera

```typescript
// Generar estadísticas de cartera
const generarEstadisticasCartera = (cartera) => {
  const totalFacturas = cartera.length;
  const facturasVencidas = obtenerFacturasVencidas({ cartera }, 40);
  const montoVencido = calcularDeudaVencida({ cartera }, 40);

  return {
    totalFacturas,
    facturasVencidas: facturasVencidas.length,
    montoVencido,
    porcentajeVencido:
      totalFacturas > 0 ? (facturasVencidas.length / totalFacturas) * 100 : 0,
  };
};
```

## 📊 Ejemplos de Datos de Prueba

### 1. Datos para Testing

```javascript
// Datos de prueba para clientes bloqueados
const clienteBloqueado = {
  id: 999,
  nombre: "CLIENTE BLOQUEADO TEST",
  sucursales: [{ direccion: "Calle 123 #45-67", vendedor: "Vendedor Test" }],
  cartera: [
    {
      id: 1,
      fac: "TEST001",
      fecha: "15/07/2025",
      valor: "5000000",
      dias: 45, // ← Supera portfolio.blockDays (p. ej. 30)
    },
    {
      id: 2,
      fac: "TEST002",
      fecha: "20/08/2025",
      valor: "2500000",
      dias: 15, // ← Factura normal
    },
  ],
};

// Datos de prueba para clientes habilitados
const clienteHabilitado = {
  id: 998,
  nombre: "CLIENTE HABILITADO TEST",
  sucursales: [{ direccion: "Av. 456 #78-90", vendedor: "Vendedor Test 2" }],
  cartera: [
    {
      id: 3,
      fac: "TEST003",
      fecha: "01/09/2025",
      valor: "1000000",
      dias: 25, // ← Por debajo de portfolio.blockDays (p. ej. 30)
    },
  ],
};
```

### 2. Casos Edge para Testing

```javascript
// Cliente sin cartera
const clienteSinCartera = {
  id: 997,
  nombre: "CLIENTE NUEVO TEST",
  sucursales: [],
  cartera: [],
};

// Cliente con datos malformados
const clienteDatosInvalidos = {
  id: 996,
  nombre: "CLIENTE INVALIDO TEST",
  cartera: [
    { dias: "invalid" }, // ← Datos no numéricos
    { dias: null }, // ← Datos nulos
    { valor: "abc" }, // ← Valor no numérico
  ],
};
```

## 🚨 Manejo de Errores

### 1. Try-Catch en Verificación

```typescript
const verificarClienteSeguro = (cliente) => {
  try {
    const estaBloqueado = tieneFacturasVencidas(cliente, 40);

    return {
      success: true,
      bloqueado: estaBloqueado,
      error: null,
    };
  } catch (error) {
    console.error("Error verificando cliente:", error);

    return {
      success: false,
      bloqueado: false,
      error: error.message,
    };
  }
};
```

### 2. Validación de Datos

```typescript
const validarDatosCliente = (cliente) => {
  const errores = [];

  if (!cliente) {
    errores.push("Cliente es requerido");
  }

  if (!cliente.id) {
    errores.push("ID de cliente es requerido");
  }

  if (!cliente.cartera) {
    errores.push("Cartera de cliente es requerida");
  }

  if (cliente.cartera && !Array.isArray(cliente.cartera)) {
    errores.push("Cartera debe ser un array");
  }

  return {
    esValido: errores.length === 0,
    errores,
  };
};
```

## 📱 Ejemplos Responsive

### 1. Adaptación para Móviles

```css
/* En componente de bloqueo */
.bloqueo-message {
  padding: 1rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .bloqueo-message {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
}
```

### 2. Estados Táctiles

```jsx
// Mejorar feedback táctil en móviles
<button
  disabled={estaBloqueado}
  className={`btn ${estaBloqueado ? "btn-blocked" : "btn-primary"}`}
  style={{
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
  }}
>
  {estaBloqueado ? "Cliente bloqueado" : "Continuar"}
</button>
```

## 🔄 Flujos Completos

### Flujo de Verificación Completo

```jsx
// En ClienteSelectorReact.jsx
function ClienteSelectorReact() {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Obtener datos del cliente
  const { cupoDisponible, totalCartera, carteraCliente } =
    useClienteData(clienteSeleccionado);

  // 2. Verificar estado de deuda
  const { estaBloqueado, estadoRiesgo, mensajeBloqueo } =
    useDeudaVerification(clienteSeleccionado);

  // 3. Manejar continuación
  const handleContinue = useCallback(() => {
    if (estaBloqueado) {
      alert(mensajeBloqueo);
      return;
    }

    if (!clienteSeleccionado || !sucursalSeleccionada) {
      alert("Por favor seleccione un cliente y sucursal");
      return;
    }

    setIsLoading(true);

    try {
      const datosCliente = {
        clienteId: clienteSeleccionado.id,
        clienteNombre: clienteSeleccionado.nombre,
        sucursalDireccion: sucursalSeleccionada.direccion,
        sucursalVendedor: sucursalSeleccionada.vendedor,
        totalCartera,
        cupoDisponible,
        estadoRiesgo,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("datosCliente", JSON.stringify(datosCliente));
      window.location.href = "/producto";
    } catch (error) {
      console.error("Error al procesar:", error);
      alert("Error al procesar la información. Intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [
    clienteSeleccionado,
    sucursalSeleccionada,
    estaBloqueado,
    mensajeBloqueo,
  ]);

  return (
    <div className="cliente-selector">
      {/* Búsqueda de clientes */}
      <SearchSection onClienteSelect={setClienteSeleccionado} />

      {/* Información del cliente seleccionado */}
      {clienteSeleccionado && (
        <div className="cliente-info-section">
          <ClienteInfo cliente={clienteSeleccionado} />
          <CupoInfo
            cupoDisponible={cupoDisponible}
            totalCartera={totalCartera}
          />
          <CarteraTable cartera={carteraCliente} isLoading={isLoading} />

          {/* Lista de sucursales */}
          <SucursalList
            sucursales={clienteSeleccionado.sucursales}
            sucursalSeleccionada={sucursalSeleccionada}
            onSucursalSelect={setSucursalSeleccionada}
            disabled={isLoading || estaBloqueado}
          />

          {/* Botón de continuación */}
          <div className="action-section">
            <Button
              variant={estaBloqueado ? "blocked" : "primary"}
              size="lg"
              disabled={!sucursalSeleccionada || isLoading || estaBloqueado}
              onClick={handleContinue}
            >
              {isLoading
                ? "Procesando..."
                : estaBloqueado
                ? "Cliente bloqueado por factura"
                : "Continuar al Producto"}
            </Button>

            {estaBloqueado && (
              <div className="bloqueo-help">{mensajeBloqueo}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

## 📋 Checklist de Implementación

### Para Nuevas Implementaciones

- [ ] ✅ Importar utilidades de deuda
- [ ] ✅ Verificar tipos de datos
- [ ] ✅ Manejar estados de carga
- [ ] ✅ Implementar manejo de errores
- [ ] ✅ Agregar accesibilidad (ARIA)
- [ ] ✅ Hacer responsive
- [ ] ✅ Documentar uso
- [ ] ✅ Testing con datos de prueba

### Para Modificaciones Existentes

- [ ] ✅ Revisar compatibilidad con Atomic Design
- [ ] ✅ Actualizar imports si es necesario
- [ ] ✅ Verificar funcionamiento con datos existentes
- [ ] ✅ Actualizar documentación
- [ ] ✅ Testing de regresión

## 🎯 Próximos Pasos

### Mejoras Sugeridas

1. **Cache de Verificaciones**: Implementar memoización para verificaciones frecuentes
2. **Notificaciones Push**: Alertar sobre cambios en estado de deuda
3. **Reportes**: Generar reportes de clientes bloqueados
4. **API de Configuración**: Hacer el límite de días configurable
5. **Logs de Auditoría**: Registrar todos los bloqueos/desbloqueos

### Extensiones Posibles

```typescript
// Futuras funcionalidades
- Bloqueo por monto total de deuda
- Bloqueo por número de facturas vencidas
- Sistema de alertas tempranas
- Configuración granular por cliente
- Reportes avanzados de cartera
```

---

_Este documento se actualiza con cada mejora en la funcionalidad de verificación de deudas._

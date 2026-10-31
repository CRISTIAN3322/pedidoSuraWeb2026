import { useMemo } from 'react';
import clientesData from '../data/clientes.json';
import cuposData from '../data/cupo.json';
import carteraData from '../data/cartera.json';
import { actualizarDiasFacturas } from '../utils/carteraUtils';

// Función auxiliar para obtener el nombre del vendedor de la sesión
function getVendedorNombre() {
  if (typeof window === 'undefined') return null;
  try {
    const session = sessionStorage.getItem('vendedorSession');
    if (!session) return null;
    const sessionData = JSON.parse(session);
    return sessionData.nombre || null;
  } catch {
    return null;
  }
}

// Función auxiliar para verificar si el usuario es administrador
function isAdministrador() {
  if (typeof window === 'undefined') return false;
  try {
    const session = sessionStorage.getItem('vendedorSession');
    if (!session) return false;
    const sessionData = JSON.parse(session);
    return sessionData.rol === 'administrador' || sessionData.nombre?.toUpperCase() === 'ADMINISTRADOR';
  } catch {
    return false;
  }
}

// Función auxiliar para comparar nombres de vendedores (case-insensitive)
function compareVendedorNames(name1, name2) {
  if (!name1 || !name2) return false;
  return name1.trim().toUpperCase() === name2.trim().toUpperCase();
}

export const useClienteData = (clienteSeleccionado) => {
  return useMemo(() => {
    if (!clienteSeleccionado) {
      return {
        cupoDisponible: 0,
        totalCartera: 0,
        sinCupo: false,
        carteraCliente: [],
        formaPago: '',
        error: null,
      };
    }

    try {
      const vendedorNombre = getVendedorNombre();

      // Buscar información del cupo
      const cupoInfo = cuposData.find((c) => c.id === clienteSeleccionado.id);

      if (!cupoInfo) {
        return {
          cupoDisponible: 0,
          totalCartera: 0,
          sinCupo: false,
          carteraCliente: [],
          formaPago: '',
          error: 'No se encontró información de cupo para este cliente',
        };
      }

      const cupoDisponible = parseFloat(String(cupoInfo.cupo).replace(/,/g, '')) || 0;
      const formaPago = cupoInfo.Forma || '';

      // Buscar cartera del cliente filtrada por vendedor
      let carteraCliente = carteraData.filter((c) => c.id === clienteSeleccionado.id);
      
      // Si hay un vendedor logueado y NO es administrador, filtrar la cartera por ese vendedor
      if (vendedorNombre && !isAdministrador()) {
        carteraCliente = carteraCliente.filter((c) => {
          // El campo puede venir como "Vendedor" (mayúscula) o "vendedor" (minúscula)
          const vendedorFactura = c.Vendedor || c.vendedor || '';
          return compareVendedorNames(vendedorFactura, vendedorNombre);
        });
      }

      // Recalcular días desde fecha (hoy Bogotá); ignora dias estático del JSON
      carteraCliente = actualizarDiasFacturas(carteraCliente);

      const totalCartera = carteraCliente.reduce((sum, factura) => {
        const valor = String(factura.valor).replace(/\./g, '').replace(',', '.');
        return sum + (parseFloat(valor) || 0);
      }, 0);

      const sinCupo = totalCartera > cupoDisponible;

      return {
        cupoDisponible,
        totalCartera,
        sinCupo,
        carteraCliente,
        formaPago,
        error: null,
      };
    } catch (error) {
      console.error('Error procesando datos del cliente:', error);
      return {
        cupoDisponible: 0,
        totalCartera: 0,
        sinCupo: false,
        carteraCliente: [],
        formaPago: '',
        error: 'Error al procesar los datos del cliente',
      };
    }
  }, [clienteSeleccionado]);
};

export const useClientesFiltrados = (busqueda) => {
  return useMemo(() => {
    if (!Array.isArray(clientesData)) {
      return [];
    }

    try {
      const vendedorNombre = getVendedorNombre();
      const esAdministrador = isAdministrador();
      
      // Si es administrador, mostrar todos los clientes sin filtrar
      let clientesFiltrados = clientesData;
      
      // Si NO es administrador y hay un vendedor logueado, filtrar por vendedor
      if (!esAdministrador && vendedorNombre) {
        clientesFiltrados = clientesData.filter((cliente) => {
          // Verificar si el cliente tiene al menos una sucursal con el vendedor logueado
          if (!cliente.sucursales || !Array.isArray(cliente.sucursales)) {
            return false;
          }
          return cliente.sucursales.some((sucursal) => 
            compareVendedorNames(sucursal.vendedor, vendedorNombre)
          );
        });
      }

      // Si no hay búsqueda, retornar todos los clientes del vendedor
      if (!busqueda || busqueda.length < 1) {
        return clientesFiltrados;
      }

      // Filtrar por búsqueda
      return clientesFiltrados.filter((cliente) => {
        const nombreMatch = cliente.nombre?.toLowerCase().includes(busqueda.toLowerCase());
        const idMatch = String(cliente.id || '').includes(busqueda);
        return nombreMatch || idMatch;
      });
    } catch (error) {
      console.error('Error filtrando clientes:', error);
      return [];
    }
  }, [busqueda]);
};
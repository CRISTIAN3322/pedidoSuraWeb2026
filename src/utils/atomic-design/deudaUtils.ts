/**
 * Utilidades para verificación de deudas y facturas bloqueadas
 * Sigue la metodología Atomic Design para mantener la lógica de negocio centralizada
 */

import { APP_CONFIG } from '../../config/app.config';
import {
  calcularDiasDesdeFecha,
  conDiasActualizados,
  esFacturaBloqueante,
} from '../carteraUtils';

/**
 * Interface para representar una factura
 */
export interface Factura {
  id: string | number;
  cliente: string;
  vendedor: string;
  fac: string;
  fecha: string;
  valor: string | number;
  habilitado?: boolean;
  dias?: string | number;
}

/**
 * Interface para representar un cliente con su información de deuda
 */
export interface ClienteDeuda {
  id: string | number;
  nombre: string;
  sucursales?: any[];
  cartera?: Factura[];
}

function diasFactura(factura: Factura): number {
  if (factura.fecha) {
    return calcularDiasDesdeFecha(String(factura.fecha));
  }
  return Number(factura.dias) || 0;
}

/**
 * Verifica si un cliente tiene facturas que bloquean el catálogo
 * (habilitado !== true en alguna factura de su cartera filtrada).
 */
export function tieneFacturasVencidas(cliente: ClienteDeuda | null): boolean {
  if (!cliente || !cliente.cartera || cliente.cartera.length === 0) {
    return false;
  }

  return cliente.cartera.some((factura: Factura) =>
    esFacturaBloqueante(factura)
  );
}

/**
 * Obtiene todas las facturas bloqueantes de un cliente
 */
export function obtenerFacturasVencidas(cliente: ClienteDeuda | null): Factura[] {
  if (!cliente || !cliente.cartera || cliente.cartera.length === 0) {
    return [];
  }

  return cliente.cartera
    .map((factura) => conDiasActualizados(factura))
    .filter((factura) => esFacturaBloqueante(factura));
}

/**
 * Calcula el total de deuda bloqueante de un cliente
 */
export function calcularDeudaVencida(cliente: ClienteDeuda | null): number {
  const facturasVencidas = obtenerFacturasVencidas(cliente);

  return facturasVencidas.reduce((total: number, factura: Factura) => {
    const valor = Number(String(factura.valor).replace(/\./g, '').replace(',', '.')) || 0;
    return total + valor;
  }, 0);
}

/**
 * Determina el estado de riesgo de un cliente basado en sus facturas
 */
export function obtenerEstadoRiesgoCliente(
  cliente: ClienteDeuda | null
): 'bajo' | 'medio' | 'alto' | 'bloqueado' {
  if (!cliente || !cliente.cartera || cliente.cartera.length === 0) {
    return 'bajo';
  }

  const facturasVencidas = obtenerFacturasVencidas(cliente);
  const maxDiasVencido = Math.max(
    ...cliente.cartera.map((f: Factura) => diasFactura(f)),
    0
  );

  if (facturasVencidas.length > 0) {
    return 'bloqueado';
  }

  if (maxDiasVencido >= 30) {
    return 'alto';
  }

  if (maxDiasVencido >= 15) {
    return 'medio';
  }

  return 'bajo';
}

/**
 * Formatea un valor numérico como moneda colombiana
 */
export function formatearMoneda(valor: number): string {
  return valor.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Valida si una factura bloquea el catálogo según `habilitado`
 */
export function esFacturaVencida(factura: Factura): boolean {
  return esFacturaBloqueante(factura);
}

/**
 * Genera un mensaje de bloqueo para el cliente
 */
export function generarMensajeBloqueo(cliente: ClienteDeuda | null): string {
  if (!cliente) {
    return 'Cliente no encontrado';
  }

  const facturasVencidas = obtenerFacturasVencidas(cliente);
  const deudaTotal = calcularDeudaVencida(cliente);

  if (facturasVencidas.length === 0) {
    return 'El cliente no tiene facturas bloqueadas';
  }

  return `Cliente bloqueado por ${facturasVencidas.length} factura(s) en cartera por un total de ${formatearMoneda(deudaTotal)}. Contacte al área de cartera para habilitar.`;
}

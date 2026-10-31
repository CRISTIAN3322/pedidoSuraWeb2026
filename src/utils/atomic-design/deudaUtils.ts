/**
 * Utilidades para verificación de deudas y facturas vencidas
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
  dias: string | number;
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
 * @param cliente - Objeto con información del cliente y su cartera
 * @param diasLimite - Límite de días (default: APP_CONFIG.portfolio.blockDays)
 * @returns boolean - true si tiene facturas con antigüedad >= límite
 */
export function tieneFacturasVencidas(
  cliente: ClienteDeuda | null,
  diasLimite: number = APP_CONFIG.portfolio.blockDays
): boolean {
  if (!cliente || !cliente.cartera || cliente.cartera.length === 0) {
    return false;
  }

  return cliente.cartera.some((factura: Factura) =>
    esFacturaBloqueante(diasFactura(factura), diasLimite)
  );
}

/**
 * Obtiene todas las facturas bloqueantes de un cliente
 */
export function obtenerFacturasVencidas(
  cliente: ClienteDeuda | null,
  diasLimite: number = APP_CONFIG.portfolio.blockDays
): Factura[] {
  if (!cliente || !cliente.cartera || cliente.cartera.length === 0) {
    return [];
  }

  return cliente.cartera
    .map((factura) => conDiasActualizados(factura))
    .filter((factura) => esFacturaBloqueante(factura.dias, diasLimite));
}

/**
 * Calcula el total de deuda bloqueante de un cliente
 */
export function calcularDeudaVencida(
  cliente: ClienteDeuda | null,
  diasLimite: number = APP_CONFIG.portfolio.blockDays
): number {
  const facturasVencidas = obtenerFacturasVencidas(cliente, diasLimite);

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

  const blockDays = APP_CONFIG.portfolio.blockDays;
  const facturasVencidas = obtenerFacturasVencidas(cliente, blockDays);
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
 * Valida si una factura bloquea según días calculados desde fecha
 */
export function esFacturaVencida(
  factura: Factura,
  diasLimite: number = APP_CONFIG.portfolio.blockDays
): boolean {
  return esFacturaBloqueante(diasFactura(factura), diasLimite);
}

/**
 * Genera un mensaje de bloqueo para el cliente
 */
export function generarMensajeBloqueo(cliente: ClienteDeuda | null): string {
  if (!cliente) {
    return 'Cliente no encontrado';
  }

  const blockDays = APP_CONFIG.portfolio.blockDays;
  const facturasVencidas = obtenerFacturasVencidas(cliente, blockDays);
  const deudaTotal = calcularDeudaVencida(cliente, blockDays);

  if (facturasVencidas.length === 0) {
    return 'El cliente no tiene facturas vencidas';
  }

  return `Cliente bloqueado por ${facturasVencidas.length} factura(s) vencida(s) por un total de ${formatearMoneda(deudaTotal)}. Contacte al área de cartera para resolver.`;
}

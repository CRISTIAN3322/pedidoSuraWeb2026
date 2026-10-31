import { APP_CONFIG } from '../config/app.config';

export interface FacturaCartera {
  id: number;
  cliente: string;
  vendedor: string;
  fac: string;
  fecha: string;
  valor: number;
  dias: number;
  nota?: string;
}

export interface CarteraVendedor {
  vendedor: string;
  facturas: FacturaCartera[];
  totalCartera: number;
  totalFacturas: number;
  facturasVencidas: number;
  facturasPorVencer: number;
  maxDias: number;
}

export interface VendedorContacto {
  id: number;
  vendedor: string;
  rol: string;
  telefono: number;
}

/** Rojo: días >= criticalDays (41) */
export const DIAS_VENCIDA = APP_CONFIG.portfolio.criticalDays;
/** Amarillo: desde warningDays (25) hasta criticalDays - 1 */
export const DIAS_POR_VENCER_MIN = APP_CONFIG.portfolio.warningDays;

/**
 * Días de antigüedad desde la fecha de factura (DD/MM/YYYY) hasta hoy
 * en America/Bogota. Ignora el campo `dias` estático del JSON.
 */
export function calcularDiasDesdeFecha(
  fecha: string,
  timezone: string = APP_CONFIG.schedule.timezone
): number {
  const match = String(fecha || '')
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return 0;

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const anio = Number(match[3]);
  if (!dia || !mes || !anio) return 0;

  // en-CA → YYYY-MM-DD en la zona indicada
  const hoyStr = new Date().toLocaleDateString('en-CA', { timeZone: timezone });
  const [hoyAnio, hoyMes, hoyDia] = hoyStr.split('-').map(Number);

  const msFactura = Date.UTC(anio, mes - 1, dia);
  const msHoy = Date.UTC(hoyAnio, hoyMes - 1, hoyDia);
  return Math.floor((msHoy - msFactura) / 86_400_000);
}

/** Recalcula `dias` desde `fecha`; no usa el valor del JSON. */
export function conDiasActualizados<T extends { fecha?: string }>(
  factura: T
): T & { dias: number } {
  return {
    ...factura,
    dias: calcularDiasDesdeFecha(String(factura.fecha || '')),
  };
}

export function actualizarDiasFacturas<T extends { fecha?: string }>(
  facturas: T[]
): Array<T & { dias: number }> {
  return facturas.map(conDiasActualizados);
}

/** Bloqueo de catálogo: antigüedad >= blockDays (configurable en app.config). */
export function esFacturaBloqueante(
  dias: number,
  diasLimite: number = APP_CONFIG.portfolio.blockDays
): boolean {
  return (Number(dias) || 0) >= diasLimite;
}

export function compareVendedorNames(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false;
  return name1.trim().toUpperCase() === name2.trim().toUpperCase();
}

export function parseValor(valor: unknown): number {
  if (typeof valor === 'number') return valor;
  const parsed = parseFloat(
    String(valor).replace(/\./g, '').replace(',', '.')
  );
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortFacturasByDiasDesc(facturas: FacturaCartera[]): FacturaCartera[] {
  return [...facturas].sort((a, b) => (Number(b.dias) || 0) - (Number(a.dias) || 0));
}

export function sortCarterasByVencimiento(carteras: CarteraVendedor[]): CarteraVendedor[] {
  return [...carteras].sort((a, b) => {
    if (b.facturasVencidas !== a.facturasVencidas) {
      return b.facturasVencidas - a.facturasVencidas;
    }
    if (b.maxDias !== a.maxDias) return b.maxDias - a.maxDias;
    return b.totalCartera - a.totalCartera;
  });
}

export function getDiasStatus(dias: number): 'danger' | 'warning' | 'info' | 'success' {
  if (dias >= DIAS_VENCIDA) return 'danger';
  if (dias >= DIAS_POR_VENCER_MIN) return 'warning';
  if (dias >= 1) return 'info';
  return 'success';
}

export function formatCarteraCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getFacturasVencidas(facturas: FacturaCartera[]): FacturaCartera[] {
  return facturas.filter((f) => (Number(f.dias) || 0) >= DIAS_VENCIDA);
}

export function buildWhatsAppMessage(
  vendedorNombre: string,
  facturas: FacturaCartera[]
): string {
  const vencidas = sortFacturasByDiasDesc(getFacturasVencidas(facturas));
  const lineas = vencidas.map((f, i) => {
    const valor = formatCarteraCurrency(parseValor(f.valor));
    return (
      `${i + 1}. NIT: ${f.id} | Cliente: ${f.cliente} | Factura: ${f.fac} | ` +
      `Fecha: ${f.fecha} | Valor: ${valor} | Días: ${f.dias}`
    );
  });

  return [
    `*CARTERA VENCIDA - ${vendedorNombre.toUpperCase()}*`,
    '',
    `Facturas con ${DIAS_VENCIDA} o más días vencidos (${vencidas.length}):`,
    '',
    ...lineas,
    '',
    'Por favor gestionar el cobro de estos clientes.',
  ].join('\n');
}

export function buildWhatsAppUrl(telefono: number | string, mensaje: string): string {
  const digits = String(telefono).replace(/\D/g, '');
  const conPais = digits.startsWith('57') ? digits : `57${digits}`;
  return `https://wa.me/${conPais}?text=${encodeURIComponent(mensaje)}`;
}

export function enrichCarteraGrupo(grupo: CarteraVendedor): CarteraVendedor {
  const facturas = sortFacturasByDiasDesc(
    grupo.facturas.map((f) => {
      const conDias = conDiasActualizados(f);
      return {
        ...conDias,
        valor: parseValor(conDias.valor),
      };
    })
  );
  const maxDias = facturas.reduce((max, f) => Math.max(max, f.dias), 0);
  const facturasVencidas = facturas.filter((f) => f.dias >= DIAS_VENCIDA).length;
  const facturasPorVencer = facturas.filter(
    (f) => f.dias >= DIAS_POR_VENCER_MIN && f.dias < DIAS_VENCIDA
  ).length;
  return {
    ...grupo,
    facturas,
    facturasVencidas,
    facturasPorVencer,
    maxDias,
  };
}

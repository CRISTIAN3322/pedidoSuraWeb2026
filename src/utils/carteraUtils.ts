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

export const DIAS_VENCIDA = 30;
export const DIAS_POR_VENCER_MIN = 11;

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
    grupo.facturas.map((f) => ({
      ...f,
      valor: parseValor(f.valor),
      dias: Number(f.dias) || 0,
    }))
  );
  const maxDias = facturas.reduce((max, f) => Math.max(max, f.dias), 0);
  return {
    ...grupo,
    facturas,
    maxDias,
  };
}

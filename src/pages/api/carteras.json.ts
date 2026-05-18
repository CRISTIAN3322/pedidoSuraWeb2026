import carteraData from '../../data/cartera.json';
import type { APIRoute } from 'astro';
import {
  DIAS_POR_VENCER_MIN,
  DIAS_VENCIDA,
  parseValor,
  sortFacturasByDiasDesc,
} from '../../utils/carteraUtils';

function getVendedorName(factura: Record<string, unknown>): string {
  return String(factura.Vendedor || factura.vendedor || '');
}

export const GET: APIRoute = () => {
  try {
    // Agrupar carteras por vendedor
    const carterasPorVendedor: { [key: string]: any[] } = {};
    
    carteraData.forEach((factura: any) => {
      const vendedorNombre = getVendedorName(factura);
      if (!vendedorNombre) return;
      
      // Normalizar el nombre del vendedor para usar como clave
      const vendedorKey = vendedorNombre.trim().toUpperCase();
      
      if (!carterasPorVendedor[vendedorKey]) {
        carterasPorVendedor[vendedorKey] = [];
      }
      
      carterasPorVendedor[vendedorKey].push({
        ...factura,
        vendedor: vendedorNombre // Normalizar a minúscula para consistencia
      });
    });
    
    // Convertir a array con estadísticas
    const resultado = Object.keys(carterasPorVendedor).map((vendedorKey) => {
      const facturasRaw = carterasPorVendedor[vendedorKey];
      const vendedorNombre = facturasRaw[0].vendedor;
      const facturas = sortFacturasByDiasDesc(
        facturasRaw.map((factura: Record<string, unknown>) => ({
          ...factura,
          valor: parseValor(factura.valor),
          dias: Number(factura.dias) || 0,
        })) as Parameters<typeof sortFacturasByDiasDesc>[0]
      );

      const totalCartera = facturas.reduce((sum, factura) => sum + parseValor(factura.valor), 0);

      const facturasVencidas = facturas.filter((f) => f.dias >= DIAS_VENCIDA).length;
      const facturasPorVencer = facturas.filter(
        (f) => f.dias >= DIAS_POR_VENCER_MIN && f.dias < DIAS_VENCIDA
      ).length;
      const maxDias = facturas.reduce((max, f) => Math.max(max, f.dias), 0);

      return {
        vendedor: vendedorNombre,
        facturas,
        totalCartera,
        totalFacturas: facturas.length,
        facturasVencidas,
        facturasPorVencer,
        maxDias,
      };
    });

    resultado.sort((a, b) => {
      if (b.facturasVencidas !== a.facturasVencidas) {
        return b.facturasVencidas - a.facturasVencidas;
      }
      if (b.maxDias !== a.maxDias) return b.maxDias - a.maxDias;
      return b.totalCartera - a.totalCartera;
    });
    
    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error procesando carteras:', error);
    return new Response(JSON.stringify({ error: error.message || 'Error al procesar carteras' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

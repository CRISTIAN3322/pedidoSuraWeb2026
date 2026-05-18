import productsData from '../../data/products.json';
import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const productos = productsData.map((p) => ({
    codigo: p.codigo,
    barra: p.barra,
    nombre: p.nombre,
    subtotal: p.subtotal,
    iva: p.iva,
    ipoconsumo: p.ipoconsumo,
    precioUnidad: p.precioUnidad,
    precio: p.precio,
    proveedor: p.proveedor,
    activo: p.activo,
  }));

  return new Response(JSON.stringify(productos), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};

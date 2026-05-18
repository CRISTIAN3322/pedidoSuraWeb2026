import vendedoresData from '../../data/vendedores.json';
import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const contactos = vendedoresData
    .filter((v) => (v.rol || '').toLowerCase() === 'vendedor')
    .map((v) => ({
      id: v.id,
      vendedor: v.vendedor,
      rol: v.rol,
      telefono: v.telefono,
    }));

  return new Response(JSON.stringify(contactos), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

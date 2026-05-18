import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const LISTA_PRECIOS_COLUMNS = [
  'codigo',
  'barra',
  'nombre',
  'subtotal',
  'iva',
  'ipoconsumo',
  'precioUnidad',
  'precio',
] as const;

export const LISTA_PRECIOS_LABELS: Record<(typeof LISTA_PRECIOS_COLUMNS)[number], string> = {
  codigo: 'Código',
  barra: 'Barra',
  nombre: 'Nombre',
  subtotal: 'Subtotal',
  iva: 'IVA',
  ipoconsumo: 'IPOCONSUMO',
  precioUnidad: 'Precio Unidad',
  precio: 'Precio',
};

export interface ProductoListaPrecios {
  codigo?: string;
  barra?: number | string;
  nombre?: string;
  subtotal?: number;
  iva?: number;
  ipoconsumo?: number;
  precioUnidad?: number;
  precio?: number;
  proveedor?: string;
  activo?: boolean | string;
}

export type FilaListaPrecios = Record<(typeof LISTA_PRECIOS_COLUMNS)[number], string | number>;

function isActivo(producto: ProductoListaPrecios): boolean {
  const val = producto.activo;
  if (val === undefined || val === null) return true;
  if (typeof val === 'boolean') return val;
  const v = String(val).toLowerCase();
  return v === 'true' || v === '1' || v === 'si' || v === 'sí';
}

export function toFilaListaPrecios(producto: ProductoListaPrecios): FilaListaPrecios {
  return {
    codigo: producto.codigo ?? '',
    barra: producto.barra ?? '',
    nombre: producto.nombre ?? '',
    subtotal: Number(producto.subtotal) || 0,
    iva: Number(producto.iva) ?? 0,
    ipoconsumo: Number(producto.ipoconsumo) ?? 0,
    precioUnidad: Number(producto.precioUnidad ?? producto.precio) || 0,
    precio: Number(producto.precio) || 0,
  };
}

export function filtrarProductosListaPrecios(
  productos: ProductoListaPrecios[],
  proveedor: string
): FilaListaPrecios[] {
  const proveedorFiltro = (proveedor || '').trim();

  return productos
    .filter((p) => isActivo(p))
    .filter((p) => !proveedorFiltro || (p.proveedor || '').trim() === proveedorFiltro)
    .map(toFilaListaPrecios)
    .sort((a, b) => String(a.codigo).localeCompare(String(b.codigo), 'es-CO'));
}

function buildNombreArchivo(proveedor: string, extension: string): string {
  const base = 'lista_de_precios';
  const prov = (proveedor || '').trim();
  if (!prov) return `${base}.${extension}`;
  const slug = prov
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
  return `${base}_${slug}.${extension}`;
}

function descargarBlob(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.style.display = 'none';
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportListaPreciosExcel(
  productos: ProductoListaPrecios[],
  proveedor: string
): void {
  const filas = filtrarProductosListaPrecios(productos, proveedor);
  if (filas.length === 0) {
    alert('No hay productos activos para exportar con el filtro seleccionado.');
    return;
  }

  const headers = LISTA_PRECIOS_COLUMNS.map((col) => LISTA_PRECIOS_LABELS[col]);
  const data = filas.map((fila) =>
    LISTA_PRECIOS_COLUMNS.map((col) => fila[col])
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 16 },
    { wch: 48 },
    { wch: 12 },
    { wch: 8 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de precios');

  const nombreArchivo = buildNombreArchivo(proveedor, 'xlsx');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  descargarBlob(blob, nombreArchivo);
}

export function exportListaPreciosPdf(
  productos: ProductoListaPrecios[],
  proveedor: string
): void {
  const filas = filtrarProductosListaPrecios(productos, proveedor);
  if (filas.length === 0) {
    alert('No hay productos activos para exportar con el filtro seleccionado.');
    return;
  }

  const tituloProveedor = (proveedor || '').trim() || 'Todos los proveedores';
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(14);
  doc.text('Lista de precios', 14, 14);
  doc.setFontSize(10);
  doc.text(`Proveedor: ${tituloProveedor}`, 14, 21);
  doc.text(`Productos activos: ${filas.length}`, 14, 27);
  doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 33);

  const head = [LISTA_PRECIOS_COLUMNS.map((col) => LISTA_PRECIOS_LABELS[col])];
  const body = filas.map((fila) =>
    LISTA_PRECIOS_COLUMNS.map((col) => {
      const val = fila[col];
      if (col === 'subtotal' || col === 'precioUnidad' || col === 'precio') {
        return Number(val).toLocaleString('es-CO');
      }
      return String(val);
    })
  );

  autoTable(doc, {
    head,
    body,
    startY: 38,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [0, 168, 120], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 22 },
      2: { cellWidth: 70 },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 12, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' },
    },
    margin: { left: 10, right: 10 },
  });

  doc.save(buildNombreArchivo(proveedor, 'pdf'));
}

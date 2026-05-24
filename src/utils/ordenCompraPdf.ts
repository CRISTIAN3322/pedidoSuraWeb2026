import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { APP_CONFIG } from '../config/app.config';

export interface CartItemPdf {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface DatosClientePdf {
  clienteNombre: string;
  clienteId: string;
  sucursalDireccion: string;
  sucursalVendedor: string;
  formaPago?: string;
}

export interface OrdenCompraPdfData {
  cliente: DatosClientePdf;
  items: CartItemPdf[];
  observaciones?: string;
}

const BRAND_COLOR: [number, number, number] = [26, 54, 93];
const ACCENT_COLOR: [number, number, number] = [44, 82, 130];
const MUTED_COLOR: [number, number, number] = [113, 128, 150];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(APP_CONFIG.currency.locale, {
    style: 'currency',
    currency: APP_CONFIG.currency.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildNombreArchivo(clienteId: string): string {
  const fecha = new Date().toISOString().slice(0, 10);
  const id = (clienteId || 'cliente').replace(/[^\w-]/g, '_').slice(0, 30);
  return `orden_compra_${id}_${fecha}.pdf`;
}

function calcularTotal(items: CartItemPdf[]): number {
  return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

export function exportOrdenCompraPdf(data: OrdenCompraPdfData): void {
  const { cliente, items, observaciones } = data;

  if (!items.length) {
    alert('El carrito está vacío. Agregue productos antes de descargar el PDF.');
    return;
  }

  if (!cliente.clienteNombre?.trim() || !cliente.clienteId?.trim()) {
    alert('Seleccione un cliente antes de descargar el PDF.');
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const fechaGeneracion = new Date().toLocaleString('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  const numeroOrden = `OC-${Date.now().toString(36).toUpperCase()}`;
  const total = calcularTotal(items);

  // Encabezado tipo factura
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(APP_CONFIG.name, margin, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(APP_CONFIG.description, margin, 21);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDEN DE COMPRA', pageWidth - margin, 16, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. ${numeroOrden}`, pageWidth - margin, 23, { align: 'right' });
  doc.text(fechaGeneracion, pageWidth - margin, 28, { align: 'right' });

  let y = 40;

  // Bloque datos del cliente / vendedor
  doc.setTextColor(...BRAND_COLOR);
  doc.setDrawColor(...ACCENT_COLOR);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'S');

  doc.setFillColor(247, 250, 252);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL PEDIDO', margin + 4, y + 5.5);

  y += 12;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(45, 55, 72);

  const colMid = margin + contentWidth / 2 + 2;
  const lineHeight = 5.5;

  const filasIzq: [string, string][] = [
    ['Cliente:', cliente.clienteNombre],
    ['ID Cliente:', cliente.clienteId],
    ['Dirección:', cliente.sucursalDireccion || '—'],
  ];

  const filasDer: [string, string][] = [
    ['Vendedor:', cliente.sucursalVendedor || '—'],
    ['Forma de pago:', cliente.formaPago?.trim() || '—'],
  ];

  filasIzq.forEach(([label, value], i) => {
    const ly = y + i * lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MUTED_COLOR);
    doc.text(label, margin + 4, ly);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(45, 55, 72);
    doc.text(value, margin + 28, ly, { maxWidth: contentWidth / 2 - 30 });
  });

  filasDer.forEach(([label, value], i) => {
    const ly = y + i * lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MUTED_COLOR);
    doc.text(label, colMid, ly);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(45, 55, 72);
    doc.text(value, colMid + 26, ly, { maxWidth: contentWidth / 2 - 32 });
  });

  y += 34;

  // Tabla de productos
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text('DETALLE DEL PEDIDO', margin, y);
  y += 4;

  const body = items.map((item, index) => {
    const subtotal = item.precio * item.cantidad;
    return [
      String(index + 1),
      item.codigo,
      item.nombre,
      String(item.cantidad),
      formatCurrency(item.precio),
      formatCurrency(subtotal),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['#', 'Código', 'Producto', 'Cant.', 'P. Unitario', 'Subtotal']],
    body,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      textColor: [45, 55, 72],
    },
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 22 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
    },
    alternateRowStyles: { fillColor: [247, 250, 252] },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 20;

  // Total destacado
  const totalBoxY = finalY + 6;
  const totalBoxW = 62;
  const totalBoxX = pageWidth - margin - totalBoxW;

  doc.setFillColor(...BRAND_COLOR);
  doc.roundedRect(totalBoxX, totalBoxY, totalBoxW, 14, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL', totalBoxX + 4, totalBoxY + 5.5);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(total), totalBoxX + totalBoxW - 4, totalBoxY + 11, { align: 'right' });

  let footerY = totalBoxY + 20;

  if (observaciones?.trim()) {
    doc.setTextColor(...BRAND_COLOR);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones:', margin, footerY);
    footerY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(74, 85, 104);
    const obsLines = doc.splitTextToSize(observaciones.trim(), contentWidth);
    doc.text(obsLines, margin, footerY);
    footerY += obsLines.length * 4 + 4;
  }

  // Pie de página
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...ACCENT_COLOR);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

  doc.setFontSize(7);
  doc.setTextColor(...MUTED_COLOR);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Documento generado automáticamente. No constituye factura electrónica.',
    pageWidth / 2,
    pageHeight - 12,
    { align: 'center' }
  );
  doc.setFont('helvetica', 'normal');
  doc.text(`${APP_CONFIG.name} v${APP_CONFIG.version}`, pageWidth / 2, pageHeight - 7, {
    align: 'center',
  });

  doc.save(buildNombreArchivo(cliente.clienteId));
}

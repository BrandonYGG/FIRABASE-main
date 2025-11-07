
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Order } from '@/lib/types';
import { format, getMonth, getYear, getDaysInMonth, startOfMonth, getDay, getDate } from 'date-fns';
import { es } from 'date-fns/locale';

// Augment jsPDF with the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

function drawCalendar(doc: jsPDF, order: Order, startY: number) {
    const startDate = order.fechaMinEntrega;
    const endDate = order.fechaMaxEntrega;
    const month = getMonth(startDate);
    const year = getYear(startDate);
    
    const firstDayOfMonth = startOfMonth(startDate);
    // getDay() returns 0 for Sunday, 1 for Monday... we want Monday as 0
    const startDayOfWeek = (getDay(firstDayOfMonth) + 6) % 7; 
    const daysInMonth = getDaysInMonth(startDate);

    const monthName = format(startDate, 'MMMM yyyy', { locale: es });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Calendario de Entrega', 14, startY);
    doc.setFontSize(12);
    doc.text(monthName.charAt(0).toUpperCase() + monthName.slice(1), 105, startY + 10, { align: 'center' });

    const cellWidth = 15;
    const cellHeight = 10;
    const startX = 14;
    const calendarY = startY + 20;
    const dayHeaders = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

    // Draw day headers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    dayHeaders.forEach((header, index) => {
        doc.text(header, startX + index * cellWidth + cellWidth / 2, calendarY, { align: 'center' });
    });

    let currentDay = 1;
    doc.setFont('helvetica', 'normal');
    doc.setLineWidth(0.2);

    for (let week = 0; week < 6; week++) {
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            if ((week === 0 && dayOfWeek < startDayOfWeek) || currentDay > daysInMonth) {
                continue;
            }

            const x = startX + dayOfWeek * cellWidth;
            const y = calendarY + (week + 1) * cellHeight;

            const currentDate = new Date(year, month, currentDay);
            const isStartDate = getDate(currentDate) === getDate(startDate) && getMonth(currentDate) === getMonth(startDate);
            const isEndDate = getDate(currentDate) === getDate(endDate) && getMonth(currentDate) === getMonth(endDate);
            const isInRange = currentDate > startDate && currentDate < endDate;
            
            if (isStartDate) {
                doc.setFillColor(34, 153, 84); // Green
                doc.setTextColor(255, 255, 255);
                doc.rect(x, y - cellHeight / 1.5, cellWidth, cellHeight, 'F');
            } else if (isEndDate) {
                doc.setFillColor(203, 67, 53); // Red
                doc.setTextColor(255, 255, 255);
                doc.rect(x, y - cellHeight / 1.5, cellWidth, cellHeight, 'F');
            } else if (isInRange) {
                doc.setFillColor(243, 243, 243); // Light gray
                doc.rect(x, y - cellHeight / 1.5, cellWidth, cellHeight, 'F');
            }
            
            doc.text(String(currentDay), x + cellWidth / 2, y, { align: 'center' });
            
            // Reset text color
            doc.setTextColor(0, 0, 0);

            currentDay++;
        }
        if (currentDay > daysInMonth) break;
    }
    
    // Add legend
    const legendX = startX + 7 * cellWidth + 10; // Position legend to the right of the calendar
    const legendY = calendarY + 2.5 * cellHeight;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Start Date Legend
    doc.setFillColor(34, 153, 84); // Green
    doc.rect(legendX, legendY - 3, 3, 3, 'F');
    doc.text('Fecha de inicio de entrega', legendX + 5, legendY);

    // End Date Legend
    doc.setFillColor(203, 67, 53); // Red
    doc.rect(legendX, legendY + 7, 3, 3, 'F');
    doc.text('Fecha límite de entrega', legendX + 5, legendY + 10);
}


export function generateOrderPdf(order: Order) {
  const doc = new jsPDF();

  const fullAddress = `${order.calle} ${order.numero}, ${order.colonia}, ${order.ciudad}, ${order.estado}, C.P. ${order.codigoPostal}`;
  const deliveryDate = `Del ${format(order.fechaMinEntrega, 'dd/MM/yyyy')} al ${format(order.fechaMaxEntrega, 'dd/MM/yyyy')}`;
  const isCashPayment = order.tipoPago === 'Efectivo';
  const title = isCashPayment ? 'Ticket de Compra (Pago en Efectivo)' : 'Resumen de Pedido';
  const idPrefix = isCashPayment ? 'TICKET' : 'PEDIDO';
  const orderId = `${idPrefix}-${order.id.substring(0, 8).toUpperCase()}`;

  // Header
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(orderId, 200, 22, { align: 'right' });


  // Order Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Pedido para la obra: ${order.obra}`, 14, 32);
  
  const details = [
    { title: 'Solicitante:', content: order.solicitante },
    { title: 'Dirección de Entrega:', content: fullAddress },
    { title: 'Fechas de Entrega:', content: deliveryDate },
    { title: 'Forma de Pago:', content: `${order.tipoPago}${order.tipoPago === 'Tarjeta' && order.frecuenciaCredito ? ` (${order.frecuenciaCredito})` : ''}` },
  ];

  doc.autoTable({
    startY: 40,
    body: details,
    theme: 'plain',
    styles: {
      cellPadding: { top: 1, right: 2, bottom: 1, left: 0 },
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
        if(data.column.index === 0) {
            data.cell.styles.halign = 'right';
        }
    }
  });

  const lastY = (doc as any).lastAutoTable.finalY || 80;

  // Materials Table
  doc.setFontSize(14);
  doc.text('Materiales Solicitados', 14, lastY + 10);

  const tableColumn = ["Descripción", "Cantidad", "Precio Unitario", "Subtotal"];
  const tableRows = order.materiales.map(item => [
    item.descripcion,
    item.cantidad,
    `$${item.precioUnitario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    `$${(item.cantidad * item.precioUnitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
  ]);

  doc.autoTable({
    startY: lastY + 15,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] }, // A blue color for the header
  });

  const finalTableY = (doc as any).lastAutoTable.finalY || lastY + 50;

  // Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total del Pedido:', 140, finalTableY + 10, { align: 'right' });
  doc.text(`$${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 200, finalTableY + 10, { align: 'right' });
  
  // Calendar
  let calendarY = finalTableY + 20;
  if (calendarY > 200) { // Add a new page if calendar won't fit
    doc.addPage();
    calendarY = 20;
  }
  drawCalendar(doc, order, calendarY);


  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} OrderFlow Construct`, 14, doc.internal.pageSize.height - 10);
  }

  // Save the PDF
  doc.save(`pedido_${order.obra.replace(/\s/g, '_')}_${order.id.substring(0,5)}.pdf`);
}

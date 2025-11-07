
'use client';

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import type { Order } from '@/lib/types';
import { generateOrderPdf } from '@/lib/pdf-generator';

interface OrderDetailsDialogProps {
  order: Order;
}

export function OrderDetailsDialog({ order }: OrderDetailsDialogProps) {
  
  const handleDownload = () => {
    generateOrderPdf(order);
  }

  const isCashPayment = order.tipoPago === 'Efectivo';
  const idPrefix = isCashPayment ? 'TICKET' : 'PEDIDO';
  const orderId = `${idPrefix}-${order.id.substring(0, 8).toUpperCase()}`;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Detalles del Pedido</span>
        </DialogTitle>
        <DialogDescription>
            Revisa los detalles completos del pedido para la obra "{order.obra}".
        </DialogDescription>
      </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-4">
            <div className="py-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div>
                        <p className="font-semibold text-foreground">ID del Pedido</p>
                        <p className="text-muted-foreground">{orderId}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">Solicitante</p>
                        <p className="text-muted-foreground">{order.solicitante}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">Dirección de Entrega</p>
                        <p className="text-muted-foreground">{`${order.calle} ${order.numero}, ${order.colonia}, ${order.ciudad}, ${order.estado}`}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-foreground">Forma de Pago</p>
                        <p className="text-muted-foreground">{`${order.tipoPago}${order.tipoPago === 'Tarjeta' && order.frecuenciaCredito ? ` (${order.frecuenciaCredito})` : ''}`}</p>
                    </div>
                </div>

                <h3 className="font-semibold text-lg mt-6 mb-2">Materiales</h3>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead className="text-right">Precio Unitario</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.materiales.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.descripcion}</TableCell>
                                    <TableCell className="text-center">{item.cantidad}</TableCell>
                                    <TableCell className="text-right">${item.precioUnitario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right">${(item.cantidad * item.precioUnitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-end items-center pt-4">
                    <span className="text-lg font-bold text-foreground">Total del Pedido:</span>
                    <span className="text-lg font-bold ml-4 text-primary">${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
            </div>
        </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
      </DialogFooter>
    </>
  );
}

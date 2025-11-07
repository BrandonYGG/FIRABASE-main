
'use client'
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HardHat, Loader2, CheckCircle, Trash2, MoreHorizontal } from 'lucide-react';
import { UrgencyBadge } from './urgency-badge';
import { Button } from '@/components/ui/button';
import { OrderStatus } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateOrderStatus } from '@/firebase/hooks/update-order-status';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { OrderDetailsDialog } from './order-details-dialog';
import { Badge } from '../ui/badge';
import { deleteOrder } from '@/firebase/hooks/delete-order';


type OrderCardProps = {
  order: Order;
  isAdminView?: boolean;
};

export function OrderCard({ order, isAdminView = false }: OrderCardProps) {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentStatus(order.status);
  }, [order.status]);
  
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
        await updateOrderStatus(order.userId, order.id, newStatus as keyof typeof OrderStatus);
        setCurrentStatus(newStatus as keyof typeof OrderStatus); // Update local state immediately
        toast({
            title: "Estado Actualizado",
            description: `El pedido de ${order.obra} ahora está ${newStatus}.`
        })
    } catch(error) {
        console.error("Failed to update status: ", error);
        toast({
            variant: 'destructive',
            title: "Error",
            description: "No se pudo actualizar el estado del pedido."
        })
    } finally {
        setIsUpdating(false);
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        await deleteOrder(order.userId, order.id);
        toast({
            title: "Pedido Eliminado",
            description: `El pedido de la obra "${order.obra}" ha sido eliminado.`,
        });
    } catch (error) {
        console.error("Failed to delete order:", error);
        toast({
            variant: "destructive",
            title: "Error al eliminar",
            description: "No se pudo eliminar el pedido. Verifique los permisos.",
        });
    } finally {
        setIsDeleting(false);
    }
  };

  const availableStatuses = useMemo(() => {
    const allStatuses = Object.values(OrderStatus);
    // If the order is "En proceso" or later, remove "Pendiente" from the options
    if (currentStatus === OrderStatus.EnProceso || currentStatus === OrderStatus.Entregado || currentStatus === OrderStatus.Cancelado) {
        return allStatuses.filter(status => status !== OrderStatus.Pendiente);
    }
    return allStatuses;
  }, [currentStatus]);


  const isDelivered = currentStatus === OrderStatus.Entregado;

  return (
    <Dialog>
      <Card className="flex flex-col min-h-[240px] justify-between">
        <CardHeader>
          {!isDelivered && <UrgencyBadge date={order.fechaMaxEntrega} />}
          <CardTitle className="text-lg font-headline truncate mt-2" title={order.obra}>{order.obra}</CardTitle>
          <CardDescription>
            Solicitante: {order.solicitante}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {isAdminView ? (
            <div className="flex items-center gap-2">
              <HardHat className="h-4 w-4 text-muted-foreground" />
              {isUpdating ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Actualizando...</span>
                </div>
              ) : isDelivered ? (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Entregado
                </Badge>
              ) : (
                <Select onValueChange={handleStatusChange} defaultValue={currentStatus}>
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Cambiar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map((status) => (
                      <SelectItem key={status} value={status} className="text-xs" disabled={status === currentStatus}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <Badge className="text-xs" variant={currentStatus === 'Entregado' ? 'secondary' : currentStatus === 'Cancelado' ? 'destructive' : 'default'}>
              {currentStatus}
            </Badge>
          )}
        </CardContent>
        <CardFooter className="flex justify-end items-center bg-muted/50 py-2 px-4 rounded-b-lg mt-auto">
          <div className="flex items-center gap-2">
            {isAdminView && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10" disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    <span className="sr-only">Eliminar Pedido</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que quieres eliminar este pedido?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción es permanente y no se puede deshacer. El pedido de la obra "{order.obra}" será eliminado definitivamente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      Sí, eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="mr-2 h-4 w-4" />
                Ver detalles
              </Button>
            </DialogTrigger>
          </div>
        </CardFooter>
      </Card>
      <DialogContent className="max-w-3xl">
        <OrderDetailsDialog order={order} />
      </DialogContent>
    </Dialog>
  );
}

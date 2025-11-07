'use client';

import { useState, useMemo } from 'react';
import { useOrders } from '@/firebase/hooks/use-orders';
import { OrderCard } from './order-card';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderFilters } from './order-filters';
import { Frown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function OrderList() {
  const { orders, loading, error } = useOrders();
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('');

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) => {
      const statusMatch = statusFilter ? order.status === statusFilter : true;
      const paymentTypeMatch = paymentTypeFilter ? order.tipoPago === paymentTypeFilter : true;
      return statusMatch && paymentTypeMatch;
    });
  }, [orders, statusFilter, paymentTypeFilter]);

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>No se pudieron cargar los pedidos. Por favor, intente de nuevo más tarde.</AlertDescription>
        </Alert>
    );
  }

  return (
    <div>
      <OrderFilters
        setStatusFilter={setStatusFilter}
        setPaymentTypeFilter={setPaymentTypeFilter}
      />
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[220px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold font-headline">No se encontraron pedidos</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Aún no has creado ningún pedido. ¡Crea uno para empezar!
            </p>
        </div>
      )}
    </div>
  );
}

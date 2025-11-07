'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { OrderFirestore, type Order } from '@/lib/types';

export function useOrders() {
  const firestore = useFirestore();
  const { user } = useUser();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Query for orders belonging to the user and order them by creation date
    return query(
        collection(firestore, 'users', user.uid, 'pedidos'),
        orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: orders, isLoading: loading, error } = useCollection<OrderFirestore>(ordersQuery);

  // Memoize the mapped data to prevent re-computation on every render
  const mappedOrders: Order[] = useMemo(() => {
    if (!orders) return [];
    // Map Firestore documents to the Order type, converting Timestamps to Dates
    return orders.map(order => ({
      ...order,
      fechaMinEntrega: order.fechaMinEntrega.toDate(),
      fechaMaxEntrega: order.fechaMaxEntrega.toDate(),
      createdAt: order.createdAt.toDate(),
    }));
  }, [orders]);

  return { orders: mappedOrders, loading, error };
}

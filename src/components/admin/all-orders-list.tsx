
'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollectionGroup } from '@/firebase/hooks/use-collection-group';
import { OrderFirestore, Order } from '@/lib/types';
import { OrderCard } from '../orders/order-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Frown, ShieldAlert, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';

export function AllOrdersList() {
    const firestore = useFirestore();
    const [searchQuery, setSearchQuery] = useState('');

    const allOrdersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'pedidos'));
    }, [firestore]);
    
    // Note: We are using a hook that might depend on collectionGroup permissions
    const { data: allOrders, isLoading, error } = useCollectionGroup<OrderFirestore>(allOrdersQuery);
    
    const filteredOrders: Order[] = useMemo(() => {
        if (!allOrders) return [];
        let orders = allOrders.map(order => ({
            ...order,
            fechaMinEntrega: order.fechaMinEntrega.toDate(),
            fechaMaxEntrega: order.fechaMaxEntrega.toDate(),
            createdAt: order.createdAt.toDate(),
        }));

        if (searchQuery) {
            orders = orders.filter(o => o.obra.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        return orders.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());

    }, [allOrders, searchQuery]);

    return (
        <div>
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar pedido por nombre de la obra..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                     {error && (
                        <Alert variant="destructive" className="mt-4">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Error de Permisos</AlertTitle>
                            <AlertDescription>No se pudo cargar la lista de todos los pedidos. Es posible que necesite ajustar las reglas de seguridad de Firestore para permitir consultas de grupo (collectionGroup) en 'pedidos' para administradores.</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
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
                        <OrderCard key={order.id} order={order} isAdminView={true} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold font-headline">
                        No se encontraron pedidos
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {searchQuery ? 'Ningún pedido coincide con la búsqueda.' : 'No hay pedidos registrados en el sistema.'}
                    </p>
                </div>
            )}
        </div>
    )
}

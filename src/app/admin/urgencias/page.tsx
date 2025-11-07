
'use client';
import { useState, useMemo, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { OrderFirestore, Order, UserProfileWithId } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getUrgency, URGENCY_LEVELS } from '@/components/orders/urgency-badge';
import { UrgencyColumn } from '@/components/admin/urgency-column';

export default function UrgenciesPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllOrders = async () => {
            if (!firestore || !user) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // 1. Get all users
                const usersSnapshot = await getDocs(query(collection(firestore, 'users')));
                const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfileWithId));

                // 2. Fetch orders for each user
                const ordersPromises = users.map(u => {
                    const ordersCollection = collection(firestore, 'users', u.id, 'pedidos');
                    return getDocs(ordersCollection);
                });

                const ordersSnapshots = await Promise.all(ordersPromises);
                
                const fetchedOrders: Order[] = [];
                ordersSnapshots.forEach(snapshot => {
                    snapshot.docs.forEach(doc => {
                        const data = doc.data() as OrderFirestore;
                        fetchedOrders.push({
                            ...data,
                            id: doc.id,
                            fechaMinEntrega: data.fechaMinEntrega.toDate(),
                            fechaMaxEntrega: data.fechaMaxEntrega.toDate(),
                            createdAt: data.createdAt.toDate(),
                        });
                    });
                });

                setAllOrders(fetchedOrders);

            } catch (err: any) {
                console.error(err);
                setError("No se pudieron cargar los pedidos. Verifique los permisos de administrador.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllOrders();
    }, [firestore, user]);

    const classifiedOrders = useMemo(() => {
        const urgent = allOrders.filter(o => getUrgency(o.fechaMaxEntrega).level === 'Urgente');
        const soon = allOrders.filter(o => getUrgency(o.fechaMaxEntrega).level === 'Pronto');
        const normal = allOrders.filter(o => getUrgency(o.fechaMaxEntrega).level === 'Normal');
        return { urgent, soon, normal };
    }, [allOrders]);
    
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex-shrink-0">
                 <h1 className="text-3xl font-bold font-headline tracking-tight">
                    Pedidos por Nivel de Urgencia
                </h1>
                <p className="text-muted-foreground">Clasificación automática de pedidos según la fecha de entrega límite.</p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                    <>
                        <Skeleton className="w-full h-full min-h-[400px]" />
                        <Skeleton className="w-full h-full min-h-[400px]" />
                        <Skeleton className="w-full h-full min-h-[400px]" />
                    </>
                ) : (
                    <>
                        <UrgencyColumn urgency={URGENCY_LEVELS.Urgente} orders={classifiedOrders.urgent} />
                        <UrgencyColumn urgency={URGENCY_LEVELS.Pronto} orders={classifiedOrders.soon} />
                        <UrgencyColumn urgency={URGENCY_LEVELS.Normal} orders={classifiedOrders.normal} />
                    </>
                )}
            </div>
        </div>
    );
}

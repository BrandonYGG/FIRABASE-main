'use client'
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const OrderForm = dynamic(() => import('@/components/orders/order-form').then(mod => mod.OrderForm), {
  ssr: false,
  loading: () => (
     <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-10 w-3/5" />
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <div className="grid md:grid-cols-3 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
         <Skeleton className="h-40 w-full" />
         <Skeleton className="h-10 w-32" />
     </div>
  )
});

export default function NuevoPedidoPage() {

  return (
    <div>
      <OrderForm />
    </div>
  );
}

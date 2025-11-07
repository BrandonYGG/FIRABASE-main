
'use client';
import { OrderCard } from '../orders/order-card';
import { type Order } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Frown } from 'lucide-react';
import type { Urgency } from '../orders/urgency-badge';

interface UrgencyColumnProps {
  urgency: Urgency;
  orders: Order[];
}

export function UrgencyColumn({ urgency, orders }: UrgencyColumnProps) {
  const { text, variant } = urgency;
  
  const variantClasses = {
      destructive: 'border-destructive/50',
      default: 'border-yellow-500/50',
      secondary: 'border-green-600/50'
  }

  const headerVariantClasses = {
      destructive: 'bg-destructive/10 text-destructive-foreground',
      default: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      secondary: 'bg-green-600/10 text-green-700 dark:text-green-500'
  }

  return (
    <div className={`flex flex-col h-full rounded-lg border ${variantClasses[variant]}`}>
      <div className={`p-4 rounded-t-lg font-bold text-lg font-headline ${headerVariantClasses[variant]}`}>
        {text} ({orders.length})
      </div>
      <ScrollArea className="flex-1 bg-muted/30">
        <div className="p-4 space-y-4">
          {orders.length > 0 ? (
            orders.map(order => (
              <OrderCard key={order.id} order={order} isAdminView={true} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
                <Frown className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No hay pedidos en esta categoría.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

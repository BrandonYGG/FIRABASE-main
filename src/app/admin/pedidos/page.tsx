'use client';
import { AllOrdersList } from '@/components/admin/all-orders-list';

export default function AllOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline tracking-tight">
        Todos los Pedidos
      </h1>
      <AllOrdersList />
    </div>
  );
}

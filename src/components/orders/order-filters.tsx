'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderStatus, PaymentType } from '@/lib/types';
import type { Dispatch, SetStateAction } from 'react';

type OrderFiltersProps = {
  setStatusFilter: Dispatch<SetStateAction<string>>;
  setPaymentTypeFilter: Dispatch<SetStateAction<string>>;
};

export function OrderFilters({ setStatusFilter, setPaymentTypeFilter }: OrderFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Select onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {Object.values(OrderStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => setPaymentTypeFilter(value === 'all' ? '' : value)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar por pago" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los pagos</SelectItem>
          {Object.values(PaymentType).map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

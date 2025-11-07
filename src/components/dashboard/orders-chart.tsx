'use client';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { type Order } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Frown } from 'lucide-react';

interface OrdersChartProps {
  orders: Order[] | null;
  loading: boolean;
}

const chartConfig = {
  total: {
    label: 'Monto Total',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function OrdersChart({ orders, loading }: OrdersChartProps) {
  const monthlyData = useMemo(() => {
    if (!orders) return [];

    const dataByMonth: { [key: string]: { month: string; date: Date; total: number } } = {};

    orders.forEach((order) => {
      const monthKey = format(order.createdAt, 'yyyy-MM');
      if (!dataByMonth[monthKey]) {
        dataByMonth[monthKey] = {
          month: format(order.createdAt, 'MMM', { locale: es }),
          date: new Date(order.createdAt.getFullYear(), order.createdAt.getMonth(), 1),
          total: 0,
        };
      }
      dataByMonth[monthKey].total += order.total;
    });
    
    // Sort chronologically
    const sortedData = Object.values(dataByMonth).sort((a, b) => a.date.getTime() - b.date.getTime());

    return sortedData;
  }, [orders]);

  if (loading) {
    return <Skeleton className="h-[250px] w-full" />;
  }

  if (monthlyData.length === 0) {
    return (
        <div className="flex h-[250px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center">
            <Frown className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No hay datos suficientes para mostrar el gráfico.</p>
        </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart accessibilityLayer data={monthlyData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
        />
        <YAxis
          tickFormatter={(value) => `$${Number(value).toLocaleString('es-MX')}`}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
                formatter={(value) => `$${Number(value).toLocaleString('es-MX')}`}
                indicator="dot"
            />
        }
        />
        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

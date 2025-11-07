'use client';

import Link from 'next/link';
import { ArrowUpRight, DollarSign, ListOrdered, FilePlus2, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOrders } from '@/firebase/hooks/use-orders';
import { Skeleton } from '@/components/ui/skeleton';
import { Order } from '@/lib/types';
import { OrdersChart } from '@/components/dashboard/orders-chart';


export default function DashboardPage() {
  const { orders, loading } = useOrders();

  const totalOrders = orders?.length ?? 0;
  const totalAmount = orders?.reduce((sum, order: any) => sum + (order.total || 0), 0) ?? 0;
  const pendingOrders = orders?.filter((o: any) => o.status === 'Pendiente').length ?? 0;
  const inProgressOrders = orders?.filter((o: any) => o.status === 'En proceso').length ?? 0;
  const recentOrders = orders?.slice(0, 5) ?? [];


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link href="/pedidos/nuevo">
            <PlusCircle />
            Nuevo Pedido
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos Totales
            </CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{totalOrders}</div>}
            <p className="text-xs text-muted-foreground">
              -
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monto Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">S/ {totalAmount.toLocaleString('es-MX')}</div>}
            <p className="text-xs text-muted-foreground">
              -
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
            <FilePlus2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{pendingOrders}</div>}
             <p className="text-xs text-muted-foreground">-</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos en Proceso
            </CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{inProgressOrders}</div>}
            <p className="text-xs text-muted-foreground">
              -
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Actividad Mensual</CardTitle>
             <CardDescription>
              Un resumen del monto total de los pedidos por mes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <OrdersChart orders={orders} loading={loading} />
          </CardContent>
        </Card>
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>
              Los últimos pedidos registrados en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Obra</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                   <TableHead className="hidden sm:table-cell">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                        </TableRow>
                    ))
                ) : recentOrders.length > 0 ? (
                    recentOrders.map((order: any) => (
                        <TableRow key={order.id}>
                            <TableCell>
                                <div className="font-medium">{order.obra}</div>
                                <div className="hidden text-sm text-muted-foreground md:inline">
                                    {order.solicitante}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">S/ {order.total?.toLocaleString('es-MX')}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <Badge className="text-xs" variant={order.status === 'Entregado' ? 'secondary' : order.status === 'Cancelado' ? 'destructive' : 'default'}>
                                    {order.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            No hay pedidos para mostrar.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

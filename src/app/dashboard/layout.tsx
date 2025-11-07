
'use client';

import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Construction, LayoutDashboard, ListOrdered, FilePlus2, LogOut, Settings, CalendarIcon, Moon, Sun, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from 'next-themes';
import { useAuth, useUser } from '@/firebase';
import { Notifications } from '@/components/notifications/notifications';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const isActive = (path: string) => pathname === path;
  const [currentDate, setCurrentDate] = useState('');
  const { setTheme } = useTheme();

  useEffect(() => {
    // We only want to check for a user when loading is complete
    if (isUserLoading) return;
    
    // If loading is finished and there's no user, redirect to login
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);


  useEffect(() => {
    const today = new Date();
    // Format: 10/ Octubre / 2025
    setCurrentDate(format(today, "d/ MMMM / yyyy", { locale: es }));
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/auth/login');
    }
  };


  const sidebarMenuItems = [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/pedidos', label: 'Mis Pedidos', icon: ListOrdered },
      { href: '/pedidos/nuevo', label: 'Nuevo Pedido', icon: FilePlus2 },
  ];
  
  if (isUserLoading || !user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }


  return (
    <SidebarProvider>
        <Sidebar collapsible="icon" variant="floating" side="left">
            <SidebarHeader>
                <div className="flex items-center space-x-2 px-2">
                    <Construction className="h-6 w-6 text-primary" />
                    <span className="font-bold font-headline text-lg group-data-[collapsible=icon]:hidden">OrderFlow</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {sidebarMenuItems.map((item) =>(
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                            <Link href={item.href}>
                                <item.icon/>
                                <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
             <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/dashboard/settings')} tooltip="Configuración">
                             <Link href="/dashboard/settings">
                                <Settings />
                                <span>Configuración</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Contraer menú">
                           <SidebarTrigger />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                 <div className="flex items-center gap-4">
                 </div>
                 <div className="ml-auto flex items-center gap-2">
                    <Notifications />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:h-8 md:w-8">
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Cambiar tema</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                Claro
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                Oscuro
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                Sistema
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="overflow-hidden rounded-full"
                        >
                            <Avatar>
                                <AvatarImage src={user.photoURL || undefined} alt="Avatar de usuario" className="object-cover" />
                                <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings">Configuración</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Soporte</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
            {currentDate && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div className="flex items-center rounded-lg bg-background/80 backdrop-blur-sm p-2 border shadow-md text-sm font-bold text-foreground">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>{currentDate}</span>
                    </div>
                </div>
            )}
        </SidebarInset>
    </SidebarProvider>
  );
}

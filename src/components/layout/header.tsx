'use client';

import Link from 'next/link';
import { Construction, LogIn, UserPlus, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { useState } from 'react';

export default function Header() {
  const { setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Construction className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">OrderFlow Construct</span>
          </Link>
        </div>
        <nav className="ml-auto hidden md:flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Cambiar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Oscuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" asChild>
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Sesión
            </Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">
              <UserPlus className="mr-2 h-4 w-4" />
              Registrarse
            </Link>
          </Button>
        </nav>
        
        {/* Mobile Menu */}
        <div className="ml-auto md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full p-4">
                <Link href="/" className="flex items-center space-x-2 mb-8" onClick={() => setIsMobileMenuOpen(false)}>
                  <Construction className="h-6 w-6 text-primary" />
                  <span className="font-bold font-headline">OrderFlow</span>
                </Link>
                <div className="flex flex-col gap-4">
                  <SheetClose asChild>
                    <Button variant="outline" asChild>
                      <Link href="/auth/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Iniciar Sesión
                      </Link>
                    </Button>
                  </SheetClose>
                   <SheetClose asChild>
                    <Button asChild>
                      <Link href="/auth/register">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Registrarse
                      </Link>
                    </Button>
                  </SheetClose>
                </div>
                 <div className="mt-auto">
                    <p className="text-sm text-muted-foreground mb-2">Cambiar tema</p>
                    <div className="flex justify-around">
                       <Button variant="ghost" size="icon" onClick={() => setTheme('light')}><Sun/></Button>
                       <Button variant="ghost" size="icon" onClick={() => setTheme('dark')}><Moon/></Button>
                       <Button variant="ghost" size="icon" onClick={() => setTheme('system')}>S</Button>
                    </div>
                 </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}

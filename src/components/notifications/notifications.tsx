'use client';
import { useState } from 'react';
import { useNotifications } from '@/firebase/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, FileText, Frown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { markNotificationsAsRead } from '@/firebase/hooks/update-notification-status';
import Link from 'next/link';

export function Notifications() {
  const { notifications, unreadCount, loading, error } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Mark as read when the popover is opened
      const unreadIds = notifications
        ?.filter((n) => !n.read)
        .map((n) => n.id);
      if (unreadIds && unreadIds.length > 0) {
        markNotificationsAsRead(unreadIds);
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative md:h-8 md:w-8"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          <span className="sr-only">Ver notificaciones</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 font-medium border-b">
          <h3 className="text-sm">Notificaciones</h3>
        </div>
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[100px]" />
                    </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <Frown className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No se pudieron cargar las notificaciones.
              </p>
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={`/pedidos?status=${notif.status}`}
                  passHref
                  className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="grid gap-1 text-sm">
                    <p className="font-semibold leading-tight">{notif.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notif.createdAt, {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 self-center" />
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <Bell className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No tienes notificaciones nuevas.
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

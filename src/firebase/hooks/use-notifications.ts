'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { NotificationFirestore, type Notification } from '@/lib/types';

export function useNotifications() {
  const firestore = useFirestore();
  const { user } = useUser();

  const notificationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'users', user.uid, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(50) // Limit to the last 50 notifications
    );
  }, [firestore, user]);

  const { data: notifications, isLoading: loading, error } = useCollection<NotificationFirestore>(notificationsQuery);

  const mappedNotifications: Notification[] = useMemo(() => {
    if (!notifications) return [];
    return notifications.map(notif => ({
      ...notif,
      createdAt: notif.createdAt.toDate(),
    }));
  }, [notifications]);

  const unreadCount = useMemo(() => {
      if (!notifications) return 0;
      return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return { notifications: mappedNotifications, unreadCount, loading, error };
}

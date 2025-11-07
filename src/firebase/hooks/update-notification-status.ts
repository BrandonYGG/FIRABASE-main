'use client';

import { doc, writeBatch } from 'firebase/firestore';
import { initializeFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';

export const markNotificationsAsRead = async (notificationIds: string[]) => {
    const { firestore, auth } = initializeFirebase();
    const userId = auth.currentUser?.uid;

    if (!userId || notificationIds.length === 0) {
        return;
    }

    const batch = writeBatch(firestore);

    notificationIds.forEach(id => {
        const notifRef = doc(firestore, 'users', userId, 'notifications', id);
        batch.update(notifRef, { read: true });
    });

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error marking notifications as read:", error);

        // For simplicity, we just log the error. In a real app, you might want more robust error handling.
        // We can't easily emit a permission error for a batch write in the same way.
    }
};

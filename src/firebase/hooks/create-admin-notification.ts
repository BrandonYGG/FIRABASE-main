
'use client';

import { collection, query, where, getDocs, addDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

interface AdminNotificationPayload {
    orderId: string;
    orderName: string;
    userName: string;
}

export const createAdminNotification = async (payload: AdminNotificationPayload) => {
    const { firestore } = initializeFirebase();

    try {
        // 1. Find all admins
        const usersRef = collection(firestore, 'users');
        const adminQuery = query(usersRef, where("role", "==", "admin"));
        const adminSnapshots = await getDocs(adminQuery);

        if (adminSnapshots.empty) {
            console.log("No admin users found to notify.");
            return;
        }

        // 2. Create a notification for each admin
        const batch = writeBatch(firestore);
        const message = `Nuevo pedido de "${payload.userName}" para la obra "${payload.orderName}".`;

        adminSnapshots.forEach(adminDoc => {
            const adminId = adminDoc.id;
            const notificationRef = collection(firestore, 'users', adminId, 'notifications');
            const newNotifRef = doc(notificationRef); // Create a reference with a new ID

            batch.set(newNotifRef, {
                userId: adminId, // The ID of the user receiving the notification (the admin)
                orderId: payload.orderId,
                orderName: payload.orderName,
                message: message,
                status: 'Pendiente', // The status of the order that triggered the notification
                createdAt: Timestamp.now(),
                read: false,
            });
        });

        // 3. Commit the batch
        await batch.commit();

    } catch (error) {
        console.error("Error creating admin notifications:", error);
        // In a real app, you might want more robust error handling,
        // but for now, we'll log it. We don't want to block the user's
        // order creation process if notifications fail.
    }
};

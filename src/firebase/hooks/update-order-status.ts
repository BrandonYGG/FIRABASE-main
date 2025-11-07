'use client';

import { doc, updateDoc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { initializeFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';

export const updateOrderStatus = async (userId: string, orderId: string, newStatus: string) => {
    const { firestore } = initializeFirebase();
    
    if (!userId || !orderId) {
        throw new Error('User ID and Order ID must be provided.');
    }

    const orderRef = doc(firestore, 'users', userId, 'pedidos', orderId);

    try {
        // First, get the order to have its data for the notification
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) {
            throw new Error("Order not found!");
        }
        const orderData = orderSnap.data();

        // Update the order status
        await updateDoc(orderRef, {
            status: newStatus,
        });

        // Then, create a notification for the user
        const notificationsCollection = collection(firestore, 'users', userId, 'notifications');
        const message = `El estado de tu pedido para la obra "${orderData.obra}" ha cambiado a: ${newStatus}.`;
        
        await addDoc(notificationsCollection, {
            userId,
            orderId,
            orderName: orderData.obra,
            message,
            status: newStatus,
            createdAt: Timestamp.now(),
            read: false,
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        
        const permissionError = new FirestorePermissionError({
            path: orderRef.path,
            operation: 'update',
            requestResourceData: { status: newStatus },
        });
        errorEmitter.emit('permission-error', permissionError);

        throw error;
    }
};

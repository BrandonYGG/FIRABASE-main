
'use client';

import { doc, deleteDoc } from 'firebase/firestore';
import { initializeFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';

export const deleteOrder = async (userId: string, orderId: string) => {
    // We can't use the useFirestore() hook here as this is not a component.
    // So we initialize firebase and get the instance.
    const { firestore } = initializeFirebase();
    
    if (!userId || !orderId) {
        throw new Error('User ID and Order ID must be provided.');
    }

    const orderRef = doc(firestore, 'users', userId, 'pedidos', orderId);

    try {
        await deleteDoc(orderRef);
    } catch (error) {
        console.error("Error deleting order:", error);
        
        // Create and emit a contextual error for permission issues
        const permissionError = new FirestorePermissionError({
            path: orderRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);

        // Re-throw the original error to be caught by the caller
        throw error;
    }
};

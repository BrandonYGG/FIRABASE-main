'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { updateProfile } from "firebase/auth";

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
        }
    }, [user]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !firestore) {
            toast({ title: "Error", description: "Servicios de Firebase no disponibles.", variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);

        const nameChanged = displayName !== (user.displayName || '');

        if (!nameChanged) {
            toast({ title: "Sin cambios", description: "No has modificado tu nombre." });
            setIsSubmitting(false);
            return;
        }

        try {
            // Update Auth Profile
            await updateProfile(user, { displayName });
            
            // Update Firestore Document
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, { displayName });
            
            toast({
                title: "Perfil Actualizado",
                description: "Tu nombre ha sido guardado con éxito.",
            });

        } catch (error: any) {
            console.error("Error updating profile: ", error);
            toast({
                title: "Error al actualizar",
                description: error.message || "No se pudo actualizar el perfil.",
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isUserLoading) {
        return (
             <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 font-headline tracking-tight">
                    Configuración de Perfil
                </h1>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-2/3 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-6">
                             <Skeleton className="h-24 w-24 rounded-full" />
                             <div className="flex-grow space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                             </div>
                        </div>
                         <div className="flex justify-end">
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </CardContent>
                </Card>
             </div>
        )
    }

    if (!user) {
        return null; // Or a message telling the user to log in
    }

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 font-headline tracking-tight">
            Configuración de Perfil
        </h1>
        <Card>
            <CardHeader>
                <CardTitle>Detalles del Perfil</CardTitle>
                <CardDescription>
                    Actualiza tu nombre para tu perfil.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                     <div className="flex items-center space-x-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.photoURL || undefined} alt="Avatar de usuario" className="object-cover" />
                            <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow space-y-2">
                            <Label htmlFor="name">Nombre Completo o de Empresa</Label>
                            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Correo Electrónico</Label>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link"
import Image from "next/image"
import { useState } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth, useFirestore } from '@/firebase';
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, type User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";

const LoginSchema = z.object({
  email: z.string().email({ message: 'Por favor, ingrese un correo electrónico válido.' }),
  password: z.string().min(1, { message: 'La contraseña es obligatoria.' }),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<LoginValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const handleUserSession = async (user: User) => {
        if (!firestore) return;
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        let userProfile: UserProfile | undefined;

        if (!userDoc.exists()) {
            // New user from Google Sign In, create profile with default role
            userProfile = {
                email: user.email!,
                // Use email prefix as a fallback for displayName
                displayName: user.displayName || user.email!.split('@')[0], 
                photoURL: user.photoURL || undefined,
                role: 'personal', // Assign default role
            };
            await setDoc(userRef, userProfile);
        } else {
            // Existing user, check if displayName or photoURL needs an update from Google profile
            const existingData = userDoc.data() as UserProfile;
            userProfile = existingData;
            const updates: Partial<UserProfile> = {};
            if (user.displayName && user.displayName !== existingData.displayName) {
                updates.displayName = user.displayName;
            }
            if (user.photoURL && user.photoURL !== existingData.photoURL) {
                updates.photoURL = user.photoURL;
            }
            if (Object.keys(updates).length > 0) {
                await setDoc(userRef, updates, { merge: true });
            }
        }
        
        if (userProfile?.role === 'admin') {
            router.push('/admin/dashboard');
        } else {
            router.push('/dashboard');
        }
    }

    async function onSubmit(data: LoginValues) {
        setIsLoading(true);
        if (!auth) {
            toast({
                variant: "destructive",
                title: "Error de configuración",
                description: "El servicio de autenticación no está disponible.",
            });
            setIsLoading(false);
            return;
        }
        try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            await handleUserSession(userCredential.user);
        } catch (error: any) {
             let description = "Ocurrió un error inesperado.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                description = "Credenciales inválidas. Por favor, verifica tu correo y contraseña.";
            }
            toast({
                variant: "destructive",
                title: "Error al iniciar sesión",
                description,
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        if (!auth) {
            toast({ variant: 'destructive', title: 'Error de configuración', description: 'El servicio de autenticación no está disponible.' });
            setIsGoogleLoading(false);
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await handleUserSession(result.user);
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Error con Google",
                description: "No se pudo iniciar sesión con Google. Inténtalo de nuevo.",
            });
        } finally {
            setIsGoogleLoading(false);
        }
    }


  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Iniciar Sesión</CardTitle>
                    <CardDescription>
                    Elige tu método preferido para acceder a tu cuenta.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                        {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Image src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" alt="Google" width={16} height={16} className="mr-2" />}
                        Continuar con Google
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                O continuar con
                            </span>
                        </div>
                    </div>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correo Electrónico</FormLabel>
                                <FormControl>
                                    <Input placeholder="nombre@ejemplo.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between items-center">
                                  <FormLabel>Contraseña</FormLabel>
                                  <Link
                                      href="/auth/restablecer-contrasena"
                                      className="text-xs text-muted-foreground underline"
                                  >
                                      ¿Olvidaste tu contraseña?
                                  </Link>
                                </div>
                                <div className="relative group">
                                    <FormControl>
                                        <Input type={showPassword ? "text" : "password"} {...field} />
                                    </FormControl>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform duration-200 ease-in-out group-hover:scale-110"
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showPassword 
                                            ? <EyeOff className="h-5 w-5 transition-opacity duration-300 animate-in fade-in" /> 
                                            : <Eye className="h-5 w-5 transition-opacity duration-300 animate-in fade-in" />
                                        }
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" type="submit" disabled={isLoading || isGoogleLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Iniciar Sesión con Correo
                    </Button>
                    <div className="text-center text-sm">
                    ¿No tienes una cuenta?{" "}
                    <Link href="/auth/register" className="underline">
                        Regístrate
                    </Link>
                    </div>
                </CardFooter>
            </Card>
        </form>
      </Form>
  )
}

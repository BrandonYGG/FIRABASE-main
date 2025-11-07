
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
import { Mail, Loader2, CircleCheck } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";

const ResetSchema = z.object({
  email: z.string().email({ message: 'Por favor, ingrese un correo electrónico válido.' }),
});

type ResetValues = z.infer<typeof ResetSchema>;

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const auth = useAuth();
    const { toast } = useToast();

    const form = useForm<ResetValues>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: '',
        }
    });

    async function onSubmit(data: ResetValues) {
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
            auth.languageCode = 'es'; // Set language to Spanish
            await sendPasswordResetEmail(auth, data.email);
            setIsSubmitted(true);
        } catch (error: any) {
            console.error("Password reset error:", error);
             toast({
                variant: "destructive",
                title: "Error al enviar correo",
                description: "No se pudo enviar el correo de restablecimiento. Por favor, inténtelo de nuevo.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isSubmitted) {
        return (
            <Card className="w-full max-w-sm text-center">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CircleCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-headline mt-4">Correo Enviado</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Si existe una cuenta con el correo electrónico proporcionado, hemos enviado un enlace para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada (y la carpeta de spam).
                    </p>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/auth/login">Volver a Iniciar Sesión</Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Restablecer Contraseña</CardTitle>
                    <CardDescription>
                    Ingresa tu correo electrónico y te enviaremos un enlace para que puedas recuperar tu cuenta.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correo Electrónico</FormLabel>
                                <div className="relative">
                                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                     <FormControl>
                                        <Input placeholder="nombre@ejemplo.com" {...field} className="pl-9" />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar enlace de recuperación
                    </Button>
                    <div className="text-center text-sm">
                    ¿Recordaste tu contraseña?{" "}
                    <Link href="/auth/login" className="underline">
                        Inicia Sesión
                    </Link>
                    </div>
                </CardFooter>
            </Card>
        </form>
      </Form>
  )
}

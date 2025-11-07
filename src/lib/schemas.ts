'use client';
import { z } from 'zod';

// Password validation regexes
const hasUpperCase = /(?=.*[A-Z])/;
const hasNumber = /(?=.*\d)/;
const hasSpecialChar = /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
const noIdenticalConsecutiveChars = /^(?!.*(.)\1)/;

// Custom validation function for sequential characters
const noSequentialChars = (password: string): boolean => {
    for (let i = 0; i < password.length - 2; i++) {
        const char1 = password.charCodeAt(i);
        const char2 = password.charCodeAt(i + 1);
        const char3 = password.charCodeAt(i + 2);

        // Check for sequential numbers (e.g., 123, 456)
        if (char2 === char1 + 1 && char3 === char2 + 1) {
            return false;
        }
        // Check for sequential letters, case-insensitive (e.g., abc, GHI)
        const lowerChar1 = password[i].toLowerCase().charCodeAt(0);
        const lowerChar2 = password[i+1].toLowerCase().charCodeAt(0);
        const lowerChar3 = password[i+2].toLowerCase().charCodeAt(0);
        if (lowerChar2 === lowerChar1 + 1 && lowerChar3 === lowerChar2 + 1) {
            return false;
        }
    }
    return true;
};


const passwordSchema = z.string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    .regex(hasUpperCase, { message: 'Debe contener al menos una letra mayúscula.' })
    .regex(hasNumber, { message: 'Debe contener al menos un número.' })
    .regex(hasSpecialChar, { message: 'Debe contener al menos un símbolo especial.' })
    .regex(noIdenticalConsecutiveChars, { message: 'No debe contener caracteres idénticos consecutivos.' })
    .refine(noSequentialChars, { message: 'No debe contener secuencias de caracteres (ej. "abc", "123").' });


// Schema for Personal Registration
export const PersonalRegistrationSchema = z.object({
    fullName: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
    email: z.string().email({ message: 'Correo electrónico inválido.' }),
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'], // Set the error on the confirmation field
});

// Schema for Company Registration
export const CompanyRegistrationSchema = z.object({
    companyName: z.string().min(3, { message: 'El nombre de la empresa debe tener al menos 3 caracteres.' }),
    rfc: z.string().regex(/^[A-Z&Ñ]{3,4}\d{6}[A-V1-9][A-Z\d]{2}$/, { message: 'RFC inválido.' }),
    phone: z.string().regex(/^\d{10}$/, { message: 'El teléfono debe tener 10 dígitos.' }),
    email: z.string().email({ message: 'Correo electrónico inválido.' }),
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'], // Set the error on the confirmation field
});

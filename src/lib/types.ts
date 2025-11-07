import { z } from 'zod';
import type { Timestamp } from 'firebase/firestore';

export const PaymentType = {
  Efectivo: 'Efectivo',
  Tarjeta: 'Tarjeta',
} as const;

export const CreditFrequency = {
  Semanal: 'Semanal',
  Quincenal: 'Quincenal',
  Mensual: 'Mensual',
} as const;

export const OrderStatus = {
    Pendiente: 'Pendiente',
    EnProceso: 'En proceso',
    Entregado: 'Entregado',
    Cancelado: 'Cancelado',
} as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export const MaterialItemSchema = z.object({
  materialId: z.string().min(1, { message: "Debe seleccionar un material." }),
  descripcion: z.string(),
  cantidad: z.number().min(1, { message: "La cantidad debe ser al menos 1." }),
  precioUnitario: z.number(),
});


export const OrderFormSchema = z.object({
  solicitante: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  obra: z.string().min(3, { message: 'El nombre de la obra debe tener al menos 3 caracteres.' }),
  calle: z.string().min(3, { message: 'La calle debe tener al menos 3 caracteres.' }),
  numero: z.string().min(1, 'El número es obligatorio.'),
  codigoPostal: z.string().regex(/^\d{5}$/, { message: 'El código postal debe tener 5 dígitos.' }),
  colonia: z.string().min(3, { message: 'La colonia debe tener al menos 3 caracteres.' }),
  ciudad: z.string().min(1, { message: 'Debe seleccionar una ciudad/municipio.' }),
  estado: z.string().min(1, { message: 'Debe seleccionar un estado.' }),
  fechaMinEntrega: z.coerce.date({
    required_error: "La fecha mínima de entrega es obligatoria.",
    invalid_type_error: "Formato de fecha inválido.",
  }),
  fechaMaxEntrega: z.coerce.date({
    required_error: "La fecha máxima de entrega es obligatoria.",
    invalid_type_error: "Formato de fecha inválido.",
  }),
  tipoPago: z.nativeEnum(PaymentType, {
    required_error: 'Debe seleccionar un tipo de pago.',
  }),
  frecuenciaCredito: z.nativeEnum(CreditFrequency).nullable().optional(),
  metodoPago: z.string().nullable().optional(),
  total: z.number(),
  materiales: z.array(MaterialItemSchema).min(1, { message: "Debe agregar al menos un material." }),
  ine: z.any().optional(),
  comprobanteDomicilio: z.any().optional(),
}).refine(data => data.fechaMaxEntrega >= data.fechaMinEntrega, {
    message: 'La fecha máxima no puede ser anterior a la fecha mínima.',
    path: ['fechaMaxEntrega'],
}).refine(data => {
    if (data.tipoPago === 'Tarjeta') {
        return !!data.frecuenciaCredito;
    }
    return true;
}, {
    message: 'Debe seleccionar una frecuencia para el crédito.',
    path: ['frecuenciaCredito'],
})
.refine(data => {
    if (data.tipoPago === 'Tarjeta') {
       return data.ine && data.ine.length > 0;
    }
    return true;
}, {
    message: 'El archivo del INE es obligatorio para el crédito.',
    path: ['ine'],
})
.refine(data => {
    if (data.tipoPago === 'Tarjeta') {
        return data.comprobanteDomicilio && data.comprobanteDomicilio.length > 0;
    }
    return true;
}, {
    message: 'El comprobante de domicilio es obligatorio para el crédito.',
    path: ['comprobanteDomicilio'],
});

export type OrderFormData = z.infer<typeof OrderFormSchema>;
export type MaterialItem = z.infer<typeof MaterialItemSchema>;

interface BaseOrder {
  id: string;
  userId: string;
  solicitante: string;
  obra: string;
  calle: string;
  numero: string;
  colonia: string;
  codigoPostal: string;
  ciudad: string;
  estado: string;
  tipoPago: z.infer<typeof OrderFormSchema.shape.tipoPago>;
  frecuenciaCredito?: z.infer<typeof OrderFormSchema.shape.frecuenciaCredito> | null;
  metodoPago?: z.infer<typeof OrderFormSchema.shape.metodoPago> | null;
  status: keyof typeof OrderStatus;
  total: number;
  materiales: MaterialItem[];
  ineUrl?: string;
  comprobanteDomicilioUrl?: string;
}

export interface Order extends BaseOrder {
  fechaMinEntrega: Date;
  fechaMaxEntrega: Date;
  createdAt: Date;
}

export interface OrderFirestore extends BaseOrder {
  fechaMinEntrega: Timestamp;
  fechaMaxEntrega: Timestamp;
  createdAt: Timestamp;
}

export type UserProfileWithId = UserProfile & { id: string };

export interface UserProfile {
    email: string;
    role: 'personal' | 'company' | 'admin';
    displayName?: string;
    photoURL?: string;
    rfc?: string;
    phone?: string;
}

// Notification Types
interface BaseNotification {
  id: string;
  userId: string;
  orderId: string;
  orderName: string;
  message: string;
  status: keyof typeof OrderStatus;
  read: boolean;
}

export interface Notification extends BaseNotification {
    createdAt: Date;
}

export interface NotificationFirestore extends BaseNotification {
    createdAt: Timestamp;
}

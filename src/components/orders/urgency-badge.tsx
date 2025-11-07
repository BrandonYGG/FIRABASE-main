
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';

export type UrgencyLevel = 'Urgente' | 'Pronto' | 'Normal';
export type Urgency = { level: UrgencyLevel; text: string; suggestion: string; variant: 'destructive' | 'default' | 'secondary' };

export const URGENCY_LEVELS: Record<UrgencyLevel, Urgency> = {
  Urgente: { 
    level: 'Urgente', 
    text: 'Urgente', 
    variant: 'destructive',
    suggestion: "Sugerencia IA: Entrega urgente. Se recomienda confirmar disponibilidad del proveedor." 
  },
  Pronto: { 
    level: 'Pronto', 
    text: 'Pronto', 
    variant: 'default',
    suggestion: "Sugerencia IA: El tiempo de entrega es moderado. Planifique con sus proveedores."
  },
  Normal: { 
    level: 'Normal', 
    text: 'Normal', 
    variant: 'secondary',
    suggestion: "Sugerencia IA: Cronograma flexible. Puede optar por envíos estándar para optimizar costos."
  },
};


export function getUrgency(date: Date): Urgency {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deliveryDate = new Date(date);
  deliveryDate.setHours(0, 0, 0, 0);

  const daysDiff = differenceInDays(deliveryDate, today);

  if (daysDiff <= 3) {
    return URGENCY_LEVELS.Urgente;
  }
  if (daysDiff <= 10) {
    return URGENCY_LEVELS.Pronto;
  }
  return URGENCY_LEVELS.Normal;
}

type UrgencyBadgeProps = {
  date: Date;
  showText?: boolean;
};

export function UrgencyBadge({ date, showText = false }: UrgencyBadgeProps) {
  const urgency = getUrgency(date);
  
  const variantClass = {
    'destructive': 'bg-destructive text-destructive-foreground',
    'default': 'bg-yellow-500 text-white',
    'secondary': 'bg-green-600 text-white',
  }

  return (
    <Badge className={`${variantClass[urgency.variant]} mt-1`}>
      {showText ? urgency.text : urgency.level}
    </Badge>
  );
}

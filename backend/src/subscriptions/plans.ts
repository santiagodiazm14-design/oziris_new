/** Catalogo de planes. El precio SIEMPRE sale de aqui, nunca del cliente. */
export type PlanId = 'FREE' | 'PLUS' | 'PREMIUM';
export type PeriodId = 'MONTHLY' | 'YEARLY';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  /** Maximo de beats que puede tener publicados (null = ilimitado). */
  maxBeats: number | null;
  features: string[];
}

export const CURRENCY = 'COP';

export const PLANS: Record<PlanId, PlanDefinition> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    description: 'Disfruta limitadamente',
    priceMonthly: 0,
    priceYearly: 0,
    maxBeats: 10,
    features: [
      'Subir hasta 10 beats',
      'Licencia estándar',
      '0% de comisión por beat',
      'Uso no exclusivo',
    ],
  },
  PLUS: {
    id: 'PLUS',
    name: 'Plus',
    description: 'Beneficios exclusivos',
    priceMonthly: 25000,
    priceYearly: 250000,
    maxBeats: 100,
    features: [
      'Subir hasta 100 beats',
      'Perfil mejorado (banners, links, redes)',
      '15% de comisión en ventas',
      'Acceso limitado a licencias exclusivas',
    ],
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    description: 'Disfruta a tu estilo',
    priceMonthly: 50000,
    priceYearly: 600000,
    maxBeats: null,
    features: [
      'Beats ilimitados',
      'Perfil avanzado',
      '50% de comisión en ventas',
      'Licencias exclusivas y personalizadas',
    ],
  },
};

export const PAYMENT_METHODS = ['PSE', 'Tarjeta', 'Nequi', 'Bancolombia'];

export function planPrice(plan: PlanDefinition, period: PeriodId): number {
  return period === 'YEARLY' ? plan.priceYearly : plan.priceMonthly;
}

/** Fecha de fin: +1 mes o +1 anio desde `from`. */
export function periodEnd(from: Date, period: PeriodId): Date {
  const d = new Date(from);
  if (period === 'YEARLY') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

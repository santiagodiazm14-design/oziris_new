/**
 * Parametros de la pasarela de pago (compartidos por /checkout y /datos-pago).
 *   Beats: ?beats=id1,id2   (tambien se acepta el viejo ?beat=id)
 *   Plan:  ?plan=PLUS&periodo=MONTHLY|YEARLY
 */
export type CheckoutTarget =
  | { kind: 'beats'; ids: string[] }
  | { kind: 'plan'; plan: 'PLUS' | 'PREMIUM'; period: 'MONTHLY' | 'YEARLY' }
  | { kind: 'none' };

type ParamReader = { get(name: string): string | null };

export function parseCheckoutTarget(params: ParamReader): CheckoutTarget {
  const planRaw = (params.get('plan') || '').toUpperCase();
  if (planRaw === 'PLUS' || planRaw === 'PREMIUM') {
    const per = (params.get('periodo') || 'MONTHLY').toUpperCase();
    return {
      kind: 'plan',
      plan: planRaw,
      period: per === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
    };
  }
  const raw = [params.get('beats'), params.get('beat')]
    .filter(Boolean)
    .join(',');
  const ids = [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))];
  return ids.length > 0 ? { kind: 'beats', ids } : { kind: 'none' };
}

export function beatsCheckoutUrl(ids: string[]): string {
  return `/checkout?beats=${ids.map(encodeURIComponent).join(',')}`;
}

export function planCheckoutUrl(
  plan: 'PLUS' | 'PREMIUM',
  period: 'MONTHLY' | 'YEARLY',
): string {
  return `/checkout?plan=${plan}&periodo=${period}`;
}

export const formatCop = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

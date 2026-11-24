import { apiMessage } from './http';
import { API_URL } from './config';
import type {
  MySubscription,
  PlanInfo,
  SubscriptionSimulationResponse,
} from '@/types';

export interface SimulateSubscriptionPayload {
  plan: 'PLUS' | 'PREMIUM';
  period: 'MONTHLY' | 'YEARLY';
  paymentMethod?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  payerDocument?: string;
  cardLastFour?: string;
}

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

/** Catalogo publico de planes. */
export async function fetchPlansApi(): Promise<PlanInfo[]> {
  const res = await fetch(`${API_URL}/subscriptions/plans`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(apiMessage(data.message, 'No fue posible cargar los planes.'));
  }
  return Array.isArray(data.plans) ? data.plans : [];
}

/** Plan actual del usuario autenticado (null si no hay sesion o falla). */
export async function fetchMySubscriptionApi(
  token: string,
): Promise<MySubscription | null> {
  try {
    const res = await fetch(`${API_URL}/subscriptions/me`, {
      headers: authHeaders(token),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Simula el pago de una suscripcion (el precio lo define el servidor). */
export async function simulateSubscriptionApi(
  token: string,
  payload: SimulateSubscriptionPayload,
): Promise<SubscriptionSimulationResponse> {
  const res = await fetch(`${API_URL}/subscriptions/simulate`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(apiMessage(data.message, 'Error al procesar el pago de la suscripción.'));
  }
  return data;
}

/** Cancela la suscripcion vigente (vuelve al plan Free). */
export async function cancelSubscriptionApi(
  token: string,
): Promise<{ success: boolean; cancelled: boolean; message: string }> {
  const res = await fetch(`${API_URL}/subscriptions/me`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(apiMessage(data.message, 'No fue posible cancelar la suscripción.'));
  }
  return data;
}

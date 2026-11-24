/**
 * El backend puede devolver `message` como texto o como lista de textos
 * (errores de validación). Siempre lo convierte en un solo mensaje legible.
 */
export function apiMessage(message: unknown, fallback: string): string {
  if (Array.isArray(message)) {
    const joined = message.filter((m) => typeof m === 'string' && m).join(' ');
    return joined || fallback;
  }
  if (typeof message === 'string' && message.trim()) return message;
  return fallback;
}

/** Error de la API con el codigo HTTP y, si aplica, los segundos de espera. */
export class ApiError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

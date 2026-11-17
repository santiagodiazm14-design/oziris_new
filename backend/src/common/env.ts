/**
 * Devuelve el secreto JWT. Es obligatorio: no existe valor por defecto
 * para evitar que alguien pueda firmar tokens con una clave pública.
 * En pruebas (NODE_ENV=test) se usa un valor fijo.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) {
    if (secret.length < 32 && process.env.NODE_ENV !== 'test') {
      throw new Error('JWT_SECRET es demasiado corto (mínimo 32 caracteres).');
    }
    return secret;
  }
  if (process.env.NODE_ENV === 'test') return 'test-only-jwt-secret';
  throw new Error(
    'JWT_SECRET no está definido. Agrégalo al archivo .env (mínimo 32 caracteres aleatorios).',
  );
}

/** Orígenes permitidos para CORS (FRONTEND_URL, separados por coma). */
export function getAllowedOrigins(): string[] {
  const raw = process.env.FRONTEND_URL?.trim() || 'http://localhost:3000';
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

/** Entero positivo desde una variable de entorno, con valor por defecto. */
export function envInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** Límite de peticiones/minuto por IP en el registro (ajustable para pruebas de carga). */
export const registerRateLimit = () => envInt('REGISTER_RATE_LIMIT', 10);

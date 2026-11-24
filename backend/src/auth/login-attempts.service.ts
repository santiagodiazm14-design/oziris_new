import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { envInt } from '../common/env';

interface AttemptState {
  failures: number;
  /** Instante (ms) hasta el que la cuenta esta bloqueada; 0 si no lo esta. */
  lockedUntil: number;
  /** Ultimo intento fallido (ms), para olvidar contadores viejos. */
  lastFailureAt: number;
}

export interface FailureResult {
  locked: boolean;
  /** Intentos que quedan antes del bloqueo. */
  remaining: number;
  /** Segundos de espera (solo si quedo bloqueada). */
  retryAfter: number;
}

/** Error 429 con los segundos de espera, para que el cliente muestre una cuenta regresiva. */
export function tooManyLoginAttempts(retryAfter: number): HttpException {
  const secs = Math.max(1, Math.ceil(retryAfter));
  return new HttpException(
    {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'Too Many Requests',
      message: `Demasiados intentos fallidos. Espera ${secs} ${secs === 1 ? 'segundo' : 'segundos'} para volver a intentarlo.`,
      retryAfter: secs,
    },
    HttpStatus.TOO_MANY_REQUESTS,
  );
}

/**
 * Limita los intentos fallidos de inicio de sesion por cuenta: a los 5
 * fallos la cuenta se bloquea 60 segundos (ajustable con LOGIN_MAX_ATTEMPTS
 * y LOGIN_LOCK_SECONDS). Vive en memoria: se reinicia con el servidor, y si
 * algun dia hay varias instancias hara falta moverlo a una base compartida.
 */
@Injectable()
export class LoginAttemptsService {
  private readonly states = new Map<string, AttemptState>();
  /** Un contador sin bloqueo se olvida pasado este tiempo sin fallos. */
  private static readonly STALE_MS = 15 * 60 * 1000;
  private static readonly PRUNE_ABOVE = 5000;

  /** Misma clave sin importar mayusculas ni espacios. */
  static keyFor(email: string): string {
    return (email ?? '').trim().toLowerCase();
  }

  private get maxAttempts(): number {
    return envInt('LOGIN_MAX_ATTEMPTS', 5);
  }

  private get lockMs(): number {
    return envInt('LOGIN_LOCK_SECONDS', 60) * 1000;
  }

  /** Lanza 429 si la cuenta sigue bloqueada. */
  assertNotLocked(key: string, now = Date.now()): void {
    const s = this.states.get(key);
    if (!s || s.lockedUntil === 0) return;
    if (s.lockedUntil > now) {
      throw tooManyLoginAttempts((s.lockedUntil - now) / 1000);
    }
    // El bloqueo ya termino: se empieza de cero
    this.states.delete(key);
  }

  /** Registra un intento fallido; devuelve si ya quedo bloqueada. */
  registerFailure(key: string, now = Date.now()): FailureResult {
    this.prune(now);
    let s = this.states.get(key);
    if (!s || now - s.lastFailureAt > LoginAttemptsService.STALE_MS) {
      s = { failures: 0, lockedUntil: 0, lastFailureAt: now };
    }
    s.failures += 1;
    s.lastFailureAt = now;

    if (s.failures >= this.maxAttempts) {
      s.lockedUntil = now + this.lockMs;
      this.states.set(key, s);
      return { locked: true, remaining: 0, retryAfter: this.lockMs / 1000 };
    }
    this.states.set(key, s);
    return {
      locked: false,
      remaining: this.maxAttempts - s.failures,
      retryAfter: 0,
    };
  }

  /** Un inicio de sesion correcto borra el contador. */
  reset(key: string): void {
    this.states.delete(key);
  }

  private prune(now: number): void {
    if (this.states.size < LoginAttemptsService.PRUNE_ABOVE) return;
    for (const [k, s] of this.states) {
      const expiredLock = s.lockedUntil !== 0 && s.lockedUntil <= now;
      const stale = now - s.lastFailureAt > LoginAttemptsService.STALE_MS;
      if (expiredLock || stale) this.states.delete(k);
    }
  }
}

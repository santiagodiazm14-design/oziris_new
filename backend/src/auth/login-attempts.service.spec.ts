import { HttpException } from '@nestjs/common';
import { LoginAttemptsService } from './login-attempts.service';

describe('LoginAttemptsService', () => {
  let service: LoginAttemptsService;
  const T0 = 1_000_000;

  beforeEach(() => {
    delete process.env.LOGIN_MAX_ATTEMPTS;
    delete process.env.LOGIN_LOCK_SECONDS;
    service = new LoginAttemptsService();
  });

  it('normaliza el correo (mayúsculas y espacios)', () => {
    expect(LoginAttemptsService.keyFor('  Ana@Test.COM ')).toBe('ana@test.com');
  });

  it('cuenta los intentos y avisa cuántos quedan', () => {
    expect(service.registerFailure('a', T0)).toMatchObject({
      locked: false,
      remaining: 4,
    });
    expect(service.registerFailure('a', T0)).toMatchObject({ remaining: 3 });
    expect(service.registerFailure('a', T0)).toMatchObject({ remaining: 2 });
    expect(service.registerFailure('a', T0)).toMatchObject({ remaining: 1 });
  });

  it('el quinto intento fallido bloquea la cuenta 60 segundos', () => {
    for (let i = 0; i < 4; i++) service.registerFailure('a', T0);
    const fifth = service.registerFailure('a', T0);
    expect(fifth).toEqual({ locked: true, remaining: 0, retryAfter: 60 });
    expect(() => service.assertNotLocked('a', T0 + 1000)).toThrow(
      HttpException,
    );
  });

  it('el error de bloqueo es 429 y trae los segundos restantes', () => {
    for (let i = 0; i < 5; i++) service.registerFailure('a', T0);
    try {
      service.assertNotLocked('a', T0 + 20_000);
      throw new Error('debía lanzar');
    } catch (e) {
      const ex = e as HttpException;
      expect(ex.getStatus()).toBe(429);
      expect((ex.getResponse() as any).retryAfter).toBe(40);
      expect(ex.message).toMatch(/40 segundos/);
    }
  });

  it('pasado el minuto se puede volver a intentar y se empieza de cero', () => {
    for (let i = 0; i < 5; i++) service.registerFailure('a', T0);
    expect(() => service.assertNotLocked('a', T0 + 59_000)).toThrow(
      HttpException,
    );
    expect(() => service.assertNotLocked('a', T0 + 60_001)).not.toThrow();
    expect(service.registerFailure('a', T0 + 61_000)).toMatchObject({
      locked: false,
      remaining: 4,
    });
  });

  it('un inicio de sesión correcto borra el contador', () => {
    for (let i = 0; i < 4; i++) service.registerFailure('a', T0);
    service.reset('a');
    expect(service.registerFailure('a', T0)).toMatchObject({ remaining: 4 });
  });

  it('cada cuenta lleva su propio contador', () => {
    for (let i = 0; i < 5; i++) service.registerFailure('a', T0);
    expect(() => service.assertNotLocked('a', T0)).toThrow();
    expect(() => service.assertNotLocked('b', T0)).not.toThrow();
  });

  it('los fallos viejos (más de 15 min) se olvidan', () => {
    for (let i = 0; i < 4; i++) service.registerFailure('a', T0);
    const later = T0 + 16 * 60 * 1000;
    expect(service.registerFailure('a', later)).toMatchObject({
      locked: false,
      remaining: 4,
    });
  });

  it('el límite y la espera se pueden ajustar por variables de entorno', () => {
    process.env.LOGIN_MAX_ATTEMPTS = '3';
    process.env.LOGIN_LOCK_SECONDS = '10';
    const s = new LoginAttemptsService();
    s.registerFailure('a', T0);
    s.registerFailure('a', T0);
    expect(s.registerFailure('a', T0)).toEqual({
      locked: true,
      remaining: 0,
      retryAfter: 10,
    });
  });
});

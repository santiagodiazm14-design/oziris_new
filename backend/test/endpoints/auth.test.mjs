// Endpoints de autenticacion: /auth
import { http, PASS } from './_helpers.mjs';

export const title = 'AUTH  (/auth)';

export async function run(t) {
  const { check, track } = t;
  const id = Date.now();
  const email = `auth${id}@endpoints.test`;
  let r;

  r = await http('/auth/register', { method: 'POST', body: { name: 'Auth ' + id, email, password: PASS } });
  check('POST', '/auth/register', r, 'registro', r.s === 201 && !!r.b.access_token, JSON.stringify(r.b));
  if (r.s !== 201) return;
  track(r.b.user.id);
  const token = r.b.access_token;

  r = await http('/auth/register', { method: 'POST', body: { name: 'Auth', email: email.toUpperCase(), password: PASS } });
  check('POST', '/auth/register', r, 'correo duplicado -> 409', r.s === 409, r.s);

  r = await http('/auth/register', { method: 'POST', body: { email: 'malo' } });
  check('POST', '/auth/register', r, 'datos invalidos -> 400', r.s === 400, r.s);

  r = await http('/auth/login', { method: 'POST', body: { email, password: PASS } });
  check('POST', '/auth/login', r, 'login correcto', r.s === 200 && !!r.b.access_token);

  r = await http('/auth/login', { method: 'POST', body: { email, password: 'incorrecta' } });
  check('POST', '/auth/login', r, 'clave incorrecta -> 401', r.s === 401, r.s);

  r = await http('/auth/me', { token });
  check('GET', '/auth/me', r, 'perfil con token', r.s === 200 && r.b.email?.toLowerCase() === email);

  r = await http('/auth/me');
  check('GET', '/auth/me', r, 'sin token -> 401', r.s === 401, r.s);

  r = await http('/auth/forgot-password', { method: 'POST', body: { email } });
  check('POST', '/auth/forgot-password', r, 'respuesta generica', r.s === 200 && !r.b?.email, r.s);

  r = await http('/auth/verify-reset-code', { method: 'POST', body: { email, code: '000000' } });
  check('POST', '/auth/verify-reset-code', r, 'codigo malo -> 400', r.s === 400, r.s);

  r = await http('/auth/reset-password', { method: 'POST', body: { email, code: '000000', newPassword: 'Another456!' } });
  check('POST', '/auth/reset-password', r, 'codigo malo -> 400', r.s === 400, r.s);

  r = await http('/auth/change-password', { method: 'POST', body: { currentPassword: PASS, newPassword: 'Another456!' }, token });
  check('POST', '/auth/change-password', r, 'cambia clave', r.s === 200, r.s);

  r = await http('/auth/login', { method: 'POST', body: { email, password: 'Another456!' } });
  check('POST', '/auth/login', r, 'login con la nueva clave', r.s === 200);

  // Bloqueo: 5 intentos fallidos y a esperar 1 minuto (se usa un correo inexistente
  // para no bloquear una cuenta real)
  const ghost = `lock${id}@endpoints.test`;
  const bad = () => http('/auth/login', { method: 'POST', body: { email: ghost, password: 'incorrecta' }, retry429: false });
  const left = [];
  for (let i = 1; i <= 4; i++) {
    r = await bad();
    left.push(r.s === 401 ? r.b?.message : `status ${r.s}`);
  }
  check('POST', '/auth/login (x4)', r, 'intentos 1 a 4 -> 401 con intentos restantes', left.every((m) => /Te qued/.test(m)) && /queda 1 intento/.test(left[3]), JSON.stringify(left));

  r = await bad();
  check('POST', '/auth/login (5to)', r, 'el 5to fallo bloquea -> 429', r.s === 429 && r.b?.retryAfter > 0 && r.b.retryAfter <= 60, JSON.stringify(r.b));

  r = await http('/auth/login', { method: 'POST', body: { email: ghost.toUpperCase(), password: 'incorrecta' }, retry429: false });
  check('POST', '/auth/login', r, 'bloqueada (aunque cambien las mayusculas) -> 429', r.s === 429, r.s);

  r = await http('/auth/login', { method: 'POST', body: { email, password: 'Another456!' } });
  check('POST', '/auth/login', r, 'otra cuenta no se ve afectada', r.s === 200, r.s);
}

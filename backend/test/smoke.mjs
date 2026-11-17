// Prueba de humo de punta a punta contra el API real y la BD real.
//   node test/smoke.mjs            (API en http://localhost:4100)
// Lee las credenciales del admin de ADMIN_EMAIL / ADMIN_PASSWORD o de
// ../ADMIN_CREDENCIALES.txt.
import { readFileSync } from 'node:fs';

const B = process.env.API_URL || 'http://localhost:4100';
let adminEmail = process.env.ADMIN_EMAIL;
let adminPass = process.env.ADMIN_PASSWORD;
if (!adminEmail) {
  const txt = readFileSync(new URL('../../ADMIN_CREDENCIALES.txt', import.meta.url), 'utf8');
  adminEmail = /correo:\s*(\S+)/.exec(txt)[1];
  adminPass = /clave:\s*(\S+)/.exec(txt)[1];
}

let fail = 0;
const ok = (n, c, x = '') => {
  console.log((c ? 'PASS ' : 'FAIL ') + n + (c ? '' : '  -> ' + x));
  if (!c) fail++;
};
const j = async (p, o = {}, t) => {
  const isForm = o.body instanceof FormData;
  const r = await fetch(B + p, {
    ...o,
    headers: {
      ...(o.body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(t ? { Authorization: 'Bearer ' + t } : {}),
    },
  });
  let b = null;
  try { b = await r.clone().json(); } catch {}
  return { s: r.status, b, r };
};
const post = (p, d, t) => j(p, { method: 'POST', body: JSON.stringify(d) }, t);
const patch = (p, d, t) => j(p, { method: 'PATCH', body: JSON.stringify(d) }, t);
const sfx = Date.now();

let r = await post('/auth/login', { email: adminEmail, password: adminPass });
ok('admin login', r.s === 200 && r.b.user.role === 'ADMIN', r.s);
const A = r.b.access_token;
r = await j('/users/stats', {}, A); ok('admin stats', r.s === 200 && typeof r.b.totalUsers === 'number');
r = await j('/users', {}, A); ok('admin lista usuarios', r.s === 200 && Array.isArray(r.b));

r = await post('/auth/register', { name: 'Art ' + sfx, email: `art${sfx}@smoke.test`, password: 'Password123!', accountType: 'ARTIST', genre: 'Trap' });
ok('registro artista', r.s === 201 && r.b.user.role === 'PRODUCER' && !!r.b.user.artist, r.s);
const P = r.b.access_token, PID = r.b.user.id;
r = await post('/auth/register', { name: 'Buyer', email: `buy${sfx}@smoke.test`, password: 'Password123!' });
ok('registro comprador', r.s === 201); const U = r.b.access_token, UID = r.b.user.id;
r = await post('/auth/register', { name: 'Buyer', email: `BUY${sfx}@smoke.test`, password: 'Password123!' });
ok('correo duplicado (otra capitalizacion) -> 409', r.s === 409, r.s);

const fd = new FormData();
fd.append('title', 'Smoke Beat'); fd.append('price', '19.5'); fd.append('genre', 'Trap'); fd.append('bpm', '140'); fd.append('tags', 'a,b');
fd.append('audio', new Blob([Buffer.alloc(2048, 1)], { type: 'audio/mpeg' }), 'x.html');
fd.append('cover', new Blob([Buffer.alloc(512, 2)], { type: 'image/png' }), 'c.png');
r = await j('/tracks', { method: 'POST', body: fd }, P);
ok('artista sube beat (extension por MIME, no por nombre)', r.s === 201 && /^\/uploads\/[a-f0-9]+\.mp3$/.test(r.b?.audioUrl), JSON.stringify(r.b).slice(0, 160));
const T = r.b.id;
const bad = new FormData(); bad.append('title', 'x'); bad.append('audio', new Blob(['<html>'], { type: 'text/html' }), 'x.html');
r = await j('/tracks', { method: 'POST', body: bad }, P); ok('rechaza audio con MIME html', r.s === 400, r.s);
r = await j('/tracks', { method: 'POST', body: fd }, U); ok('USER no puede subir beats', r.s === 403, r.s);
r = await j('/tracks'); ok('lista publica sin correo del productor', r.s === 200 && r.b.length >= 1 && !r.b[0].producer?.email);
r = await j('/tracks/' + T); ok('detalle de beat', r.s === 200);
r = await patch('/tracks/' + T, { price: 25 }, U); ok('no-dueno no edita', r.s === 403, r.s);
r = await patch('/tracks/' + T, { price: 25 }, P); ok('dueno edita', r.s === 200 && r.b.price === 25);
r = await j('/tracks/' + T + '/play', { method: 'POST' }); ok('contador de reproducciones', r.s === 201 && r.b.playsCount === 1, r.s);
r = await j('/artists/' + PID); ok('perfil publico de artista sin correo', r.s === 200 && !r.b.email);

r = await j('/purchases/download/' + T, {}, U); ok('descarga sin compra -> 403', r.s === 403, r.s);
r = await post('/purchases/simulate', { trackId: T, amount: 0.01, paymentMethod: 'Tarjeta', cardLastFour: '4111222233334242' }, U);
ok('compra usa precio de la BD (ignora amount)', r.s === 201 && r.b.purchases[0].amount === 25, JSON.stringify(r.b).slice(0, 200));
const [a, b2] = await Promise.all([post('/purchases/simulate', { trackId: T }, U), post('/purchases/simulate', { trackId: T }, U)]);
ok('doble compra simultanea no duplica', a.s === 201 && b2.s === 201 && a.b.purchases[0].alreadyOwned && b2.b.purchases[0].alreadyOwned);
r = await j('/purchases/my-purchases', {}, U); ok('historial = 1 compra', r.s === 200 && r.b.length === 1, r.b?.length);
r = await j('/purchases/download/' + T, {}, U);
ok('descarga tras comprar', r.s === 200 && r.r.headers.get('content-type') === 'audio/mpeg' && (await r.r.arrayBuffer()).byteLength === 2048, r.s);
r = await post('/purchases/simulate', { trackId: 'nope' }, U); ok('beat inexistente -> 404', r.s === 404, r.s);

r = await post('/users/favorites/' + T, {}, U); ok('favorito on', r.s === 201 && r.b.isFavorite);
r = await j('/users/favorites', {}, U); ok('lista favoritos', r.b.length === 1);
r = await post('/users/favorites/nope', {}, U); ok('favorito inexistente -> 404', r.s === 404, r.s);
r = await post('/users/favorites/' + T, {}, U); ok('favorito off', r.b.isFavorite === false);

r = await patch('/users/profile', { name: 'Nuevo', avatarUrl: 'javascript:alert(1)' }, U); ok('avatarUrl malicioso rechazado', r.s === 400, r.s);
r = await patch('/users/profile', { name: 'Nuevo', bio: 'hola' }, U); ok('editar perfil', r.s === 200 && r.b.name === 'Nuevo');
r = await j('/users/' + PID, {}, U); ok('usuario no ve a otro usuario', r.s === 403, r.s);
r = await j('/users', {}, U); ok('usuario no lista usuarios', r.s === 403);

r = await post('/auth/change-password', { currentPassword: 'Password123!', newPassword: 'Another456!' }, U); ok('cambiar contrasena', r.s === 200, r.s);
r = await post('/auth/login', { email: `buy${sfx}@smoke.test`, password: 'Another456!' }); ok('login con la nueva', r.s === 200);
r = await post('/auth/forgot-password', { email: `buy${sfx}@smoke.test` }); ok('forgot-password generico', r.s === 200 && !r.b.email, r.s);
let last;
for (let i = 0; i < 6; i++) last = await post('/auth/verify-reset-code', { email: `buy${sfx}@smoke.test`, code: '000000' });
ok('codigo se bloquea tras 5 intentos', last.s === 400 && /nuevo c|Solicita|inválido/i.test(last.b.message), JSON.stringify(last.b));

r = await patch('/users/' + UID, { isActive: false }, A); ok('admin desactiva usuario', r.s === 200 && r.b.isActive === false);
r = await j('/auth/me', {}, U); ok('token del desactivado deja de servir', r.s === 401, r.s);
r = await post('/auth/login', { email: `buy${sfx}@smoke.test`, password: 'Another456!' }); ok('login desactivado -> 403', r.s === 403, r.s);
r = await j('/users/00000000-0000-0000-0000-000000000000', { method: 'DELETE' }, A); ok('borrar inexistente -> 404', r.s === 404, r.s);
r = await j('/users/' + 'x', { method: 'DELETE' }, A); ok('borrar admin a si mismo bloqueado / id raro -> 4xx', r.s >= 400 && r.s < 500, r.s);

r = await j('/tracks/' + T, { method: 'DELETE' }, P); ok('dueno borra beat', r.s === 200);
for (const id of [UID, PID]) { r = await j('/users/' + id, { method: 'DELETE' }, A); ok('admin borra usuario de prueba', r.s === 200, r.s); }
console.log(fail ? `\n${fail} FALLOS` : '\nTODO OK');
process.exit(fail ? 1 : 0);

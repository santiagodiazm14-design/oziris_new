// Utilidades compartidas por los tests de endpoints.
import { readFileSync } from 'node:fs';

export const BASE = process.env.API_URL || 'http://localhost:4000';
export const PASS = 'Password123!';

export const color = {
  g: (s) => `\x1b[32m${s}\x1b[0m`,
  r: (s) => `\x1b[31m${s}\x1b[0m`,
  d: (s) => `\x1b[2m${s}\x1b[0m`,
  b: (s) => `\x1b[1m${s}\x1b[0m`,
  c: (s) => `\x1b[36m${s}\x1b[0m`,
};
const c = color;

export function adminCreds() {
  if (process.env.ADMIN_EMAIL) {
    return { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD };
  }
  const txt = readFileSync(new URL('../../../ADMIN_CREDENCIALES.txt', import.meta.url), 'utf8');
  return { email: /correo:\s*(\S+)/.exec(txt)[1], password: /clave:\s*(\S+)/.exec(txt)[1] };
}

/** Peticion HTTP. Devuelve { s: status, b: body json|null, r: Response, ms }. */
export async function http(path, { method = 'GET', body, token, form } = {}) {
  const t0 = performance.now();
  const headers = {};
  if (token) headers.Authorization = 'Bearer ' + token;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let r = await fetch(BASE + path, { method, headers, body: payload });
  if (r.status === 429) {
    // Limite de peticiones del API (throttler): esperar a que se libere y reintentar una vez.
    const wait = Math.min(Number(r.headers.get('retry-after')) || 61, 65);
    console.log(c.d(`  ⏳ 429 en ${method} ${path}: esperando ${wait}s por el limite de peticiones...`));
    await new Promise((res) => setTimeout(res, wait * 1000));
    r = await fetch(BASE + path, { method, headers, body: payload });
  }
  let b = null;
  try {
    b = await r.clone().json();
  } catch {
    /* sin JSON */
  }
  return { s: r.status, b, r, ms: Math.round(performance.now() - t0) };
}

export async function apiIsUp() {
  try {
    await fetch(BASE + '/', { signal: AbortSignal.timeout(3000) });
    return true;
  } catch {
    return false;
  }
}

/** Contexto de ejecucion: registra cada caso, lo imprime y cuenta resultados. */
export function createRunner() {
  const stats = { pass: 0, fail: 0 };
  const createdUsers = [];

  /** Imprime una linea por caso: marca, metodo, ruta, status y ms. */
  function check(method, path, res, name, cond, detail = '') {
    const ok = !!cond;
    if (ok) stats.pass++;
    else stats.fail++;
    const mark = ok ? c.g('✔') : c.r('✘');
    const status = ok ? c.g(res.s) : c.r(res.s);
    console.log(`  ${mark} ${method.padEnd(6)} ${path.padEnd(28)} ${status}  ${c.d(`(${res.ms}ms)`)}  ${name}`);
    if (!ok && detail) console.log(c.r(`      -> ${String(detail).slice(0, 200)}`));
    return ok;
  }

  const login = (email, password) => http('/auth/login', { method: 'POST', body: { email, password } });
  const sfx = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const track = (id) => createdUsers.push(id);

  async function adminToken() {
    const { email, password } = adminCreds();
    const r = await login(email, password);
    if (r.s !== 200) throw new Error(`No se pudo iniciar sesion como admin (status ${r.s})`);
    return r.b.access_token;
  }

  // El registro tiene limite por minuto: se reutiliza un usuario por tipo en toda la corrida.
  const pool = {};
  function newUser(kind = 'USER', { fresh = false } = {}) {
    if (fresh) return createUser(kind);
    pool[kind] ??= createUser(kind);
    return pool[kind];
  }

  async function createUser(kind) {
    const id = sfx();
    const body = { name: `${kind} ${id}`, email: `${kind.toLowerCase()}${id}@endpoints.test`, password: PASS };
    if (kind === 'ARTIST') {
      body.accountType = 'ARTIST';
      body.genre = 'Trap';
    }
    const r = await http('/auth/register', { method: 'POST', body });
    if (r.s !== 201) throw new Error(`No se pudo registrar ${kind} (status ${r.s}): ${JSON.stringify(r.b)}`);
    track(r.b.user.id);
    return { token: r.b.access_token, id: r.b.user.id, email: body.email, password: PASS };
  }

  function beatForm({ title = 'Test Beat', price = '19.5' } = {}) {
    const fd = new FormData();
    fd.append('title', title);
    fd.append('price', price);
    fd.append('genre', 'Trap');
    fd.append('bpm', '140');
    fd.append('tags', 'a,b');
    fd.append('audio', new Blob([Buffer.alloc(2048, 1)], { type: 'audio/mpeg' }), 'x.mp3');
    fd.append('cover', new Blob([Buffer.alloc(512, 2)], { type: 'image/png' }), 'c.png');
    return fd;
  }

  async function cleanup(admin) {
    for (const id of createdUsers) {
      await http('/users/' + id, { method: 'DELETE', token: admin }).catch(() => {});
    }
  }

  return { stats, check, adminToken, newUser, beatForm, cleanup, login, track };
}

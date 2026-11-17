import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// Prueba de carga: registro de 200 usuarios nuevos con 20 usuarios virtuales
// concurrentes. Cada correo termina en @loadtest.oziris.test para poder
// limpiarlos de la BD después.
//
//   k6 run k6/test-register.js
//   k6 run -e API_URL=http://localhost:4100 -e USERS=200 -e VUS=20 k6/test-register.js

const USERS = Number(__ENV.USERS || 200);
const VUS = Number(__ENV.VUS || 20);
const BASE_URL = __ENV.API_URL || 'http://localhost:4000';
const RUN = __ENV.RUN_ID || `${Date.now()}`;

const registrosCreados = new Counter('registros_creados');
const registrosRechazados = new Counter('registros_rechazados_429');

export const options = {
  scenarios: {
    registro_usuarios: {
      executor: 'shared-iterations',
      vus: VUS,
      iterations: USERS, // exactamente USERS registros en total
      maxDuration: '3m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
    registros_creados: [`count>=${USERS}`],
  },
};

export default function () {
  const n = __VU * 100000 + __ITER;
  const payload = JSON.stringify({
    name: `Usuario Carga ${n}`,
    email: `load_${RUN}_${n}@loadtest.oziris.test`,
    password: 'Password123!',
    accountType: n % 5 === 0 ? 'ARTIST' : 'USER', // 20% artistas
  });

  const res = http.post(`${BASE_URL}/auth/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'RegistroUsuarios' },
  });

  const ok = check(res, {
    'status 201': (r) => r.status === 201,
    'devuelve access_token': (r) => {
      try {
        return !!JSON.parse(r.body).access_token;
      } catch (e) {
        return false;
      }
    },
  });

  if (res.status === 201) registrosCreados.add(1);
  if (res.status === 429) registrosRechazados.add(1);
  if (!ok && res.status !== 201) {
    console.error(`Registro falló (${res.status}): ${String(res.body).slice(0, 150)}`);
  }
  sleep(0.05);
}

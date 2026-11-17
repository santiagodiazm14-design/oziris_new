import http from 'k6/http';
import { check } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Prueba de estrés: sube la tasa de registros por segundo por escalones hasta
// encontrar el punto donde la API empieza a fallar o a ponerse lenta.
//
//   k6 run -e API_URL=http://localhost:4100 k6/stress-register.js
//
// Cada escalón dura STEP segundos. Se tolera latencia p95 < 2s y errores < 1%.

const BASE_URL = __ENV.API_URL || 'http://localhost:4000';
const RUN = __ENV.RUN_ID || `${Date.now()}`;
const STEP = Number(__ENV.STEP || 15);
const RATES = (__ENV.RATES || '5,10,20,40,60,80,100').split(',').map(Number);

const creados = new Counter('registros_creados');
const lat = {};
RATES.forEach((r) => (lat[r] = new Trend(`lat_${r}rps`, true)));

const stages = RATES.map((r, i) => ({
  startTime: `${i * STEP}s`,
  rate: r,
}));

export const options = {
  scenarios: Object.fromEntries(
    RATES.map((r, i) => [
      `escalon_${r}rps`,
      {
        executor: 'constant-arrival-rate',
        rate: r,
        timeUnit: '1s',
        duration: `${STEP}s`,
        startTime: `${i * STEP}s`,
        preAllocatedVUs: Math.max(20, r * 2),
        maxVUs: Math.max(200, r * 6),
        env: { RATE: String(r) },
        tags: { escalon: `${r}rps` },
      },
    ]),
  ),
  thresholds: Object.fromEntries(
    RATES.flatMap((r) => [
      [`http_req_failed{escalon:${r}rps}`, ['rate<0.01']],
      [`http_req_duration{escalon:${r}rps}`, ['p(95)<2000']],
    ]),
  ),
  discardResponseBodies: false,
};

export default function () {
  const n = `${__VU}_${__ITER}`;
  const res = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({
      name: `Estres ${n}`,
      email: `stress_${RUN}_${n}@loadtest.oziris.test`,
      password: 'Password123!',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: '30s',
    },
  );
  if (res.status === 201) creados.add(1);
  const rate = __ENV.RATE;
  if (lat[rate]) lat[rate].add(res.timings.duration);
  check(res, { 'status 201': (r) => r.status === 201 });
}

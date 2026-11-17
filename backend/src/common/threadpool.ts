import { cpus } from 'os';

// bcrypt (nativo) corre en el threadpool de libuv (4 hilos por defecto).
// Debe fijarse ANTES de la primera operación asíncrona que lo use, por eso
// este módulo se importa primero en main.ts.
if (!process.env.UV_THREADPOOL_SIZE) {
  process.env.UV_THREADPOOL_SIZE = String(
    Math.min(Math.max(cpus().length, 4), 16),
  );
}

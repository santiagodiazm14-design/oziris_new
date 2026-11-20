// Corre los tests de endpoints contra el API ya levantado.
//   node test/endpoints/run.mjs beats       (un modulo)
//   node test/endpoints/run.mjs beats auth  (varios)
//   node test/endpoints/run.mjs all         (todos)
//   node test/endpoints/run.mjs             (menu para elegir)
// API_URL (por defecto http://localhost:4000), ADMIN_EMAIL / ADMIN_PASSWORD opcionales.
import readline from 'node:readline/promises';
import { BASE, apiIsUp, color as c, createRunner } from './_helpers.mjs';

const MODULES = ['auth', 'beats', 'purchases', 'users', 'artists'];

async function pick() {
  console.log(c.b('\nElige el endpoint a probar:'));
  MODULES.forEach((m, i) => console.log(`  ${i + 1}) ${m}`));
  console.log(`  ${MODULES.length + 1}) all (todos)`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ans = (await rl.question('\nNumero o nombre: ')).trim().toLowerCase();
  rl.close();
  if (ans === 'all' || ans === String(MODULES.length + 1)) return MODULES;
  return [MODULES[Number(ans) - 1] ?? ans];
}

let wanted = process.argv.slice(2).map((a) => a.toLowerCase());
if (wanted.length === 0) wanted = await pick();
if (wanted.includes('all')) wanted = MODULES;

const unknown = wanted.filter((w) => !MODULES.includes(w));
if (unknown.length) {
  console.error(c.r(`Modulo desconocido: ${unknown.join(', ')}. Opciones: ${MODULES.join(', ')}, all`));
  process.exit(2);
}

if (!(await apiIsUp())) {
  console.error(c.r(`\n✘ El API no responde en ${BASE}.`));
  console.error('  Levantalo primero con: npm run start:dev   (o define API_URL)');
  process.exit(2);
}

const t = createRunner();
let admin;
try {
  admin = await t.adminToken();
} catch (e) {
  console.error(c.r('✘ ' + e.message));
  process.exit(2);
}
t.admin = admin;

for (const name of wanted) {
  const mod = await import(`./${name}.test.mjs`);
  console.log(c.b(c.c(`\n▶ Probando endpoints de ${mod.title}`)) + c.d(`  en ${BASE}`));
  try {
    await mod.run(t);
  } catch (e) {
    t.stats.fail++;
    console.log(c.r(`  ✘ Error inesperado: ${e.message}`));
  }
}

await t.cleanup(admin);
const { pass, fail } = t.stats;
console.log('\n' + (fail ? c.r(`Resultado: ${pass} pasaron, ${fail} fallaron`) : c.g(`Resultado: ${pass} pasaron, 0 fallaron`)));
process.exit(fail ? 1 : 0);

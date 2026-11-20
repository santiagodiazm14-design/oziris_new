// Endpoints de compras: /purchases
import { http } from './_helpers.mjs';

export const title = 'PURCHASES  (/purchases)';

export async function run(t) {
  const { check, newUser, beatForm } = t;
  const producer = await newUser('ARTIST');
  const buyer = await newUser('USER');
  let r = await http('/tracks', { method: 'POST', form: beatForm({ price: '25' }), token: producer.token });
  const id = r.b?.id;
  if (!id) {
    check('POST', '/tracks', r, 'preparar beat de prueba', false, JSON.stringify(r.b));
    return;
  }

  r = await http('/purchases/check/' + id, { token: buyer.token });
  check('GET', '/purchases/check/:id', r, 'antes de comprar', r.s === 200, r.s);

  r = await http('/purchases/download/' + id, { token: buyer.token });
  check('GET', '/purchases/download/:id', r, 'descarga sin compra -> 403', r.s === 403, r.s);

  r = await http('/purchases/simulate', { method: 'POST', body: { trackId: id } });
  check('POST', '/purchases/simulate', r, 'sin token -> 401', r.s === 401, r.s);

  r = await http('/purchases/simulate', {
    method: 'POST',
    body: { trackId: id, amount: 0.01, paymentMethod: 'Tarjeta', cardLastFour: '4111222233334242' },
    token: buyer.token,
  });
  check('POST', '/purchases/simulate', r, 'compra usa precio de la BD', r.s === 201 && r.b.purchases?.[0]?.amount === 25, JSON.stringify(r.b));

  r = await http('/purchases/simulate', { method: 'POST', body: { trackId: 'no-existe' }, token: buyer.token });
  check('POST', '/purchases/simulate', r, 'beat inexistente -> 404', r.s === 404, r.s);

  r = await http('/purchases/my-purchases', { token: buyer.token });
  check('GET', '/purchases/my-purchases', r, 'historial = 1 compra', r.s === 200 && r.b.length === 1, r.b?.length);

  r = await http('/purchases/check/' + id, { token: buyer.token });
  check('GET', '/purchases/check/:id', r, 'despues de comprar', r.s === 200, JSON.stringify(r.b));

  r = await http('/purchases/download/' + id, { token: buyer.token });
  const size = r.s === 200 ? (await r.r.arrayBuffer()).byteLength : 0;
  check('GET', '/purchases/download/:id', r, 'descarga tras comprar', r.s === 200 && size === 2048, `size=${size}`);

  await http('/tracks/' + id, { method: 'DELETE', token: producer.token });
}

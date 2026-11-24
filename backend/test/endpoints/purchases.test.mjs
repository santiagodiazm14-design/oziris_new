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

  // Carrito con varios beats: se compran todos en una sola operacion
  const r2 = await http('/tracks', { method: 'POST', form: beatForm({ title: 'Carrito 2', price: '30' }), token: producer.token });
  const r3 = await http('/tracks', { method: 'POST', form: beatForm({ title: 'Carrito 3', price: '40' }), token: producer.token });
  const id2 = r2.b?.id;
  const id3 = r3.b?.id;
  if (id2 && id3) {
    r = await http('/purchases/download/' + id2, { token: buyer.token });
    check('GET', '/purchases/download/:id', r, 'carrito: sin pagar no descarga -> 403', r.s === 403, r.s);

    r = await http('/purchases/simulate', { method: 'POST', body: { trackIds: [id2, id3], paymentMethod: 'PSE' }, token: buyer.token });
    const total = (r.b?.purchases || []).reduce((s, p) => s + p.amount, 0);
    check('POST', '/purchases/simulate (carrito)', r, 'compra 2 beats a la vez', r.s === 201 && r.b.purchases?.length === 2 && total === 70, JSON.stringify(r.b)?.slice(0, 160));

    r = await http('/purchases/my-purchases', { token: buyer.token });
    check('GET', '/purchases/my-purchases', r, 'historial = 3 compras', r.s === 200 && r.b.length === 3, r.b?.length);

    for (const bid of [id2, id3]) {
      r = await http('/purchases/download/' + bid, { token: buyer.token });
      check('GET', '/purchases/download/:id', r, 'carrito: descarga tras pagar', r.s === 200, r.s);
    }
    await http('/tracks/' + id2, { method: 'DELETE', token: producer.token });
    await http('/tracks/' + id3, { method: 'DELETE', token: producer.token });
  } else {
    check('POST', '/tracks', r2, 'preparar beats del carrito', false, JSON.stringify(r2.b));
  }

  await http('/tracks/' + id, { method: 'DELETE', token: producer.token });
}

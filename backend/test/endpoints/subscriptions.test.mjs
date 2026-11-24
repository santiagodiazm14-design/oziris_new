// Endpoints de suscripciones: /subscriptions (y limite de beats por plan)
import { http } from './_helpers.mjs';

export const title = 'SUBSCRIPTIONS  (/subscriptions)';

export async function run(t) {
  const { check, newUser, beatForm } = t;
  // Usuario propio: el limite de beats cuenta TODOS sus beats
  const artist = await newUser('ARTIST', { fresh: true });
  let r;

  r = await http('/subscriptions/plans');
  check('GET', '/subscriptions/plans', r, 'catalogo publico', r.s === 200 && r.b.plans?.length === 3, JSON.stringify(r.b)?.slice(0, 120));

  r = await http('/subscriptions/me');
  check('GET', '/subscriptions/me', r, 'sin token -> 401', r.s === 401, r.s);

  r = await http('/subscriptions/me', { token: artist.token });
  check('GET', '/subscriptions/me', r, 'sin suscripcion = Free (10 beats)', r.s === 200 && r.b.plan === 'FREE' && r.b.maxBeats === 10, JSON.stringify(r.b));

  r = await http('/subscriptions/simulate', { method: 'POST', body: { plan: 'PLUS', period: 'MONTHLY' } });
  check('POST', '/subscriptions/simulate', r, 'sin token -> 401', r.s === 401, r.s);

  r = await http('/subscriptions/simulate', { method: 'POST', body: { plan: 'FREE', period: 'MONTHLY' }, token: artist.token });
  check('POST', '/subscriptions/simulate', r, 'plan FREE -> 400', r.s === 400, r.s);

  r = await http('/subscriptions/simulate', { method: 'POST', body: { plan: 'ORO', period: 'MONTHLY' }, token: artist.token });
  check('POST', '/subscriptions/simulate', r, 'plan inexistente -> 400', r.s === 400, r.s);

  // Limite Free: 10 beats suben, el 11 se rechaza
  let okUploads = 0;
  for (let i = 1; i <= 10; i++) {
    r = await http('/tracks', { method: 'POST', form: beatForm({ title: `Limite ${i}` }), token: artist.token });
    if (r.s === 201) okUploads++;
  }
  check('POST', '/tracks (x10)', r, 'Free sube 10 beats', okUploads === 10, `subieron ${okUploads}`);

  r = await http('/tracks', { method: 'POST', form: beatForm({ title: 'Beat 11' }), token: artist.token });
  check('POST', '/tracks', r, 'beat 11 con Free -> 403', r.s === 403 && /límite/i.test(JSON.stringify(r.b)), JSON.stringify(r.b));

  r = await http('/subscriptions/simulate', {
    method: 'POST',
    body: { plan: 'PLUS', period: 'YEARLY', paymentMethod: 'Tarjeta', cardLastFour: '4111222233334242', amount: 1 },
    token: artist.token,
  });
  check('POST', '/subscriptions/simulate', r, 'paga Plus anual (precio del servidor)', r.s === 201 && r.b.plan === 'PLUS' && r.b.amount === 250000, JSON.stringify(r.b));

  r = await http('/subscriptions/me', { token: artist.token });
  check('GET', '/subscriptions/me', r, 'ahora es Plus (100 beats)', r.s === 200 && r.b.plan === 'PLUS' && r.b.maxBeats === 100 && r.b.beatsUsed === 10, JSON.stringify(r.b));

  r = await http('/tracks', { method: 'POST', form: beatForm({ title: 'Beat 11 Plus' }), token: artist.token });
  check('POST', '/tracks', r, 'con Plus ya sube el beat 11', r.s === 201, JSON.stringify(r.b));

  r = await http('/subscriptions/simulate', { method: 'POST', body: { plan: 'PREMIUM', period: 'MONTHLY' }, token: artist.token });
  check('POST', '/subscriptions/simulate', r, 'cambia a Premium', r.s === 201 && r.b.amount === 50000, JSON.stringify(r.b));

  r = await http('/subscriptions/me', { token: artist.token });
  check('GET', '/subscriptions/me', r, 'Premium sin tope', r.s === 200 && r.b.plan === 'PREMIUM' && r.b.maxBeats === null, JSON.stringify(r.b));

  r = await http('/subscriptions/me', { method: 'DELETE', token: artist.token });
  check('DELETE', '/subscriptions/me', r, 'cancela y vuelve a Free', r.s === 200 && r.b.cancelled === true, JSON.stringify(r.b));

  r = await http('/subscriptions/me', { token: artist.token });
  check('GET', '/subscriptions/me', r, 'plan Free otra vez', r.s === 200 && r.b.plan === 'FREE', JSON.stringify(r.b));
}

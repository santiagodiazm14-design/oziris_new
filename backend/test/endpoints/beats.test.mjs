// Endpoints de beats (controlador "tracks"): /tracks
import { http } from './_helpers.mjs';

export const title = 'BEATS  (/tracks)';

export async function run(t) {
  const { check, newUser, beatForm } = t;
  const producer = await newUser('ARTIST');
  const buyer = await newUser('USER');
  let r;

  r = await http('/tracks', { method: 'POST', form: beatForm(), token: producer.token });
  check('POST', '/tracks', r, 'artista sube un beat', r.s === 201 && /^\/uploads\/[a-f0-9]+\.mp3$/.test(r.b?.audioUrl), JSON.stringify(r.b));
  const id = r.b?.id;
  if (!id) return;

  r = await http('/tracks', { method: 'POST', form: beatForm() });
  check('POST', '/tracks', r, 'sin token -> 401', r.s === 401, r.s);

  r = await http('/tracks', { method: 'POST', form: beatForm(), token: buyer.token });
  check('POST', '/tracks', r, 'USER no puede subir -> 403', r.s === 403, r.s);

  const bad = new FormData();
  bad.append('title', 'x');
  bad.append('audio', new Blob(['<html>'], { type: 'text/html' }), 'x.html');
  r = await http('/tracks', { method: 'POST', form: bad, token: producer.token });
  check('POST', '/tracks', r, 'audio con MIME html -> 400', r.s === 400, r.s);

  r = await http('/tracks');
  check('GET', '/tracks', r, 'lista publica (sin correo del productor)', r.s === 200 && Array.isArray(r.b) && r.b.length >= 1 && !r.b[0].producer?.email);

  r = await http('/tracks?genre=Trap&sort=newest&limit=5');
  check('GET', '/tracks?filtros', r, 'filtros genre/sort/limit', r.s === 200 && r.b.length <= 5);

  r = await http('/tracks/' + id);
  check('GET', '/tracks/:id', r, 'detalle de beat', r.s === 200 && r.b.id === id);

  r = await http('/tracks/no-existe');
  check('GET', '/tracks/:id', r, 'inexistente -> 404', r.s === 404, r.s);

  r = await http('/tracks/' + id, { method: 'PATCH', body: { price: 25 }, token: buyer.token });
  check('PATCH', '/tracks/:id', r, 'no-dueno no edita -> 403', r.s === 403, r.s);

  r = await http('/tracks/' + id, { method: 'PATCH', body: { price: 25 }, token: producer.token });
  check('PATCH', '/tracks/:id', r, 'dueno edita', r.s === 200 && r.b.price === 25);

  r = await http('/tracks/' + id + '/play', { method: 'POST' });
  check('POST', '/tracks/:id/play', r, 'cuenta reproduccion', r.s === 201 && r.b.playsCount === 1, JSON.stringify(r.b));

  r = await http('/tracks/' + id, { method: 'DELETE', token: buyer.token });
  check('DELETE', '/tracks/:id', r, 'no-dueno no borra -> 403', r.s === 403, r.s);

  r = await http('/tracks/' + id, { method: 'DELETE', token: producer.token });
  check('DELETE', '/tracks/:id', r, 'dueno borra', r.s === 200);

  r = await http('/tracks/' + id);
  check('GET', '/tracks/:id', r, 'ya no existe -> 404', r.s === 404, r.s);
}

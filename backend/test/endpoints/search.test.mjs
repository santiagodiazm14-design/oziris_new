// Endpoint de busqueda (autocompletado): /search
import { http } from './_helpers.mjs';

export const title = 'SEARCH  (/search)';

export async function run(t) {
  const { check, newUser, beatForm } = t;
  const artist = await newUser('ARTIST', { fresh: true });
  const plain = await newUser('USER', { fresh: true });
  const unique = `Zafiro${Date.now()}`;
  let r = await http('/tracks', { method: 'POST', form: beatForm({ title: unique }), token: artist.token });
  const trackId = r.b?.id;
  if (!trackId) {
    check('POST', '/tracks', r, 'preparar beat de prueba', false, JSON.stringify(r.b));
    return;
  }

  r = await http('/search?q=');
  check('GET', '/search?q=', r, 'sin texto -> listas vacias', r.s === 200 && r.b.artists.length === 0 && r.b.beats.length === 0, JSON.stringify(r.b));

  r = await http('/search');
  check('GET', '/search', r, 'sin parametro q -> listas vacias', r.s === 200 && r.b.beats.length === 0, r.s);

  r = await http(`/search?q=${encodeURIComponent(unique)}`);
  check('GET', '/search?q=<titulo>', r, 'encuentra el beat por titulo', r.s === 200 && r.b.beats.some((b) => b.id === trackId), JSON.stringify(r.b)?.slice(0, 160));

  r = await http(`/search?q=${encodeURIComponent(unique.slice(0, -2))}`);
  check('GET', '/search?q=<prefijo>', r, 'con el texto incompleto tambien', r.s === 200 && r.b.beats.some((b) => b.id === trackId), r.s);

  r = await http(`/search?q=${encodeURIComponent(unique.toLowerCase())}`);
  check('GET', '/search?q=<minusculas>', r, 'no distingue mayusculas', r.s === 200 && r.b.beats.some((b) => b.id === trackId), r.s);

  const aName = artist.name;
  r = await http(`/search?q=${encodeURIComponent(aName)}`);
  check('GET', '/search?q=<artista>', r, 'encuentra al artista por nombre', r.s === 200 && r.b.artists.some((a) => a.id === artist.id), JSON.stringify(r.b?.artists)?.slice(0, 160));
  check('GET', '/search?q=<artista>', r, 'y los beats de ese artista', r.b.beats.some((b) => b.id === trackId), r.s);

  r = await http(`/search?q=${encodeURIComponent(plain.name)}`);
  check('GET', '/search?q=<usuario>', r, 'un usuario que no es artista no sale', r.s === 200 && !r.b.artists.some((a) => a.id === plain.id), r.s);

  r = await http(`/search?q=${encodeURIComponent(aName)}`);
  const leak = JSON.stringify(r.b);
  check('GET', '/search', r, 'no expone correos ni contrasenas', !leak.includes('@endpoints.test') && !/password|contrasena/i.test(leak), 'hay datos privados');

  r = await http('/search?q=a&limit=1');
  check('GET', '/search?limit=1', r, 'respeta el limite', r.s === 200 && r.b.artists.length <= 1 && r.b.beats.length <= 1, JSON.stringify(r.b)?.slice(0, 100));

  r = await http('/search?q=' + 'x'.repeat(500));
  check('GET', '/search?q=<muy largo>', r, 'texto enorme no rompe', r.s === 200, r.s);

  r = await http("/search?q=%25_'%22;--");
  check('GET', '/search?q=<simbolos>', r, 'simbolos raros no rompen', r.s === 200, r.s);

  await http('/tracks/' + trackId, { method: 'DELETE', token: artist.token });
}

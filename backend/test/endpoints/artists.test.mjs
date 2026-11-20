// Endpoints de artistas: /artists
import { http } from './_helpers.mjs';

export const title = 'ARTISTS  (/artists)';

export async function run(t) {
  const { check, newUser } = t;
  const artist = await newUser('ARTIST');
  let r;

  r = await http('/artists/' + artist.id);
  check('GET', '/artists/:id', r, 'perfil publico sin correo', r.s === 200 && !r.b.email, r.s);

  r = await http('/artists/no-existe');
  check('GET', '/artists/:id', r, 'inexistente -> 404', r.s === 404, r.s);
}

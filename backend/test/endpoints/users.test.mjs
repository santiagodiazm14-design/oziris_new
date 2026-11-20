// Endpoints de usuarios: /users
import { http } from './_helpers.mjs';

export const title = 'USERS  (/users)';

export async function run(t) {
  const { check, newUser, beatForm, admin } = t;
  const producer = await newUser('ARTIST');
  const user = await newUser('USER', { fresh: true });
  let r;

  r = await http('/users/stats', { token: admin });
  check('GET', '/users/stats', r, 'admin ve stats', r.s === 200 && typeof r.b.totalUsers === 'number', r.s);

  r = await http('/users', { token: admin });
  check('GET', '/users', r, 'admin lista usuarios', r.s === 200 && Array.isArray(r.b), r.s);

  r = await http('/users', { token: user.token });
  check('GET', '/users', r, 'USER no lista -> 403', r.s === 403, r.s);

  r = await http('/users/' + producer.id, { token: user.token });
  check('GET', '/users/:id', r, 'USER no ve a otro -> 403', r.s === 403, r.s);

  r = await http('/users/' + user.id, { token: admin });
  check('GET', '/users/:id', r, 'admin ve usuario', r.s === 200, r.s);

  r = await http('/users/profile', { method: 'PATCH', body: { name: 'Nuevo', bio: 'hola' }, token: user.token });
  check('PATCH', '/users/profile', r, 'editar perfil', r.s === 200 && r.b.name === 'Nuevo', r.s);

  r = await http('/users/profile', { method: 'PATCH', body: { name: 'N', avatarUrl: 'javascript:alert(1)' }, token: user.token });
  check('PATCH', '/users/profile', r, 'avatarUrl malicioso -> 400', r.s === 400, r.s);

  r = await http('/tracks', { method: 'POST', form: beatForm(), token: producer.token });
  const tid = r.b?.id;
  r = await http('/users/favorites/' + tid, { method: 'POST', token: user.token });
  check('POST', '/users/favorites/:id', r, 'favorito on', r.s === 201 && r.b.isFavorite, r.s);
  r = await http('/users/favorites', { token: user.token });
  check('GET', '/users/favorites', r, 'lista favoritos', r.s === 200 && r.b.length === 1, r.s);
  r = await http('/users/favorites/nope', { method: 'POST', token: user.token });
  check('POST', '/users/favorites/:id', r, 'inexistente -> 404', r.s === 404, r.s);
  r = await http('/users/favorites/' + tid, { method: 'POST', token: user.token });
  check('POST', '/users/favorites/:id', r, 'favorito off', r.s === 201 && r.b.isFavorite === false, r.s);

  r = await http('/users/' + user.id, { method: 'PATCH', body: { isActive: false }, token: admin });
  check('PATCH', '/users/:id', r, 'admin desactiva usuario', r.s === 200 && r.b.isActive === false, r.s);
  r = await http('/auth/me', { token: user.token });
  check('GET', '/auth/me', r, 'token del desactivado -> 401', r.s === 401, r.s);

  r = await http('/users/00000000-0000-0000-0000-000000000000', { method: 'DELETE', token: admin });
  check('DELETE', '/users/:id', r, 'inexistente -> 404', r.s === 404, r.s);

  await http('/tracks/' + tid, { method: 'DELETE', token: producer.token });
}

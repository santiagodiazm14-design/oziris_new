import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchSearchSuggestions } from './searchService';
import { API_URL } from './config';

function mockFetch(body: unknown, ok = true) {
  const fn = vi.fn().mockResolvedValue({ ok, json: async () => body });
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('fetchSearchSuggestions', () => {
  it('pide /search con el texto codificado y el límite', async () => {
    const fn = mockFetch({ query: 'a&b', artists: [], beats: [] });
    await fetchSearchSuggestions('a&b', undefined, 4);
    const url = new URL(fn.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe(`${API_URL}/search`);
    expect(url.searchParams.get('q')).toBe('a&b');
    expect(url.searchParams.get('limit')).toBe('4');
  });

  it('pasa la señal para poder cancelar la petición', async () => {
    const fn = mockFetch({ artists: [], beats: [] });
    const ctrl = new AbortController();
    await fetchSearchSuggestions('x', ctrl.signal);
    expect(fn.mock.calls[0][1].signal).toBe(ctrl.signal);
  });

  it('devuelve listas vacías si la respuesta viene incompleta', async () => {
    mockFetch({});
    const res = await fetchSearchSuggestions('x');
    expect(res).toEqual({ query: 'x', artists: [], beats: [] });
  });

  it('lanza un error si el servidor responde mal', async () => {
    mockFetch({}, false);
    await expect(fetchSearchSuggestions('x')).rejects.toThrow(/buscar/);
  });
});

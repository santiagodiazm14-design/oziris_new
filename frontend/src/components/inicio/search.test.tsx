import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ArtistSuggestion, BeatSuggestion } from '@/types';

const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, isAdmin: false, isArtist: false, logout: vi.fn() }),
}));
vi.mock('@/context/CartContext', () => ({
  useCart: () => ({ cartCount: 0, toggleCart: vi.fn() }),
}));

const api = vi.hoisted(() => ({ fetchSearchSuggestions: vi.fn() }));
vi.mock('@/services/api', () => api);

import InicioNavbar from './InicioNavbar';

const artist: ArtistSuggestion = {
  id: 'art-1',
  name: 'Carlos Mendoza',
  artistName: 'Darío Beats',
  avatarUrl: null,
  genre: 'Trap',
  verified: true,
  tracksCount: 3,
};
const beat: BeatSuggestion = {
  id: 'beat-1',
  title: 'Dark Night',
  genre: 'Trap',
  bpm: 140,
  price: 25000,
  coverUrl: null,
  playsCount: 10,
  producer: { id: 'art-1', name: 'Carlos', artistName: 'Darío Beats' },
};

const reply = (artists: ArtistSuggestion[], beats: BeatSuggestion[]) =>
  api.fetchSearchSuggestions.mockImplementation(async (q: string) => ({ query: q, artists, beats }));

function Harness({ initial = '' }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  return (
    <InicioNavbar
      searchQuery={q}
      setSearchQuery={setQ}
      searchFilterType="Beats"
      setSearchFilterType={vi.fn()}
      showSearchTypeDropdown={false}
      setShowSearchTypeDropdown={vi.fn()}
      selectedCategory="rankings"
      setSelectedCategory={vi.fn()}
      selectedGenre={undefined}
      setSelectedGenre={vi.fn()}
      setSelectedTag={vi.fn()}
      setSelectedSort={vi.fn()}
      setIsMenuOpen={vi.fn()}
      setIsUploadModalOpen={vi.fn()}
      setIsPurchasedBeatsModalOpen={vi.fn()}
      purchasedTrackIds={[]}
      favoritesCount={0}
      openFavorites={vi.fn()}
    />
  );
}

const box = () => screen.getAllByRole('combobox')[0] as HTMLInputElement;

beforeEach(() => {
  api.fetchSearchSuggestions.mockReset();
  push.mockClear();
});

describe('Barra de búsqueda con sugerencias', () => {
  it('con una sola letra ya muestra artistas y beats', async () => {
    reply([artist], [beat]);
    const u = userEvent.setup();
    render(<Harness />);
    await u.type(box(), 'd');

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: /3 beats/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Dark Night/ })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Artistas' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Beats' })).toBeInTheDocument();
    expect(api.fetchSearchSuggestions).toHaveBeenCalledWith('d', expect.anything());
  });

  it('no consulta nada con el campo vacío o solo espacios', async () => {
    reply([artist], [beat]);
    const u = userEvent.setup();
    render(<Harness />);
    await u.click(box());
    await u.type(box(), '   ');
    await new Promise((r) => setTimeout(r, 300));
    expect(api.fetchSearchSuggestions).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('al escribir rápido solo busca el último texto', async () => {
    reply([artist], []);
    const u = userEvent.setup();
    render(<Harness />);
    await u.type(box(), 'dar');
    await screen.findByRole('option', { name: /3 beats/ });
    expect(api.fetchSearchSuggestions).toHaveBeenCalledTimes(1);
    expect(api.fetchSearchSuggestions).toHaveBeenCalledWith('dar', expect.anything());
  });

  it('resalta la parte que coincide con lo escrito', async () => {
    reply([artist], [beat]);
    const u = userEvent.setup();
    render(<Harness />);
    await u.type(box(), 'dar');
    const opt = await screen.findByRole('option', { name: /Dark Night/ });
    expect(opt.querySelector('strong')?.textContent).toBe('Dar');
  });

  it('al elegir un artista abre su perfil', async () => {
    reply([artist], [beat]);
    const u = userEvent.setup();
    render(<Harness />);
    await u.type(box(), 'dar');
    await u.click(await screen.findByRole('option', { name: /3 beats/ }));
    expect(push).toHaveBeenCalledWith('/artista/art-1');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('al elegir un beat filtra el catálogo con su título', async () => {
    reply([artist], [beat]);
    const u = userEvent.setup();
    render(<Harness />);
    await u.type(box(), 'dar');
    await u.click(await screen.findByRole('option', { name: /Dark Night/ }));
    expect(box().value).toBe('Dark Night');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('se maneja con el teclado: flechas, Enter y Escape', async () => {
    reply([artist], [beat]);
    const u = userEvent.setup();
    render(<Harness />);
    await u.type(box(), 'dar');
    await screen.findByRole('option', { name: /Dark Night/ });

    await u.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('option', { name: /Dark Night/ })).toHaveAttribute('aria-selected', 'true');
    await u.keyboard('{ArrowUp}');
    expect(screen.getByRole('option', { name: /3 beats/ })).toHaveAttribute('aria-selected', 'true');
    await u.keyboard('{Enter}');
    expect(push).toHaveBeenCalledWith('/artista/art-1');

    await u.type(box(), 'x');
    await screen.findByRole('listbox');
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('avisa cuando no hay resultados', async () => {
    reply([], []);
    const u = userEvent.setup();
    render(<Harness />);
    await u.type(box(), 'zzzz');
    expect(await screen.findByText(/Sin resultados para/)).toBeInTheDocument();
  });

  it('avisa si la búsqueda falla', async () => {
    api.fetchSearchSuggestions.mockRejectedValue(new Error('x'));
    const u = userEvent.setup();
    render(<Harness />);
    await u.type(box(), 'dar');
    expect(await screen.findByText(/No pudimos buscar/)).toBeInTheDocument();
  });

  it('se cierra al hacer clic fuera y al limpiar', async () => {
    reply([artist], []);
    const u = userEvent.setup();
    render(<Harness />);
    await u.type(box(), 'dar');
    await screen.findByRole('listbox');
    await u.click(document.body);
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

    await u.click(box());
    await screen.findByRole('listbox');
    await u.click(screen.getAllByTitle('Limpiar búsqueda')[0]);
    expect(box().value).toBe('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('el desplegable no se duplica entre escritorio y móvil', async () => {
    reply([artist], []);
    const u = userEvent.setup();
    render(<Harness />);
    await u.type(box(), 'dar');
    await screen.findByRole('listbox');
    expect(screen.getAllByRole('listbox')).toHaveLength(1);
  });
});

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Track } from '@/types';

// ---- mocks -------------------------------------------------------------
const nav = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push }) }));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,
    isArtist: false,
    isLoading: false,
    logout: vi.fn(),
  }),
}));
vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    isInCart: () => false,
    cartCount: 0,
    toggleCart: vi.fn(),
    addToCart: vi.fn(),
  }),
}));
vi.mock('@/context/PlayerContext', () => ({
  usePlayer: () => ({ currentTrack: null, isPlaying: false, playTrack: vi.fn() }),
}));
vi.mock('@/context/FavoritesContext', () => ({
  useFavorites: () => ({
    favorites: [],
    isFavorite: () => false,
    toggleFavorite: vi.fn(),
    isFavoritesOpen: false,
    openFavorites: vi.fn(),
    closeFavorites: vi.fn(),
  }),
}));

const api = vi.hoisted(() => ({
  fetchTracks: vi.fn(),
  fetchTrackById: vi.fn(),
  fetchMyPurchasesApi: vi.fn(),
  downloadBeatFile: vi.fn(),
  fetchSearchSuggestions: vi.fn(),
}));
vi.mock('@/services/api', () => api);

import InicioPage from '@/app/inicio/page';

const mk = (id: string, title: string): Track =>
  ({
    id,
    title,
    price: 25000,
    genre: 'Trap',
    tags: [],
    coverUrl: '',
    audioUrl: '/uploads/a.mp3',
    producerId: 'p1',
    producer: { id: 'p1', name: 'Prod', artistName: 'Prod' },
    playsCount: 0,
  }) as unknown as Track;

const all = [mk('t1', 'Dark Night'), mk('t2', 'Sunset Vibes'), mk('t3', 'Midnight Drill')];

const scrolled: string[] = [];

beforeEach(() => {
  Object.values(api).forEach((m) => m.mockReset());
  scrolled.length = 0;
  nav.push.mockClear();
  Element.prototype.scrollIntoView = function (this: Element) {
    scrolled.push(this.id);
  } as typeof Element.prototype.scrollIntoView;

  // El catalogo respeta el texto buscado, como el backend
  api.fetchTracks.mockImplementation(async (p?: { search?: string }) =>
    all.filter((t) => !p?.search || t.title.toLowerCase().includes(p.search.toLowerCase())),
  );
  api.fetchMyPurchasesApi.mockResolvedValue([]);
  api.fetchSearchSuggestions.mockImplementation(async (q: string) => ({
    query: q,
    artists: [],
    beats: [
      {
        id: 't3',
        title: 'Midnight Drill',
        genre: 'Drill',
        bpm: 140,
        price: 25000,
        coverUrl: null,
        playsCount: 0,
        producer: { id: 'p1', name: 'Prod', artistName: 'Prod' },
      },
    ],
  }));
});

afterEach(() => vi.restoreAllMocks());

const searchBox = () => screen.getAllByRole('combobox')[0] as HTMLInputElement;

describe('Inicio: llévame a ese beat', () => {
  it('limpia la búsqueda, baja hasta el beat elegido y lo resalta', async () => {
    const u = userEvent.setup();
    render(<InicioPage />);
    await screen.findByText('Dark Night');

    // Con "dark" el catalogo solo muestra Dark Night
    await u.type(searchBox(), 'dark');
    await waitFor(() => expect(screen.queryByText('Sunset Vibes')).not.toBeInTheDocument());

    await u.click(await screen.findByRole('option', { name: /Midnight Drill/ }));

    // Vuelve la lista completa y se baja hasta el beat elegido
    await waitFor(() => expect(scrolled).toContain('beat-t3'));
    expect(screen.getByText('Sunset Vibes')).toBeInTheDocument();
    expect(searchBox().value).toBe('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    const card = document.getElementById('beat-t3') as HTMLElement;
    expect(card).toHaveAttribute('data-highlighted', 'true');
    // Las demas tarjetas no se resaltan
    expect(document.getElementById('beat-t1')).not.toHaveAttribute('data-highlighted');
    // No navega a otra pagina
    expect(nav.push).not.toHaveBeenCalled();
  });

  it('no baja hasta que el catálogo termine de recargar', async () => {
    const u = userEvent.setup();
    render(<InicioPage />);
    await screen.findByText('Dark Night');
    await u.type(searchBox(), 'dark');
    await waitFor(() => expect(screen.queryByText('Sunset Vibes')).not.toBeInTheDocument());
    await u.click(await screen.findByRole('option', { name: /Midnight Drill/ }));

    // Nunca intenta bajar a un beat que aun no esta en pantalla
    await waitFor(() => expect(scrolled).toContain('beat-t3'));
    expect(scrolled.every((id) => id === 'beat-t3')).toBe(true);
    expect(document.getElementById('beat-t3')).toBeInTheDocument();
  });

  it('si el beat no está entre los cargados, lo trae y baja hasta él', async () => {
    api.fetchTracks.mockImplementation(async () => [all[0], all[1]]); // t3 no viene en la lista
    api.fetchTrackById.mockResolvedValue(all[2]);
    const u = userEvent.setup();
    render(<InicioPage />);
    await screen.findByText('Sunset Vibes');
    expect(screen.queryByText('Midnight Drill')).not.toBeInTheDocument();

    await u.type(searchBox(), 'mid');
    await u.click(await screen.findByRole('option', { name: /Midnight Drill/ }));

    expect(await screen.findByText('Midnight Drill')).toBeInTheDocument();
    await waitFor(() => expect(scrolled).toContain('beat-t3'));
    expect(api.fetchTrackById).toHaveBeenCalledWith('t3');
  });

  it('si el beat ya no existe no se queda esperando ni rompe la página', async () => {
    api.fetchTracks.mockImplementation(async () => [all[0]]);
    api.fetchTrackById.mockRejectedValue(new Error('404'));
    const u = userEvent.setup();
    render(<InicioPage />);
    await screen.findByText('Dark Night');
    await u.type(searchBox(), 'mid');
    await u.click(await screen.findByRole('option', { name: /Midnight Drill/ }));

    await waitFor(() => expect(api.fetchTrackById).toHaveBeenCalled());
    expect(scrolled).toHaveLength(0);
    expect(screen.getByText('Dark Night')).toBeInTheDocument();
    const grid = screen.getByText('Dark Night').closest('div[id^="beat-"]') as HTMLElement;
    expect(within(grid).getByText('Dark Night')).toBeInTheDocument();
  });
});

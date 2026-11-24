import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  IDLE_TIMEOUT_MS,
  IDLE_WARNING_MS,
  LAST_ACTIVITY_KEY,
  SESSION_EXPIRED_KEY,
} from '@/lib/session';
import { ApiError } from '@/services/http';

// ---- mocks -------------------------------------------------------------
const auth = vi.hoisted(() => ({
  isAuthenticated: true,
  logout: vi.fn(),
  login: vi.fn(),
}));
vi.mock('@/context/AuthContext', () => ({ useAuth: () => auth }));

const player = vi.hoisted(() => ({ isPlaying: false }));
vi.mock('@/context/PlayerContext', () => ({ usePlayer: () => player }));

const nav = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push }) }));

const api = vi.hoisted(() => ({ loginApi: vi.fn() }));
vi.mock('@/services/api', () => api);

import IdleSessionGuard from './IdleSessionGuard';
import LoginPage from '@/app/(auth)/login/page';

const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

describe('IdleSessionGuard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    auth.isAuthenticated = true;
    auth.logout.mockClear();
    player.isPlaying = false;
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  });
  afterEach(() => vi.useRealTimers());

  it('el tiempo de inactividad por defecto es de 15 minutos y avisa el último minuto', () => {
    expect(IDLE_TIMEOUT_MS).toBe(15 * 60 * 1000);
    expect(IDLE_WARNING_MS).toBe(60 * 1000);
  });

  it('no molesta mientras hay actividad reciente', async () => {
    render(<IdleSessionGuard />);
    await advance(10 * 60 * 1000);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('avisa un minuto antes con la cuenta regresiva', async () => {
    render(<IdleSessionGuard />);
    await advance(IDLE_TIMEOUT_MS - IDLE_WARNING_MS + 5000);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/55 s/)).toBeInTheDocument();
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('al cumplirse el tiempo cierra la sesión y deja el aviso para el login', async () => {
    render(<IdleSessionGuard />);
    await advance(IDLE_TIMEOUT_MS + 2000);
    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(SESSION_EXPIRED_KEY)).toBe('1');
  });

  it('cualquier actividad reinicia el tiempo y quita el aviso', async () => {
    render(<IdleSessionGuard />);
    await advance(IDLE_TIMEOUT_MS - IDLE_WARNING_MS + 5000);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    fireEvent.mouseDown(window);
    await advance(1500);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    // Pasa lo que faltaba para expirar con el reloj anterior: sigue conectado
    await advance(IDLE_WARNING_MS);
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('el botón "Seguir conectado" mantiene la sesión', async () => {
    render(<IdleSessionGuard />);
    await advance(IDLE_TIMEOUT_MS - IDLE_WARNING_MS + 5000);
    fireEvent.click(screen.getByRole('button', { name: 'Seguir conectado' }));
    await advance(2000);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    await advance(IDLE_WARNING_MS);
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('no cierra la sesión mientras suena un beat', async () => {
    player.isPlaying = true;
    render(<IdleSessionGuard />);
    await advance(IDLE_TIMEOUT_MS * 2);
    expect(auth.logout).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('si el navegador estuvo cerrado más del límite, la sesión ya caducó', async () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now() - IDLE_TIMEOUT_MS - 1000));
    render(<IdleSessionGuard />);
    await advance(10);
    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(SESSION_EXPIRED_KEY)).toBe('1');
  });

  it('sin sesión iniciada no hace nada', async () => {
    auth.isAuthenticated = false;
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now() - IDLE_TIMEOUT_MS * 3));
    render(<IdleSessionGuard />);
    await advance(IDLE_TIMEOUT_MS);
    expect(auth.logout).not.toHaveBeenCalled();
  });
});

describe('Login: bloqueo por intentos fallidos', () => {
  beforeEach(() => {
    api.loginApi.mockReset();
    auth.login.mockClear();
    nav.push.mockClear();
    sessionStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  async function fillAndSubmit(u: ReturnType<typeof userEvent.setup>) {
    await u.type(screen.getByPlaceholderText('tu@correo.com'), 'ana@test.com');
    await u.type(screen.getByPlaceholderText('••••••••'), 'incorrecta');
    await u.click(screen.getByRole('button', { name: /Iniciar Sesión/ }));
  }

  it('muestra los intentos que quedan', async () => {
    api.loginApi.mockRejectedValue(new ApiError('Credenciales incorrectas. Te quedan 3 intentos.', 401));
    const u = userEvent.setup();
    render(<LoginPage />);
    await fillAndSubmit(u);
    expect(await screen.findByText(/Te quedan 3 intentos/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/ })).toBeEnabled();
  });

  it('tras el bloqueo desactiva el botón con cuenta regresiva y lo habilita al terminar', async () => {
    api.loginApi.mockRejectedValue(
      new ApiError('Demasiados intentos fallidos. Espera 3 segundos para volver a intentarlo.', 429, 3),
    );
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const u = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    render(<LoginPage />);
    await fillAndSubmit(u);

    expect(await screen.findByText(/Demasiados intentos fallidos/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Espera 3 s para reintentar/ });
    expect(btn).toBeDisabled();

    await advance(1100);
    expect(screen.getByRole('button', { name: /Espera 2 s/ })).toBeDisabled();
    await advance(1100);
    expect(screen.getByRole('button', { name: /Espera 1 s/ })).toBeDisabled();
    await advance(1100);
    expect(screen.getByRole('button', { name: /Iniciar Sesión/ })).toBeEnabled();
    expect(screen.queryByText(/Demasiados intentos fallidos/)).not.toBeInTheDocument();
  });

  it('muestra el aviso cuando la sesión se cerró por inactividad (una sola vez)', async () => {
    sessionStorage.setItem(SESSION_EXPIRED_KEY, '1');
    render(<LoginPage />);
    expect(await screen.findByText(/se cerró por inactividad/)).toBeInTheDocument();
    expect(sessionStorage.getItem(SESSION_EXPIRED_KEY)).toBeNull();
  });
});

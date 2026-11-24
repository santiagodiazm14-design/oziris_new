import React, { Suspense } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PlanInfo, Track, User } from '@/types';
import {
  beatsCheckoutUrl,
  parseCheckoutTarget,
  planCheckoutUrl,
} from '@/lib/checkoutParams';
import PaymentStepper from '@/components/checkout/PaymentStepper';

// ---- mocks -------------------------------------------------------------
const nav = vi.hoisted(() => ({ push: vi.fn(), search: '' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: nav.push }),
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const authState: {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
} = { user: null, token: 'tok', isAuthenticated: true, isAdmin: false, isLoading: false };
vi.mock('@/context/AuthContext', () => ({ useAuth: () => authState }));

const showToast = vi.fn();
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ showToast }) }));

const removeFromCart = vi.fn();
vi.mock('@/context/CartContext', () => ({ useCart: () => ({ removeFromCart }) }));

const api = vi.hoisted(() => ({
  fetchTrackById: vi.fn(),
  fetchPlansApi: vi.fn(),
  fetchMySubscriptionApi: vi.fn(),
  simulatePaymentApi: vi.fn(),
  simulateSubscriptionApi: vi.fn(),
  downloadBeatFile: vi.fn(),
}));
vi.mock('@/services/api', () => api);

// ---- datos de prueba ---------------------------------------------------
const user = { id: 'u1', name: 'Ana Test', email: 'ana@test.com', role: 'USER' } as User;
const beatA = { id: 'a', title: 'Dark Night', price: 25000, genre: 'Trap', coverUrl: '', producer: { name: 'Prod' } } as unknown as Track;
const beatB = { id: 'b', title: 'Sunset Vibes', price: 30000, genre: 'Pop', coverUrl: '', producer: { name: 'Prod' } } as unknown as Track;
const plans: PlanInfo[] = [
  { id: 'FREE', name: 'Free', description: 'x', priceMonthly: 0, priceYearly: 0, maxBeats: 10, features: ['Subir hasta 10 beats'] },
  { id: 'PLUS', name: 'Plus', description: 'x', priceMonthly: 25000, priceYearly: 250000, maxBeats: 100, features: ['Subir hasta 100 beats'] },
  { id: 'PREMIUM', name: 'Premium', description: 'x', priceMonthly: 50000, priceYearly: 600000, maxBeats: null, features: ['Beats ilimitados'] },
];

beforeEach(() => {
  Object.values(api).forEach((m) => m.mockReset());
  nav.push.mockClear();
  removeFromCart.mockClear();
  showToast.mockClear();
  authState.user = user;
  authState.token = 'tok';
  authState.isAuthenticated = true;
  authState.isAdmin = false;
  api.fetchTrackById.mockImplementation(async (id: string) => (id === 'a' ? beatA : beatB));
  api.fetchPlansApi.mockResolvedValue(plans);
  api.fetchMySubscriptionApi.mockResolvedValue(null);
});

// ---- parametros --------------------------------------------------------
describe('checkoutParams', () => {
  const q = (s: string) => parseCheckoutTarget(new URLSearchParams(s));

  it('lee varios beats separados por coma', () => {
    expect(q('beats=a,b')).toEqual({ kind: 'beats', ids: ['a', 'b'] });
  });
  it('acepta el parametro viejo ?beat= y quita repetidos', () => {
    expect(q('beat=a')).toEqual({ kind: 'beats', ids: ['a'] });
    expect(q('beats=a,a,b')).toEqual({ kind: 'beats', ids: ['a', 'b'] });
  });
  it('lee un plan con su periodo (mensual por defecto)', () => {
    expect(q('plan=plus&periodo=yearly')).toEqual({ kind: 'plan', plan: 'PLUS', period: 'YEARLY' });
    expect(q('plan=PREMIUM')).toEqual({ kind: 'plan', plan: 'PREMIUM', period: 'MONTHLY' });
  });
  it('un plan inexistente o sin parametros no es nada', () => {
    expect(q('plan=ORO')).toEqual({ kind: 'none' });
    expect(q('')).toEqual({ kind: 'none' });
  });
  it('arma las URLs de checkout', () => {
    expect(beatsCheckoutUrl(['a', 'b'])).toBe('/checkout?beats=a,b');
    expect(planCheckoutUrl('PLUS', 'YEARLY')).toBe('/checkout?plan=PLUS&periodo=YEARLY');
  });
});

// ---- barra de pasos ----------------------------------------------------
describe('PaymentStepper', () => {
  it('marca el paso actual y los anteriores como hechos', () => {
    render(<PaymentStepper current={3} />);
    expect(screen.getByText('3').closest('span')).toHaveAttribute('aria-current', 'step');
    expect(screen.queryByText('1')).not.toBeInTheDocument(); // paso hecho = palomita
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});

// ---- /checkout ---------------------------------------------------------
describe('CheckoutPage', () => {
  async function renderCheckout(search: string) {
    nav.search = search;
    const { default: Page } = await import('@/app/checkout/page');
    return render(
      <Suspense fallback={null}>
        <Page />
      </Suspense>,
    );
  }

  it('muestra todos los beats del carrito y el total', async () => {
    await renderCheckout('beats=a,b');
    expect(await screen.findByText('Dark Night')).toBeInTheDocument();
    expect(screen.getByText('Sunset Vibes')).toBeInTheDocument();
    expect(screen.getByText('2 Beats seleccionados')).toBeInTheDocument();
    expect(screen.getAllByText(/55\.000/).length).toBeGreaterThan(0);
  });

  it('continuar lleva a datos-pago con todos los beats y el metodo', async () => {
    const u = userEvent.setup();
    await renderCheckout('beats=a,b');
    await screen.findByText('Dark Night');
    await u.click(screen.getByRole('button', { name: /Tarjeta/ }));
    await u.click(screen.getByRole('button', { name: /Continuar con Tarjeta/ }));
    expect(nav.push).toHaveBeenCalledWith('/datos-pago?metodo=Tarjeta&beats=a,b');
  });

  it('muestra el plan elegido y su precio anual', async () => {
    const u = userEvent.setup();
    await renderCheckout('plan=PLUS&periodo=YEARLY');
    expect(await screen.findByText('Subir hasta 100 beats')).toBeInTheDocument();
    expect(screen.getAllByText(/250\.000/).length).toBeGreaterThan(0);
    await u.click(screen.getByRole('button', { name: /Continuar con PSE/ }));
    expect(nav.push).toHaveBeenCalledWith('/datos-pago?metodo=PSE&plan=PLUS&periodo=YEARLY');
  });

  it('sin sesion el boton manda a iniciar sesion', async () => {
    authState.isAuthenticated = false;
    authState.token = null;
    const u = userEvent.setup();
    await renderCheckout('beats=a');
    await screen.findByText('Dark Night');
    await u.click(screen.getByRole('button', { name: /Inicia sesión para continuar/ }));
    expect(nav.push).toHaveBeenCalledWith('/login');
  });

  it('un administrador no puede continuar', async () => {
    authState.isAdmin = true;
    await renderCheckout('beats=a');
    await screen.findByText('Dark Night');
    expect(screen.getByRole('button', { name: /Continuar con PSE/ })).toBeDisabled();
  });

  it('sin parametros muestra el error', async () => {
    await renderCheckout('');
    expect(await screen.findByText('No se pudo cargar tu compra')).toBeInTheDocument();
  });
});

// ---- /datos-pago: proceso completo -------------------------------------
describe('DatosPagoPage', () => {
  async function renderDatos(search: string) {
    nav.search = search;
    const { default: Page } = await import('@/app/datos-pago/page');
    return render(
      <Suspense fallback={null}>
        <Page />
      </Suspense>,
    );
  }

  async function fillAndSubmit(u: ReturnType<typeof userEvent.setup>) {
    await u.type(screen.getByPlaceholderText('Número de documento'), '1020304050');
    await u.type(screen.getByPlaceholderText('300 000 0000'), '3001234567');
    await u.click(screen.getByRole('button', { name: /Confirmar y Simular Pago/ }));
  }

  it('beats: formulario -> procesando -> confirmacion con descarga por beat', async () => {
    api.simulatePaymentApi.mockResolvedValue({
      success: true,
      message: 'ok',
      transactionId: 'OZ-SIM-1',
      paymentMethod: 'PSE',
      licenseType: 'x',
      purchasedAt: '',
      purchases: [
        { id: 'p1', trackId: 'a', trackTitle: 'Dark Night', amount: 25000, status: 'COMPLETED', paymentMethod: 'PSE', licenseType: 'x', transactionId: 't1', createdAt: '', downloadUrl: '', alreadyOwned: false },
        { id: 'p2', trackId: 'b', trackTitle: 'Sunset Vibes', amount: 30000, status: 'COMPLETED', paymentMethod: 'PSE', licenseType: 'x', transactionId: 't2', createdAt: '', downloadUrl: '', alreadyOwned: false },
      ],
    });
    api.downloadBeatFile.mockResolvedValue(undefined);
    const u = userEvent.setup();
    await renderDatos('metodo=PSE&beats=a,b');
    await screen.findByText('Sunset Vibes');
    // Antes de pagar NO hay botones de descarga
    expect(screen.queryByRole('button', { name: /Descargar/ })).not.toBeInTheDocument();

    await fillAndSubmit(u);
    expect(await screen.findByText('Procesando tu pago')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Descargar/ })).not.toBeInTheDocument();

    expect(await screen.findByText('¡Pago Simulado Exitoso!', {}, { timeout: 8000 })).toBeInTheDocument();
    expect(api.simulatePaymentApi).toHaveBeenCalledWith(
      'tok',
      expect.objectContaining({ trackIds: ['a', 'b'], paymentMethod: 'PSE' }),
    );
    expect(removeFromCart).toHaveBeenCalledWith('a');
    expect(removeFromCart).toHaveBeenCalledWith('b');

    const buttons = screen.getAllByRole('button', { name: /Descargar Beat/ });
    expect(buttons).toHaveLength(2);
    await u.click(buttons[1]);
    expect(api.downloadBeatFile).toHaveBeenCalledWith('tok', 'b', 'Sunset Vibes');
  }, 20000);

  it('plan: confirma la suscripcion y no ofrece descarga', async () => {
    api.simulateSubscriptionApi.mockResolvedValue({
      success: true,
      message: 'ok',
      transactionId: 'OZ-SUB-1',
      plan: 'PLUS',
      planName: 'Plus',
      period: 'YEARLY',
      amount: 250000,
      currency: 'COP',
      paymentMethod: 'PSE',
      startsAt: '2026-01-01T00:00:00Z',
      endsAt: '2027-01-01T00:00:00Z',
      maxBeats: 100,
    });
    const u = userEvent.setup();
    await renderDatos('metodo=PSE&plan=PLUS&periodo=YEARLY');
    await screen.findByText(/Plus · anual/);
    await fillAndSubmit(u);
    expect(await screen.findByText('¡Ya tienes el plan Plus!', {}, { timeout: 8000 })).toBeInTheDocument();
    expect(api.simulateSubscriptionApi).toHaveBeenCalledWith(
      'tok',
      expect.objectContaining({ plan: 'PLUS', period: 'YEARLY', paymentMethod: 'PSE' }),
    );
    expect(screen.queryByRole('button', { name: /Descargar/ })).not.toBeInTheDocument();
    expect(api.simulatePaymentApi).not.toHaveBeenCalled();
  }, 20000);

  it('si el pago falla vuelve al formulario con el error y sin descarga', async () => {
    api.simulatePaymentApi.mockRejectedValue(new Error('Tarjeta rechazada'));
    const u = userEvent.setup();
    await renderDatos('metodo=PSE&beats=a');
    await screen.findByText('Dark Night');
    await fillAndSubmit(u);
    expect(await screen.findByText('Tarjeta rechazada', {}, { timeout: 8000 })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Descargar/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmar y Simular Pago/ })).toBeInTheDocument();
  }, 20000);

  it('sin sesion pide iniciar sesion', async () => {
    authState.isAuthenticated = false;
    authState.token = null;
    await renderDatos('metodo=PSE&beats=a');
    expect(await screen.findByText('Inicia sesión para pagar')).toBeInTheDocument();
  });

  it('sin nada que pagar lo avisa', async () => {
    await renderDatos('metodo=PSE');
    expect(await screen.findByText('No hay nada para pagar')).toBeInTheDocument();
  });
});

// ---- /planes -----------------------------------------------------------
describe('PricingPage', () => {
  async function renderPlans() {
    const { default: Page } = await import('@/app/planes/page');
    return render(<Page />);
  }

  it('Suscribete lleva a la pasarela con el plan y el periodo', async () => {
    const u = userEvent.setup();
    await renderPlans();
    await screen.findAllByText('Plus');
    await u.click(screen.getAllByRole('button', { name: 'Suscríbete ahora' })[0]);
    expect(nav.push).toHaveBeenCalledWith('/checkout?plan=PLUS&periodo=YEARLY');
  });

  it('el selector mensual cambia el periodo', async () => {
    const u = userEvent.setup();
    await renderPlans();
    await u.click(await screen.findByRole('button', { name: 'Mensual' }));
    await u.click(screen.getAllByRole('button', { name: 'Suscríbete ahora' })[1]);
    expect(nav.push).toHaveBeenCalledWith('/checkout?plan=PREMIUM&periodo=MONTHLY');
  });

  it('sin sesion manda a iniciar sesion', async () => {
    authState.isAuthenticated = false;
    authState.token = null;
    const u = userEvent.setup();
    await renderPlans();
    await u.click((await screen.findAllByRole('button', { name: /Inicia sesión para suscribirte/ }))[0]);
    expect(nav.push).toHaveBeenCalledWith('/login');
  });

  it('marca el plan actual y lo deshabilita', async () => {
    api.fetchMySubscriptionApi.mockResolvedValue({ plan: 'PLUS', period: 'YEARLY', status: 'ACTIVE' });
    await renderPlans();
    const btn = await screen.findByRole('button', { name: 'Tu plan actual' });
    expect(btn).toBeDisabled();
  });

  it('la tarjeta lista los beneficios de cada plan', async () => {
    await renderPlans();
    const list = await screen.findByText('Subir hasta 100 beats');
    expect(within(list.closest('ul') as HTMLElement).getAllByRole('listitem')).toHaveLength(1);
  });
});

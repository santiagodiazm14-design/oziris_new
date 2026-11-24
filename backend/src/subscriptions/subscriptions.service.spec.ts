import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { periodEnd, planPrice, PLANS } from './plans';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: any;
  let tx: any;

  beforeEach(async () => {
    tx = {
      $executeRaw: jest.fn(),
      subscription: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockImplementation(async ({ data }: any) => ({
          ...data,
          id: 's1',
        })),
      },
    };
    prisma = {
      subscription: { findFirst: jest.fn(), updateMany: jest.fn() },
      track: { count: jest.fn() },
      $transaction: jest.fn().mockImplementation(async (fn: any) => fn(tx)),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(SubscriptionsService);
  });

  describe('plans helpers', () => {
    it('planPrice devuelve el precio mensual o anual', () => {
      expect(planPrice(PLANS.PLUS, 'MONTHLY')).toBe(25000);
      expect(planPrice(PLANS.PLUS, 'YEARLY')).toBe(250000);
      expect(planPrice(PLANS.PREMIUM, 'MONTHLY')).toBe(50000);
    });
    it('periodEnd suma un mes o un año', () => {
      const from = new Date('2026-01-15T00:00:00Z');
      expect(periodEnd(from, 'MONTHLY').getUTCMonth()).toBe(1);
      expect(periodEnd(from, 'YEARLY').getUTCFullYear()).toBe(2027);
    });
  });

  describe('getPlans', () => {
    it('lista Free, Plus y Premium', () => {
      const { plans } = service.getPlans();
      expect(plans.map((p) => p.id)).toEqual(['FREE', 'PLUS', 'PREMIUM']);
    });
  });

  describe('getMine', () => {
    it('sin suscripción rige Free con cupo de 10', async () => {
      prisma.subscription.findFirst.mockResolvedValue(null);
      prisma.track.count.mockResolvedValue(4);
      const me = await service.getMine('u1');
      expect(me.plan).toBe('FREE');
      expect(me.maxBeats).toBe(10);
      expect(me.beatsRemaining).toBe(6);
    });
    it('Premium no tiene tope', async () => {
      prisma.subscription.findFirst.mockResolvedValue({
        plan: 'PREMIUM',
        period: 'YEARLY',
        amount: 600000,
      });
      prisma.track.count.mockResolvedValue(500);
      const me = await service.getMine('u1');
      expect(me.plan).toBe('PREMIUM');
      expect(me.maxBeats).toBeNull();
      expect(me.beatsRemaining).toBeNull();
    });
  });

  describe('simulate', () => {
    it('cobra el precio del catálogo y reemplaza la suscripción previa', async () => {
      const res = await service.simulate('u1', {
        plan: 'PLUS',
        period: 'YEARLY',
        paymentMethod: 'Tarjeta',
        cardLastFour: '4111222233334242',
      });
      expect(res.amount).toBe(250000);
      expect(tx.subscription.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', status: 'ACTIVE' },
        data: { status: 'REPLACED' },
      });
      const data = tx.subscription.create.mock.calls[0][0].data;
      expect(data.cardLastFour).toBe('4242');
      expect(data.endsAt.getTime()).toBeGreaterThan(Date.now());
    });
    it('rechaza el plan FREE', async () => {
      await expect(
        service.simulate('u1', { plan: 'FREE' as any, period: 'MONTHLY' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('cancela la suscripción activa', async () => {
      prisma.subscription.updateMany.mockResolvedValue({ count: 1 });
      const res = await service.cancel('u1');
      expect(res.cancelled).toBe(true);
    });
    it('avisa si no había suscripción', async () => {
      prisma.subscription.updateMany.mockResolvedValue({ count: 0 });
      const res = await service.cancel('u1');
      expect(res.cancelled).toBe(false);
    });
  });

  describe('assertCanUpload', () => {
    it('Free bloquea el beat número 11', async () => {
      prisma.subscription.findFirst.mockResolvedValue(null);
      prisma.track.count.mockResolvedValue(10);
      await expect(service.assertCanUpload('u1', 'PRODUCER')).rejects.toThrow(
        ForbiddenException,
      );
    });
    it('Free permite el beat número 10', async () => {
      prisma.subscription.findFirst.mockResolvedValue(null);
      prisma.track.count.mockResolvedValue(9);
      await expect(
        service.assertCanUpload('u1', 'PRODUCER'),
      ).resolves.toBeUndefined();
    });
    it('Plus permite más de 10 pero bloquea el 101', async () => {
      prisma.subscription.findFirst.mockResolvedValue({ plan: 'PLUS' });
      prisma.track.count.mockResolvedValueOnce(50);
      await expect(
        service.assertCanUpload('u1', 'PRODUCER'),
      ).resolves.toBeUndefined();
      prisma.track.count.mockResolvedValueOnce(100);
      await expect(service.assertCanUpload('u1', 'PRODUCER')).rejects.toThrow(
        ForbiddenException,
      );
    });
    it('Premium es ilimitado', async () => {
      prisma.subscription.findFirst.mockResolvedValue({ plan: 'PREMIUM' });
      await expect(
        service.assertCanUpload('u1', 'PRODUCER'),
      ).resolves.toBeUndefined();
      expect(prisma.track.count).not.toHaveBeenCalled();
    });
    it('ADMIN no tiene límite', async () => {
      await expect(
        service.assertCanUpload('a1', 'ADMIN'),
      ).resolves.toBeUndefined();
      expect(prisma.subscription.findFirst).not.toHaveBeenCalled();
    });
  });
});

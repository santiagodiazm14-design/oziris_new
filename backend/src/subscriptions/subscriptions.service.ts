import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SimulateSubscriptionDto } from './dto/simulate-subscription.dto';
import {
  CURRENCY,
  PLANS,
  PlanDefinition,
  PlanId,
  periodEnd,
  planPrice,
} from './plans';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Catalogo publico de planes. */
  getPlans() {
    return {
      currency: CURRENCY,
      plans: Object.values(PLANS).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceMonthly: p.priceMonthly,
        priceYearly: p.priceYearly,
        maxBeats: p.maxBeats,
        features: p.features,
      })),
    };
  }

  /** Suscripcion vigente (ACTIVE y no vencida), o null si rige el plan Free. */
  private async findActive(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', endsAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async resolvePlan(userId: string): Promise<{
    plan: PlanDefinition;
    subscription: Awaited<ReturnType<SubscriptionsService['findActive']>>;
  }> {
    const subscription = await this.findActive(userId);
    const plan =
      (subscription && PLANS[subscription.plan as PlanId]) || PLANS.FREE;
    return { plan, subscription };
  }

  /** Plan actual del usuario con su cupo de beats. */
  async getMine(userId: string) {
    const { plan, subscription } = await this.resolvePlan(userId);
    const beatsUsed = await this.prisma.track.count({
      where: { producerId: userId },
    });
    return {
      plan: plan.id,
      planName: plan.name,
      status: subscription ? 'ACTIVE' : 'FREE',
      period: subscription?.period ?? null,
      amount: subscription?.amount ?? 0,
      currency: CURRENCY,
      startsAt: subscription?.startsAt ?? null,
      endsAt: subscription?.endsAt ?? null,
      maxBeats: plan.maxBeats,
      beatsUsed,
      beatsRemaining:
        plan.maxBeats === null ? null : Math.max(plan.maxBeats - beatsUsed, 0),
      features: plan.features,
    };
  }

  /**
   * Simula el pago de una suscripcion. El precio sale del catalogo del
   * servidor. La suscripcion previa queda como REPLACED.
   */
  async simulate(userId: string, dto: SimulateSubscriptionDto) {
    const plan = PLANS[dto.plan];
    if (!plan || plan.id === 'FREE') {
      throw new BadRequestException('El plan gratuito no requiere pago.');
    }
    const amount = planPrice(plan, dto.period);
    const now = new Date();
    const endsAt = periodEnd(now, dto.period);
    const paymentMethod = dto.paymentMethod || 'PSE';
    const transactionId = `OZ-SUB-${randomUUID()}`;

    const created = await this.prisma.$transaction(async (tx) => {
      // Un solo cambio de plan a la vez por usuario
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'sub:' + userId}))`;
      await tx.subscription.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'REPLACED' },
      });
      return tx.subscription.create({
        data: {
          userId,
          plan: plan.id,
          period: dto.period,
          amount,
          currency: CURRENCY,
          status: 'ACTIVE',
          paymentMethod,
          transactionId,
          payerName: dto.payerName || null,
          payerEmail: dto.payerEmail || null,
          payerPhone: dto.payerPhone || null,
          payerDocument: dto.payerDocument || null,
          // Nunca se guarda mas de los ultimos 4 digitos
          cardLastFour: dto.cardLastFour
            ? String(dto.cardLastFour).replace(/\D/g, '').slice(-4) || null
            : null,
          startsAt: now,
          endsAt,
        },
      });
    });

    return {
      success: true,
      message: `¡Pago simulado con éxito! Ya tienes el plan ${plan.name}.`,
      transactionId: created.transactionId,
      plan: plan.id,
      planName: plan.name,
      period: created.period,
      amount: created.amount,
      currency: created.currency,
      paymentMethod,
      startsAt: created.startsAt,
      endsAt: created.endsAt,
      maxBeats: plan.maxBeats,
    };
  }

  /** Cancela la suscripcion vigente; el usuario vuelve al plan Free. */
  async cancel(userId: string) {
    const res = await this.prisma.subscription.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
    return {
      success: true,
      cancelled: res.count > 0,
      message:
        res.count > 0
          ? 'Suscripción cancelada. Volviste al plan Free.'
          : 'No tenías una suscripción activa.',
    };
  }

  /** Lanza 403 si el usuario ya alcanzo el limite de beats de su plan. */
  async assertCanUpload(userId: string, role: string): Promise<void> {
    if (role === 'ADMIN') return;
    const { plan } = await this.resolvePlan(userId);
    if (plan.maxBeats === null) return;
    const used = await this.prisma.track.count({
      where: { producerId: userId },
    });
    if (used >= plan.maxBeats) {
      throw new ForbiddenException(
        `Alcanzaste el límite de ${plan.maxBeats} beats de tu plan ${plan.name}. Mejora tu plan para subir más.`,
      );
    }
  }
}

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { join, basename, resolve, sep } from 'path';
import { existsSync, createReadStream } from 'fs';
import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { Readable } from 'stream';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { TracksService } from '../tracks/tracks.service';
import { SimulatedPurchaseDto } from './dto';

export { SimulatedPurchaseDto };

const MAX_REMOTE_BYTES = 150 * 1024 * 1024;
const REMOTE_TIMEOUT_MS = 20_000;

/** true si la IP es privada/loopback/link-local (destino prohibido para el proxy). */
function isPrivateIp(ip: string): boolean {
  if (ip.includes(':')) {
    const v = ip.toLowerCase();
    return (
      v === '::1' ||
      v === '::' ||
      v.startsWith('fc') ||
      v.startsWith('fd') ||
      v.startsWith('fe80') ||
      v.startsWith('::ffff:127.') ||
      v.startsWith('::ffff:10.') ||
      v.startsWith('::ffff:192.168.') ||
      v.startsWith('::ffff:169.254.')
    );
  }
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

async function assertPublicHost(rawUrl: string): Promise<URL> {
  const url = new URL(rawUrl);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Protocolo no permitido');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addrs = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true });
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) {
    throw new Error('Destino no permitido');
  }
  return url;
}

@Injectable()
export class PurchasesService {
  private readonly logger = new Logger(PurchasesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tracksService: TracksService,
  ) {}

  /**
   * Simula un pago y registra la compra/licencia para el usuario autenticado.
   * El monto siempre sale del precio del beat en la BD. Todo el carrito se
   * guarda en una sola transacción (o se compra todo, o nada) y se usa un
   * bloqueo por usuario+beat para que un doble clic no genere compras dobles.
   */
  async simulatePayment(
    userId: string,
    _userRole: string,
    dto: SimulatedPurchaseDto,
  ) {
    const requested =
      dto.trackIds && dto.trackIds.length > 0
        ? dto.trackIds
        : dto.trackId
          ? [dto.trackId]
          : [];
    const trackIdsToProcess = [...new Set(requested)];

    if (trackIdsToProcess.length === 0) {
      throw new BadRequestException(
        'Debes proporcionar al menos un Beat (trackId o trackIds).',
      );
    }

    const paymentMethod = dto.paymentMethod || 'PSE';
    const licenseType = dto.licenseType || 'ESTÁNDAR COMERCIAL (MP3 HQ)';
    const transactionId = `OZ-SIM-${randomUUID()}`;

    const tracks = await this.prisma.track.findMany({
      where: { id: { in: trackIdsToProcess } },
    });
    const byId = new Map(tracks.map((t) => [t.id, t]));
    for (const id of trackIdsToProcess) {
      if (!byId.has(id)) {
        throw new NotFoundException(`El beat con ID ${id} no fue encontrado.`);
      }
    }

    const completedPurchases = await this.prisma.$transaction(async (tx) => {
      const out: any[] = [];
      for (const trackId of trackIdsToProcess) {
        const track = byId.get(trackId)!;
        // Bloqueo por (usuario, beat) hasta el final de la transacción
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId + ':' + trackId}))`;

        const existing = await tx.purchase.findFirst({
          where: { userId, trackId, status: 'COMPLETED' },
        });
        if (existing) {
          out.push({
            id: existing.id,
            trackId,
            trackTitle: track.title,
            amount: existing.amount,
            status: existing.status,
            paymentMethod: existing.paymentMethod || paymentMethod,
            licenseType: existing.licenseType || licenseType,
            transactionId: existing.transactionId,
            createdAt: existing.createdAt,
            downloadUrl: `/purchases/download/${trackId}`,
            alreadyOwned: true,
          });
          continue;
        }

        const amount = track.price;
        const created = await tx.purchase.create({
          data: {
            userId,
            trackId,
            amount,
            status: 'COMPLETED',
            paymentMethod,
            licenseType,
            transactionId: `${transactionId}-${out.length + 1}`,
            payerName: dto.payerName || null,
            payerEmail: dto.payerEmail || null,
            payerPhone: dto.payerPhone || null,
            payerDocument: dto.payerDocument || null,
            paymentProvider:
              dto.bankName ||
              (paymentMethod === 'Tarjeta'
                ? 'Tarjeta de Crédito/Débito'
                : paymentMethod),
            simulation: {
              create: {
                transactionId: `${transactionId}-SIM-${out.length + 1}`,
                method: paymentMethod,
                amount,
                currency: 'USD',
                status: 'APPROVED',
                payerName: dto.payerName || null,
                payerEmail: dto.payerEmail || null,
                payerPhone: dto.payerPhone || null,
                payerDocument: dto.payerDocument || null,
                bankName: dto.bankName || null,
                personType: dto.personType || null,
                cardHolder: dto.cardHolder || null,
                // Nunca se guarda más de los últimos 4 dígitos
                cardLastFour: dto.cardLastFour
                  ? String(dto.cardLastFour).replace(/\D/g, '').slice(-4)
                  : null,
                phoneNumber: dto.phoneNumber || null,
                metadata: dto.metadata ? dto.metadata : undefined,
                userId,
              },
            },
          },
        });

        out.push({
          id: created.id,
          trackId: created.trackId,
          trackTitle: track.title,
          amount: created.amount,
          status: created.status,
          paymentMethod: created.paymentMethod,
          licenseType: created.licenseType,
          transactionId: created.transactionId,
          createdAt: created.createdAt,
          downloadUrl: `/purchases/download/${trackId}`,
          alreadyOwned: false,
        });
      }
      return out;
    });

    return {
      success: true,
      message:
        '¡Pago simulado con éxito! Tu licencia ha sido generada y el beat está disponible para descarga.',
      transactionId,
      paymentMethod,
      licenseType,
      purchasedAt: new Date().toISOString(),
      purchases: completedPurchases,
    };
  }

  /** Lista de compras del usuario autenticado. */
  async getUserPurchases(userId: string) {
    const dbPurchases = await this.prisma.purchase.findMany({
      where: { userId, status: 'COMPLETED' },
      include: {
        track: {
          include: {
            producer: {
              select: {
                id: true,
                name: true,
                artistName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return dbPurchases.map((p) => ({
      id: p.id,
      trackId: p.trackId,
      amount: p.amount,
      status: p.status,
      paymentMethod: p.paymentMethod || 'PSE',
      licenseType: p.licenseType || 'ESTÁNDAR COMERCIAL',
      transactionId: p.transactionId,
      downloadCount: p.downloadCount,
      lastDownloadedAt: p.lastDownloadedAt,
      payerName: p.payerName,
      payerEmail: p.payerEmail,
      paymentProvider: p.paymentProvider,
      createdAt: p.createdAt,
      track: p.track,
      downloadUrl: `/purchases/download/${p.trackId}`,
    }));
  }

  /** Verifica si un usuario ya adquirió un beat específico. */
  async checkPurchaseStatus(userId: string, trackId: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: { userId, trackId, status: 'COMPLETED' },
    });
    if (!purchase) return { purchased: false };
    return {
      purchased: true,
      purchaseId: purchase.id,
      transactionId: purchase.transactionId,
      paymentMethod: purchase.paymentMethod,
      licenseType: purchase.licenseType,
      purchasedAt: purchase.createdAt,
      downloadCount: purchase.downloadCount,
      lastDownloadedAt: purchase.lastDownloadedAt,
      downloadUrl: `/purchases/download/${trackId}`,
    };
  }

  /**
   * Entrega del archivo de audio. Valida permisos (compra, productor o ADMIN),
   * registra la descarga y hace streaming del archivo local o remoto.
   */
  async handleDownload(
    userId: string,
    userRole: string,
    trackId: string,
    res: Response,
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    let track;
    try {
      track = await this.tracksService.findOne(trackId);
    } catch {
      throw new NotFoundException(`El Beat con ID ${trackId} no existe.`);
    }

    const isProducer = track.producerId === userId;
    const isAdmin = userRole === 'ADMIN';
    const purchaseStatus = await this.checkPurchaseStatus(userId, trackId);

    if (!purchaseStatus.purchased && !isProducer && !isAdmin) {
      throw new ForbiddenException(
        'Acceso denegado. Debes simular el pago y adquirir la licencia del Beat antes de poder descargarlo.',
      );
    }

    const rawAudioUrl = track.fullAudioUrl || track.audioUrl;
    if (!rawAudioUrl) {
      throw new NotFoundException(
        'Este beat no tiene un archivo de audio disponible para descarga.',
      );
    }

    // Registro de la descarga (atómico). Si falla, la descarga no se entrega
    // a medias: el error se propaga en vez de ocultarse.
    await this.prisma.$transaction([
      this.prisma.downloadLog.create({
        data: {
          userId,
          trackId,
          purchaseId: purchaseStatus.purchaseId || null,
          ipAddress: meta?.ipAddress
            ? String(meta.ipAddress).slice(0, 64)
            : null,
          userAgent: meta?.userAgent
            ? String(meta.userAgent).slice(0, 300)
            : null,
          fileFormat: 'MP3',
        },
      }),
      ...(purchaseStatus.purchaseId
        ? [
            this.prisma.purchase.update({
              where: { id: purchaseStatus.purchaseId },
              data: {
                downloadCount: { increment: 1 },
                lastDownloadedAt: new Date(),
              },
            }),
          ]
        : []),
      this.prisma.track.update({
        where: { id: trackId },
        data: { downloadsCount: { increment: 1 } },
      }),
    ]);

    const safeTitle = (track.title || 'beat')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    const downloadFilename = `OZIRIS_${safeTitle}_HQ.mp3`;

    // 1. Archivo local en /uploads (solo dentro de la carpeta uploads)
    if (/^(https?:\/\/[^/]+)?\/?uploads\//.test(rawAudioUrl)) {
      const fileName = basename(rawAudioUrl.split('?')[0]);
      const uploadsDir = resolve(process.cwd(), 'uploads');
      const filePath = resolve(join(uploadsDir, fileName));
      if (filePath.startsWith(uploadsDir + sep) && existsSync(filePath)) {
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${downloadFilename}"`,
        );
        res.setHeader(
          'Content-Type',
          fileName.toLowerCase().endsWith('.wav') ? 'audio/wav' : 'audio/mpeg',
        );
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        const stream = createReadStream(filePath);
        stream.on('error', () => res.destroy());
        return stream.pipe(res);
      }
    }

    // 2. URL externa: proxy con protecciones (sin redes internas, con límite
    //    de tiempo y de tamaño).
    if (/^https?:\/\//i.test(rawAudioUrl)) {
      try {
        const url = await assertPublicHost(rawAudioUrl);
        const remoteRes = await fetch(url, {
          redirect: 'error',
          signal: AbortSignal.timeout(REMOTE_TIMEOUT_MS),
        });
        if (!remoteRes.ok || !remoteRes.body) {
          throw new Error(`El audio remoto respondió ${remoteRes.status}`);
        }
        const len = Number(remoteRes.headers.get('content-length') || 0);
        if (len > MAX_REMOTE_BYTES)
          throw new Error('Archivo remoto demasiado grande');

        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${downloadFilename}"`,
        );
        res.setHeader(
          'Content-Type',
          remoteRes.headers.get('content-type') || 'audio/mpeg',
        );
        if (len) res.setHeader('Content-Length', len);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        const nodeStream = Readable.fromWeb(remoteRes.body as any);
        nodeStream.on('error', () => res.destroy());
        return nodeStream.pipe(res);
      } catch (proxyError) {
        this.logger.error(
          `Error al servir el audio remoto del beat ${trackId}: ${(proxyError as Error).message}`,
        );
        throw new NotFoundException(
          'No se pudo obtener el archivo de audio del beat.',
        );
      }
    }

    throw new NotFoundException(
      'No se pudo localizar el archivo físico de audio del beat.',
    );
  }
}

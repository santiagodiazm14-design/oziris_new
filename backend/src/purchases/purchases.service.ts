import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TracksService } from '../tracks/tracks.service';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';
import { Response } from 'express';

export class SimulatedPurchaseDto {
  trackId?: string;
  trackIds?: string[];
  paymentMethod?: string;
  licenseType?: string;
  amount?: number;
}

@Injectable()
export class PurchasesService {
  private inMemoryPurchases: any[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly tracksService: TracksService,
  ) {}

  /**
   * Simula un pago y registra la compra/licencia para el usuario autenticado.
   * Restricción de Rol: Solo disponible para usuarios normales (USER, BUYER, PRODUCER), no ADMIN.
   */
  async simulatePayment(
    userId: string,
    userRole: string,
    dto: SimulatedPurchaseDto,
  ) {
    if (userRole === 'ADMIN') {
      throw new ForbiddenException(
        'El rol de Administrador no puede realizar compras ni descargas directas en la tienda. Esta funcionalidad es exclusiva para usuarios clientes.',
      );
    }

    const trackIdsToProcess: string[] = dto.trackIds && dto.trackIds.length > 0
      ? dto.trackIds
      : dto.trackId
      ? [dto.trackId]
      : [];

    if (trackIdsToProcess.length === 0) {
      throw new BadRequestException('Debes proporcionar al menos un Beat (trackId o trackIds).');
    }

    const paymentMethod = dto.paymentMethod || 'PSE';
    const licenseType = dto.licenseType || 'ESTÁNDAR COMERCIAL';
    const transactionId = `OZ-SIM-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const completedPurchases: any[] = [];

    for (const trackId of trackIdsToProcess) {
      let track = null;
      try {
        track = await this.tracksService.findOne(trackId);
      } catch (err) {
        throw new NotFoundException(`El beat con ID ${trackId} no fue encontrado.`);
      }

      const amount = dto.amount || track.price || 29.99;

      try {
        // Verificar si ya existe compra previa del mismo track por este usuario
        const existing = await this.prisma.purchase.findFirst({
          where: {
            userId,
            trackId,
            status: 'COMPLETED',
          },
        });

        if (existing) {
          completedPurchases.push({
            id: existing.id,
            trackId,
            trackTitle: track.title,
            amount: existing.amount,
            status: existing.status,
            paymentMethod: existing.paymentMethod || paymentMethod,
            licenseType: existing.licenseType || licenseType,
            transactionId: existing.transactionId || transactionId,
            createdAt: existing.createdAt,
            downloadUrl: `/purchases/download/${trackId}`,
            alreadyOwned: true,
          });
          continue;
        }

        // Crear registro en la base de datos PostgreSQL
        const created = await this.prisma.purchase.create({
          data: {
            userId,
            trackId,
            amount,
            status: 'COMPLETED',
            paymentMethod,
            licenseType,
            transactionId,
          },
          include: {
            track: true,
          },
        });

        completedPurchases.push({
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
      } catch (dbError) {
        console.error('Error guardando en PostgreSQL (fallback en memoria):', dbError);
        // Fallback en memoria si falla la BD
        const fallbackPurchase = {
          id: `sim-purch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId,
          trackId,
          trackTitle: track.title,
          amount,
          status: 'COMPLETED',
          paymentMethod,
          licenseType,
          transactionId,
          createdAt: new Date().toISOString(),
          downloadUrl: `/purchases/download/${trackId}`,
          alreadyOwned: false,
        };
        this.inMemoryPurchases.push(fallbackPurchase);
        completedPurchases.push(fallbackPurchase);
      }
    }

    return {
      success: true,
      message: '¡Pago simulado con éxito! Tu licencia ha sido generada y el beat está disponible para descarga.',
      transactionId,
      paymentMethod,
      licenseType,
      purchasedAt: new Date().toISOString(),
      purchases: completedPurchases,
    };
  }

  /**
   * Obtiene la lista de compras del usuario autenticado.
   */
  async getUserPurchases(userId: string) {
    try {
      const dbPurchases = await this.prisma.purchase.findMany({
        where: {
          userId,
          status: 'COMPLETED',
        },
        include: {
          track: {
            include: {
              producer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  artistName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (dbPurchases && dbPurchases.length > 0) {
        return dbPurchases.map((p) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          paymentMethod: p.paymentMethod || 'PSE',
          licenseType: p.licenseType || 'ESTÁNDAR COMERCIAL',
          transactionId: p.transactionId,
          createdAt: p.createdAt,
          track: p.track,
          downloadUrl: `/purchases/download/${p.trackId}`,
        }));
      }
    } catch (err) {
      console.error('Error consultando compras en DB (usando in-memory fallback):', err);
    }

    // Fallback en memoria
    const userMemoryPurchases = this.inMemoryPurchases.filter((p) => p.userId === userId);
    const result = [];
    for (const p of userMemoryPurchases) {
      try {
        const track = await this.tracksService.findOne(p.trackId);
        result.push({
          ...p,
          track,
        });
      } catch {
        result.push(p);
      }
    }
    return result;
  }

  /**
   * Verifica si un usuario ya adquirió un beat específico.
   */
  async checkPurchaseStatus(userId: string, trackId: string) {
    try {
      const purchase = await this.prisma.purchase.findFirst({
        where: {
          userId,
          trackId,
          status: 'COMPLETED',
        },
      });

      if (purchase) {
        return {
          purchased: true,
          purchaseId: purchase.id,
          transactionId: purchase.transactionId,
          paymentMethod: purchase.paymentMethod,
          licenseType: purchase.licenseType,
          purchasedAt: purchase.createdAt,
          downloadUrl: `/purchases/download/${trackId}`,
        };
      }
    } catch (err) {
      // Check in-memory fallback
    }

    const inMem = this.inMemoryPurchases.find(
      (p) => p.userId === userId && p.trackId === trackId && p.status === 'COMPLETED',
    );

    if (inMem) {
      return {
        purchased: true,
        purchaseId: inMem.id,
        transactionId: inMem.transactionId,
        paymentMethod: inMem.paymentMethod,
        licenseType: inMem.licenseType,
        purchasedAt: inMem.createdAt,
        downloadUrl: `/purchases/download/${trackId}`,
      };
    }

    return {
      purchased: false,
    };
  }

  /**
   * Endpoint de entrega y descarga directa del archivo de audio del beat.
   * Valida rol, autenticación y propiedad/licencia de compra previa.
   */
  async handleDownload(
    userId: string,
    userRole: string,
    trackId: string,
    res: Response,
  ) {
    if (userRole === 'ADMIN') {
      throw new ForbiddenException(
        'El rol de Administrador no puede utilizar el flujo de descargas de cliente.',
      );
    }

    const track = await this.tracksService.findOne(trackId);
    if (!track) {
      throw new NotFoundException(`El Beat con ID ${trackId} no existe.`);
    }

    // Verificar si el usuario compró el track o es el productor del mismo
    const isProducer = track.producerId === userId;
    const purchaseStatus = await this.checkPurchaseStatus(userId, trackId);

    if (!purchaseStatus.purchased && !isProducer) {
      throw new ForbiddenException(
        'Acceso denegado. Debes simular el pago y adquirir la licencia del Beat antes de poder descargarlo.',
      );
    }

    const rawAudioUrl = track.fullAudioUrl || track.audioUrl;
    if (!rawAudioUrl) {
      throw new NotFoundException('Este beat no tiene un archivo de audio disponible para descarga.');
    }

    // Limpiar nombre para la descarga
    const safeTitle = (track.title || 'beat')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    const downloadFilename = `OZIRIS_${safeTitle}_HQ.mp3`;

    // Si es un archivo local en uploads
    if (rawAudioUrl.startsWith('/uploads/') || rawAudioUrl.startsWith('uploads/')) {
      const cleanPath = rawAudioUrl.startsWith('/') ? rawAudioUrl.slice(1) : rawAudioUrl;
      const filePath = join(process.cwd(), cleanPath);

      if (existsSync(filePath)) {
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        res.setHeader('Content-Type', 'audio/mpeg');
        const fileStream = createReadStream(filePath);
        return fileStream.pipe(res);
      }
    }

    // Si es una URL externa (e.g. SoundHelix o CDN), redirigir
    return res.redirect(rawAudioUrl);
  }
}

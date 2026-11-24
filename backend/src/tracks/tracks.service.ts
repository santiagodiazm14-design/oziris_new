import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Track } from './dto';
import { rethrowPrisma } from '../common/prisma-errors';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

export type { Track };

@Injectable()
export class TracksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptions: SubscriptionsService,
  ) {}

  async findAll(params?: {
    genre?: string;
    search?: string;
    tag?: string;
    maxPrice?: number;
    category?: string;
    sort?: string;
    producerId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Track[]> {
    const genre = params?.genre;
    const search = params?.search?.trim().slice(0, 100);
    const tag = params?.tag?.trim().slice(0, 50);
    const maxPrice = params?.maxPrice;
    const category = params?.category;
    const sort = params?.sort || 'newest';

    const where: any = {};
    const andConditions: any[] = [];

    if (params?.producerId) {
      andConditions.push({ producerId: params.producerId });
    }

    if (genre && genre !== 'all') {
      andConditions.push({
        genre: { equals: genre, mode: 'insensitive' as const },
      });
    }

    if (tag) {
      andConditions.push({
        tags: { has: tag },
      });
    }

    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      andConditions.push({
        price: { lte: maxPrice },
      });
    }

    if (category) {
      if (category === 'under20') {
        andConditions.push({ price: { lte: 20 } });
      } else if (category === 'free') {
        andConditions.push({ price: { lte: 15 } });
      } else if (category === 'exclusive') {
        andConditions.push({ price: { gte: 35 } });
      } else if (category === 'coro' || category === 'vocals') {
        andConditions.push({
          OR: [
            { tags: { has: 'coro' } },
            { tags: { has: 'vocals' } },
            { tags: { has: 'hook' } },
            { title: { contains: 'coro', mode: 'insensitive' as const } },
            { title: { contains: 'vocals', mode: 'insensitive' as const } },
          ],
        });
      }
    }

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { genre: { contains: search, mode: 'insensitive' as const } },
          { key: { contains: search, mode: 'insensitive' as const } },
          {
            producer: {
              name: { contains: search, mode: 'insensitive' as const },
            },
          },
          {
            producer: {
              artistName: { contains: search, mode: 'insensitive' as const },
            },
          },
          { tags: { has: search } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'bpm_asc') {
      orderBy = { bpm: 'asc' };
    } else if (sort === 'bpm_desc') {
      orderBy = { bpm: 'desc' };
    }

    const dbTracks = await this.prisma.track.findMany({
      where,
      include: { producer: true },
      orderBy,
      take: Math.min(Math.max(Math.floor(params?.limit ?? 100), 1), 200),
      skip: Math.max(Math.floor(params?.offset ?? 0), 0),
    });
    return dbTracks.map((t) => this.formatTrack(t));
  }

  async findOne(id: string): Promise<Track> {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: { producer: true },
    });
    if (!track) {
      throw new NotFoundException(`Beat con ID ${id} no encontrado.`);
    }
    return this.formatTrack(track);
  }

  async create(data: Partial<Track> & { producerId: string }): Promise<Track> {
    const producer = await this.prisma.user.findUnique({
      where: { id: data.producerId },
      include: { artist: true },
    });
    if (!producer || !producer.isActive) {
      throw new ForbiddenException('Cuenta no válida para subir beats.');
    }
    if (producer.role === 'USER' && !producer.artist) {
      throw new ForbiddenException(
        'Acceso denegado: Solo los usuarios con perfil de artista o productores pueden subir beats.',
      );
    }

    // Limite de beats segun el plan (Free 10, Plus 100, Premium ilimitado)
    await this.subscriptions.assertCanUpload(producer.id, producer.role);

    const created = await this.prisma.track.create({
      data: {
        title: data.title || 'Untitled Beat',
        description: data.description || '',
        price: Number(data.price) || 29.99,
        genre: data.genre || 'Trap',
        bpm: Number(data.bpm) || 120,
        key: data.key || 'C Minor',
        tags: data.tags || [],
        audioUrl: data.audioUrl || '',
        fullAudioUrl: data.fullAudioUrl || data.audioUrl || '',
        coverUrl: data.coverUrl || producer.avatarUrl || '',
        producerId: producer.id,
      },
      include: { producer: true },
    });
    return this.formatTrack(created);
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      price?: number;
      genre?: string;
      bpm?: number;
      key?: string;
      tags?: string[];
    },
  ): Promise<Track> {
    try {
      const updated = await this.prisma.track.update({
        where: { id },
        data: {
          title: data.title?.trim() || undefined,
          description: data.description,
          price: data.price,
          genre: data.genre,
          bpm: data.bpm,
          key: data.key,
          tags: data.tags,
        },
        include: { producer: true },
      });
      return this.formatTrack(updated);
    } catch (e) {
      rethrowPrisma(e, `Beat con ID ${id} no encontrado.`);
    }
  }

  async registerPlay(id: string): Promise<{ playsCount: number }> {
    try {
      const t = await this.prisma.track.update({
        where: { id },
        data: { playsCount: { increment: 1 } },
        select: { playsCount: true },
      });
      return { playsCount: t.playsCount };
    } catch (e) {
      rethrowPrisma(e, `Beat con ID ${id} no encontrado.`);
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    try {
      await this.prisma.track.delete({ where: { id } });
    } catch (e) {
      rethrowPrisma(e, `Beat con ID ${id} no encontrado.`);
    }
    return { success: true };
  }

  private formatTrack(t: any): Track {
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      price: t.price,
      genre: t.genre,
      bpm: t.bpm,
      key: t.key,
      tags: t.tags || [],
      audioUrl: t.audioUrl,
      fullAudioUrl: t.fullAudioUrl || t.audioUrl,
      coverUrl: t.coverUrl || t.producer?.avatarUrl || null,
      playsCount: t.playsCount ?? 0,
      downloadsCount: t.downloadsCount ?? 0,
      producerId: t.producerId,
      producer: t.producer
        ? {
            id: t.producer.id,
            name: t.producer.name,
            avatarUrl: t.producer.avatarUrl || null,
            artistName: t.producer.artistName || null,
          }
        : undefined,
      createdAt:
        t.createdAt instanceof Date
          ? t.createdAt.toISOString()
          : t.createdAt || new Date().toISOString(),
      updatedAt:
        t.updatedAt instanceof Date
          ? t.updatedAt.toISOString()
          : t.updatedAt || new Date().toISOString(),
    };
  }
}

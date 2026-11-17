import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserResponse, ArtistResponse } from './dto';
import { rethrowPrisma } from '../common/prisma-errors';

export type { UserResponse, ArtistResponse };

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string): Promise<UserResponse[]> {
    const q = search?.trim().slice(0, 100);
    const dbUsers = await this.prisma.user.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { artistName: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { artist: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return dbUsers.map((u) => this.sanitizeUser(u));
  }

  async findById(id: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { artist: true },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return this.sanitizeUser(user);
  }

  /** Busca por correo (normalizado a minúsculas). Incluye el hash de contraseña. */
  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    artisticName?: string;
    genre?: string;
  }) {
    const email = data.email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const assignedRole =
      data.role === 'ADMIN'
        ? 'ADMIN'
        : data.role === 'PRODUCER'
          ? 'PRODUCER'
          : 'USER';
    const isArtist = assignedRole === 'PRODUCER';
    const name = data.name.trim();
    const finalArtistName = isArtist ? data.artisticName?.trim() || name : null;

    try {
      const dbUser = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          artistName: finalArtistName,
          role: assignedRole as any,
          artist: isArtist
            ? {
                create: {
                  artisticName: finalArtistName || name,
                  genre: data.genre?.trim() || null,
                  verified: false,
                },
              }
            : undefined,
        },
        include: { artist: true },
      });
      return this.sanitizeUser(dbUser);
    } catch (e) {
      // La restricción UNIQUE de la BD es la fuente de verdad (sin carreras)
      if ((e as { code?: string })?.code === 'P2002') {
        throw new ConflictException(
          'El correo electrónico ya se encuentra registrado.',
        );
      }
      throw e;
    }
  }

  async updateProfile(
    userId: string,
    data: Partial<{
      name: string;
      lastName: string;
      artistName: string;
      location: string;
      bio: string;
      avatarUrl: string;
      genre: string;
      bannerUrl: string;
      spotifyUrl: string;
      instagramUrl: string;
      youtubeUrl: string;
    }>,
  ): Promise<UserResponse> {
    try {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          lastName: data.lastName,
          artistName: data.artistName,
          location: data.location,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
        },
        include: { artist: true },
      });
      const hasArtistData = [
        data.artistName,
        data.bio,
        data.genre,
        data.bannerUrl,
        data.spotifyUrl,
        data.instagramUrl,
        data.youtubeUrl,
      ].some((v) => v !== undefined);
      if (updated.role === 'PRODUCER' && hasArtistData) {
        const artistFields = {
          artisticName: data.artistName?.trim() || undefined,
          bio: data.bio,
          genre: data.genre,
          bannerUrl: data.bannerUrl,
          spotifyUrl: data.spotifyUrl,
          instagramUrl: data.instagramUrl,
          youtubeUrl: data.youtubeUrl,
        };
        const artist = await this.prisma.artist.upsert({
          where: { userId },
          update: artistFields,
          create: {
            ...artistFields,
            artisticName:
              artistFields.artisticName || updated.artistName || updated.name,
            userId,
          },
        });
        return this.sanitizeUser({ ...updated, artist });
      }
      return this.sanitizeUser(updated);
    } catch (e) {
      rethrowPrisma(e, 'Usuario no encontrado.');
    }
  }

  async updateUser(
    id: string,
    data: Partial<{
      name: string;
      lastName: string;
      artistName: string;
      location: string;
      role: string;
      isActive: boolean;
      bio: string;
      avatarUrl: string;
      verified: boolean;
    }>,
  ): Promise<UserResponse> {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          lastName: data.lastName,
          artistName: data.artistName,
          location: data.location,
          role: data.role as any,
          isActive: data.isActive,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
        },
        include: { artist: true },
      });
      // Un PRODUCER siempre debe tener su ficha de artista.
      if (updated.role === 'PRODUCER') {
        const artist = await this.prisma.artist.upsert({
          where: { userId: id },
          update:
            data.verified !== undefined ? { verified: data.verified } : {},
          create: {
            artisticName: updated.artistName || updated.name,
            verified: data.verified ?? false,
            userId: id,
          },
        });
        return this.sanitizeUser({ ...updated, artist });
      }
      return this.sanitizeUser(updated);
    } catch (e) {
      rethrowPrisma(e, `Usuario con ID ${id} no encontrado.`);
    }
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e) {
      rethrowPrisma(e, 'Usuario no encontrado.');
    }
    return { success: true, message: 'Usuario eliminado correctamente.' };
  }

  // FAVORITES
  async toggleFavorite(userId: string, trackId: string) {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
      select: { id: true },
    });
    if (!track) throw new NotFoundException('Beat no encontrado.');

    const where = { userId_trackId: { userId, trackId } };
    const existing = await this.prisma.favorite.findUnique({ where });
    if (existing) {
      await this.prisma.favorite.deleteMany({ where: { userId, trackId } });
      return { isFavorite: false, message: 'Removido de favoritos.' };
    }
    try {
      await this.prisma.favorite.create({ data: { userId, trackId } });
    } catch (e) {
      // Doble clic simultáneo: ya existe, el resultado es el mismo
      if ((e as { code?: string })?.code !== 'P2002') throw e;
    }
    return { isFavorite: true, message: 'Guardado en favoritos.' };
  }

  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
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
    });
    return favorites.map((f) => f.track);
  }

  async getAdminStats() {
    const [totalUsers, activeUsers, totalProducers, totalTracks, sales] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { role: 'PRODUCER' as any } }),
        this.prisma.track.count(),
        this.prisma.purchase.aggregate({
          where: { status: 'COMPLETED' },
          _count: { _all: true },
          _sum: { amount: true },
        }),
      ]);
    return {
      totalUsers,
      activeUsers,
      totalProducers,
      totalTracks,
      totalSales: sales._count._all,
      totalRevenue: Math.round((sales._sum.amount ?? 0) * 100) / 100,
    };
  }

  /** Datos públicos de un artista (sin correo ni datos privados). */
  async getPublicArtist(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { artist: true },
    });
    if (!user || user.role !== 'PRODUCER' || user.isActive === false) {
      throw new NotFoundException('Artista no encontrado.');
    }
    const agg = await this.prisma.track.aggregate({
      where: { producerId: id },
      _count: { _all: true },
      _sum: { playsCount: true },
    });
    const tracksCount = agg._count._all;
    const totalPlays = agg._sum.playsCount ?? 0;

    const artist = user.artist;
    return {
      id: user.id,
      name: user.name,
      artistName: artist?.artisticName || user.artistName || user.name,
      avatarUrl: user.avatarUrl || null,
      location: user.location || null,
      bio: artist?.bio || user.bio || null,
      genre: artist?.genre || null,
      bannerUrl: artist?.bannerUrl || null,
      spotifyUrl: artist?.spotifyUrl || null,
      instagramUrl: artist?.instagramUrl || null,
      youtubeUrl: artist?.youtubeUrl || null,
      verified: artist?.verified ?? false,
      tracksCount,
      totalPlays,
      memberSince:
        user.createdAt instanceof Date
          ? user.createdAt.toISOString()
          : user.createdAt || null,
    };
  }

  private sanitizeUser(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName || null,
      artistName:
        user.artistName || (user.artist ? user.artist.artisticName : null),
      location: user.location || null,
      avatarUrl: user.avatarUrl || null,
      bio: user.bio || (user.artist ? user.artist.bio : null),
      role: user.role,
      isActive: user.isActive ?? true,
      artist: user.artist
        ? {
            id: user.artist.id,
            artisticName: user.artist.artisticName,
            bio: user.artist.bio || null,
            genre: user.artist.genre || null,
            bannerUrl: user.artist.bannerUrl || null,
            spotifyUrl: user.artist.spotifyUrl || null,
            instagramUrl: user.artist.instagramUrl || null,
            youtubeUrl: user.artist.youtubeUrl || null,
            verified: user.artist.verified ?? false,
            createdAt:
              user.artist.createdAt instanceof Date
                ? user.artist.createdAt.toISOString()
                : user.artist.createdAt || new Date().toISOString(),
          }
        : null,
      createdAt:
        user.createdAt instanceof Date
          ? user.createdAt.toISOString()
          : user.createdAt || new Date().toISOString(),
      updatedAt:
        user.updatedAt instanceof Date
          ? user.updatedAt.toISOString()
          : user.updatedAt || new Date().toISOString(),
    };
  }
}

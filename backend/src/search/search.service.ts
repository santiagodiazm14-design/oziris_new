import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ArtistSuggestion {
  id: string;
  name: string;
  artistName: string;
  avatarUrl: string | null;
  genre: string | null;
  verified: boolean;
  tracksCount: number;
}

export interface BeatSuggestion {
  id: string;
  title: string;
  genre: string | null;
  bpm: number | null;
  price: number;
  coverUrl: string | null;
  playsCount: number;
  producer: { id: string; name: string; artistName: string };
}

export interface SearchResults {
  query: string;
  artists: ArtistSuggestion[];
  beats: BeatSuggestion[];
}

const MAX_QUERY = 60;
const MAX_LIMIT = 10;
const DEFAULT_LIMIT = 5;
// Se traen mas filas de las que se devuelven para poder ordenar por relevancia
const CANDIDATES = 30;

const ci = (value: string) => ({
  contains: value,
  mode: 'insensitive' as const,
});

const norm = (s: string | null | undefined) => (s ?? '').toLowerCase();

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /** Normaliza la consulta y el limite que llegan por query string. */
  static clean(q?: string, limit?: string | number) {
    const query = (q ?? '').trim().slice(0, MAX_QUERY);
    const parsed = Math.floor(Number(limit));
    const size = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LIMIT;
    return { query, limit: Math.min(size, MAX_LIMIT) };
  }

  /**
   * Sugerencias mientras se escribe. Artistas = usuarios PRODUCER activos
   * (mismo criterio que el perfil publico). Primero los que EMPIEZAN con lo
   * escrito y luego los que solo lo contienen; a igual relevancia, los mas
   * populares.
   */
  async suggest(q?: string, limit?: string | number): Promise<SearchResults> {
    const { query, limit: size } = SearchService.clean(q, limit);
    if (!query) return { query, artists: [], beats: [] };

    const [artists, beats] = await Promise.all([
      this.findArtists(query, size),
      this.findBeats(query, size),
    ]);
    return { query, artists, beats };
  }

  private async findArtists(
    query: string,
    size: number,
  ): Promise<ArtistSuggestion[]> {
    const rows = await this.prisma.user.findMany({
      where: {
        role: 'PRODUCER',
        isActive: true,
        OR: [
          { name: ci(query) },
          { lastName: ci(query) },
          { artistName: ci(query) },
          { artist: { is: { artisticName: ci(query) } } },
          { artist: { is: { genre: ci(query) } } },
        ],
      },
      include: { artist: true, _count: { select: { tracks: true } } },
      take: CANDIDATES,
    });

    const lower = query.toLowerCase();
    return rows
      .map((u) => {
        const display = u.artist?.artisticName || u.artistName || u.name;
        const starts =
          norm(display).startsWith(lower) ||
          norm(u.name).startsWith(lower) ||
          norm(u.artistName).startsWith(lower);
        return {
          starts,
          item: {
            id: u.id,
            name: u.name,
            artistName: display,
            avatarUrl: u.avatarUrl || null,
            genre: u.artist?.genre || null,
            verified: u.artist?.verified ?? false,
            tracksCount: u._count.tracks,
          } satisfies ArtistSuggestion,
        };
      })
      .sort(
        (a, b) =>
          Number(b.starts) - Number(a.starts) ||
          b.item.tracksCount - a.item.tracksCount ||
          a.item.artistName.localeCompare(b.item.artistName),
      )
      .slice(0, size)
      .map((r) => r.item);
  }

  private async findBeats(
    query: string,
    size: number,
  ): Promise<BeatSuggestion[]> {
    const rows = await this.prisma.track.findMany({
      where: {
        OR: [
          { title: ci(query) },
          { genre: ci(query) },
          { tags: { has: query } },
          { tags: { has: query.toLowerCase() } },
          { producer: { is: { name: ci(query) } } },
          { producer: { is: { artistName: ci(query) } } },
          { producer: { is: { artist: { is: { artisticName: ci(query) } } } } },
        ],
      },
      include: { producer: { include: { artist: true } } },
      orderBy: { playsCount: 'desc' },
      take: CANDIDATES,
    });

    const lower = query.toLowerCase();
    return rows
      .map((t) => ({
        starts: norm(t.title).startsWith(lower),
        item: {
          id: t.id,
          title: t.title,
          genre: t.genre || null,
          bpm: t.bpm ?? null,
          price: t.price,
          coverUrl: t.coverUrl || null,
          playsCount: t.playsCount,
          producer: {
            id: t.producer.id,
            name: t.producer.name,
            artistName:
              t.producer.artist?.artisticName ||
              t.producer.artistName ||
              t.producer.name,
          },
        } satisfies BeatSuggestion,
      }))
      .sort(
        (a, b) =>
          Number(b.starts) - Number(a.starts) ||
          b.item.playsCount - a.item.playsCount,
      )
      .slice(0, size)
      .map((r) => r.item);
  }
}

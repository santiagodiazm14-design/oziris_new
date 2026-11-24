import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';

const user = (over: any = {}) => ({
  id: 'u1',
  name: 'Carlos',
  lastName: null,
  artistName: null,
  avatarUrl: null,
  artist: null,
  _count: { tracks: 0 },
  ...over,
});

const track = (over: any = {}) => ({
  id: 't1',
  title: 'Dark Night',
  genre: 'Trap',
  bpm: 140,
  price: 25000,
  coverUrl: null,
  playsCount: 0,
  producer: { id: 'u1', name: 'Carlos', artistName: null, artist: null },
  ...over,
});

describe('SearchService', () => {
  let service: SearchService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findMany: jest.fn().mockResolvedValue([]) },
      track: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(SearchService);
  });

  describe('clean', () => {
    it('recorta espacios y limita el largo', () => {
      expect(SearchService.clean('  da  ').query).toBe('da');
      expect(SearchService.clean('x'.repeat(200)).query).toHaveLength(60);
    });
    it('usa 5 por defecto y nunca más de 10', () => {
      expect(SearchService.clean('a').limit).toBe(5);
      expect(SearchService.clean('a', '999').limit).toBe(10);
      expect(SearchService.clean('a', 'abc').limit).toBe(5);
      expect(SearchService.clean('a', '-3').limit).toBe(5);
      expect(SearchService.clean('a', '2').limit).toBe(2);
    });
  });

  describe('suggest', () => {
    it('sin texto no consulta la base de datos', async () => {
      const res = await service.suggest('   ');
      expect(res).toEqual({ query: '', artists: [], beats: [] });
      expect(prisma.user.findMany).not.toHaveBeenCalled();
      expect(prisma.track.findMany).not.toHaveBeenCalled();
    });

    it('con una sola letra ya busca artistas y beats', async () => {
      await service.suggest('d');
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.track.findMany).toHaveBeenCalledTimes(1);
    });

    it('solo busca artistas productores activos', async () => {
      await service.suggest('car');
      const where = prisma.user.findMany.mock.calls[0][0].where;
      expect(where.role).toBe('PRODUCER');
      expect(where.isActive).toBe(true);
    });

    it('los que empiezan por lo escrito van antes que los que solo lo contienen', async () => {
      prisma.user.findMany.mockResolvedValue([
        user({ id: 'a', name: 'Mario Dario', _count: { tracks: 50 } }),
        user({ id: 'b', name: 'Darío Gómez', _count: { tracks: 1 } }),
      ]);
      const res = await service.suggest('dar');
      expect(res.artists.map((a) => a.id)).toEqual(['b', 'a']);
    });

    it('a igual relevancia gana el artista con más beats', async () => {
      prisma.user.findMany.mockResolvedValue([
        user({ id: 'a', name: 'Dan', _count: { tracks: 2 } }),
        user({ id: 'b', name: 'Dana', _count: { tracks: 9 } }),
      ]);
      const res = await service.suggest('da');
      expect(res.artists.map((a) => a.id)).toEqual(['b', 'a']);
    });

    it('para beats: empieza-por primero y luego más reproducidos', async () => {
      prisma.track.findMany.mockResolvedValue([
        track({ id: 'x', title: 'Midnight Dark', playsCount: 900 }),
        track({ id: 'y', title: 'Dark Night', playsCount: 5 }),
        track({ id: 'z', title: 'Dark Side', playsCount: 50 }),
      ]);
      const res = await service.suggest('dark');
      expect(res.beats.map((b) => b.id)).toEqual(['z', 'y', 'x']);
    });

    it('respeta el límite pedido', async () => {
      prisma.track.findMany.mockResolvedValue(
        Array.from({ length: 8 }, (_, i) =>
          track({ id: `t${i}`, title: `Dark ${i}` }),
        ),
      );
      const res = await service.suggest('dark', 3);
      expect(res.beats).toHaveLength(3);
    });

    it('usa el nombre artístico y no expone el correo', async () => {
      prisma.user.findMany.mockResolvedValue([
        user({
          id: 'a',
          name: 'Carlos',
          artistName: 'Viejo',
          email: 'secreto@x.com',
          artist: {
            artisticName: 'DJ Carlitos',
            genre: 'Trap',
            verified: true,
          },
        }),
      ]);
      const [a] = (await service.suggest('car')).artists;
      expect(a.artistName).toBe('DJ Carlitos');
      expect(a.genre).toBe('Trap');
      expect(a.verified).toBe(true);
      expect(JSON.stringify(a)).not.toContain('secreto');
    });
  });
});

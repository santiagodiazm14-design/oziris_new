"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TracksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const INITIAL_TRACKS = [
    {
        id: 'track-1',
        title: 'Dark Vibes Trap Beat',
        description: 'Heavy 808s and dark synth melodies.',
        price: 29.99,
        genre: 'Trap',
        bpm: 140,
        key: 'C Minor',
        tags: ['Trap', 'Dark', '808'],
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop',
        producerId: 'prod-1',
        producer: {
            id: 'prod-1',
            name: 'Oziris Producer',
            email: 'producer@oziris.com',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'track-2',
        title: 'Summer Reggaeton Hit',
        description: 'Bouncy dembow rhythm with smooth guitars.',
        price: 34.99,
        genre: 'Reggaeton',
        bpm: 96,
        key: 'A Minor',
        tags: ['Reggaeton', 'Latino', 'Verano'],
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop',
        producerId: 'prod-1',
        producer: {
            id: 'prod-1',
            name: 'Oziris Producer',
            email: 'producer@oziris.com',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'track-3',
        title: 'Midnight R&B Soul',
        description: 'Lush rhodes and smooth bassline.',
        price: 39.99,
        genre: 'R&B',
        bpm: 85,
        key: 'F Major',
        tags: ['R&B', 'Soul', 'Smooth'],
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop',
        producerId: 'prod-1',
        producer: {
            id: 'prod-1',
            name: 'Oziris Producer',
            email: 'producer@oziris.com',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'track-4',
        title: 'Classic Boom Bap',
        description: '90s underground hip-hop style with vinyl crackle.',
        price: 24.99,
        genre: 'Boom Bap',
        bpm: 90,
        key: 'G Minor',
        tags: ['Boom Bap', '90s', 'Hip Hop'],
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop',
        producerId: 'prod-1',
        producer: {
            id: 'prod-1',
            name: 'Oziris Producer',
            email: 'producer@oziris.com',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];
let TracksService = class TracksService {
    prisma;
    inMemoryTracks = [...INITIAL_TRACKS];
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(genre) {
        try {
            const where = genre ? { genre: { equals: genre, mode: 'insensitive' } } : {};
            const dbTracks = await this.prisma.track.findMany({
                where,
                include: { producer: true },
                orderBy: { createdAt: 'desc' },
            });
            if (dbTracks && dbTracks.length > 0) {
                return dbTracks.map((t) => this.formatTrack(t));
            }
        }
        catch (e) {
        }
        if (genre) {
            return this.inMemoryTracks.filter((t) => t.genre?.toLowerCase() === genre.toLowerCase());
        }
        return this.inMemoryTracks;
    }
    async findOne(id) {
        try {
            const track = await this.prisma.track.findUnique({
                where: { id },
                include: { producer: true },
            });
            if (track)
                return this.formatTrack(track);
        }
        catch (e) {
        }
        const track = this.inMemoryTracks.find((t) => t.id === id);
        if (!track) {
            throw new common_1.NotFoundException(`Beat con ID ${id} no encontrado.`);
        }
        return track;
    }
    async create(data) {
        const newTrack = {
            id: `track-${Date.now()}`,
            title: data.title || 'Untitled Beat',
            description: data.description || '',
            price: Number(data.price) || 29.99,
            genre: data.genre || 'Trap',
            bpm: Number(data.bpm) || 120,
            key: data.key || 'C Minor',
            tags: data.tags || [],
            audioUrl: data.audioUrl || '',
            fullAudioUrl: data.fullAudioUrl || data.audioUrl || '',
            coverUrl: data.coverUrl || '',
            producerId: data.producerId || 'prod-1',
            producer: {
                id: 'prod-1',
                name: 'Oziris Producer',
                email: 'producer@oziris.com',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        try {
            const created = await this.prisma.track.create({
                data: {
                    id: newTrack.id,
                    title: newTrack.title,
                    description: newTrack.description,
                    price: newTrack.price,
                    genre: newTrack.genre,
                    audioUrl: newTrack.audioUrl,
                    fullAudioUrl: newTrack.fullAudioUrl,
                    coverUrl: newTrack.coverUrl,
                    producerId: 'prod-1',
                },
                include: { producer: true },
            });
            if (created)
                return this.formatTrack(created);
        }
        catch (e) {
        }
        this.inMemoryTracks.unshift(newTrack);
        return newTrack;
    }
    async remove(id) {
        try {
            await this.prisma.track.delete({ where: { id } });
        }
        catch (e) {
        }
        this.inMemoryTracks = this.inMemoryTracks.filter((t) => t.id !== id);
        return { success: true };
    }
    formatTrack(t) {
        return {
            id: t.id,
            title: t.title,
            description: t.description,
            price: t.price,
            genre: t.genre,
            audioUrl: t.audioUrl,
            fullAudioUrl: t.fullAudioUrl || t.audioUrl,
            coverUrl: t.coverUrl,
            producerId: t.producerId,
            producer: t.producer
                ? { id: t.producer.id, name: t.producer.name, email: t.producer.email }
                : { id: t.producerId, name: 'Oziris Producer', email: 'producer@oziris.com' },
            createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt || new Date().toISOString(),
            updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt || new Date().toISOString(),
        };
    }
};
exports.TracksService = TracksService;
exports.TracksService = TracksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TracksService);
//# sourceMappingURL=tracks.service.js.map
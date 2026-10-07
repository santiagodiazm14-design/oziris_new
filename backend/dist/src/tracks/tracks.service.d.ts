import { PrismaService } from '../prisma/prisma.service';
export interface Track {
    id: string;
    title: string;
    description?: string;
    price: number;
    genre?: string;
    bpm?: number;
    key?: string;
    tags?: string[];
    audioUrl: string;
    fullAudioUrl?: string;
    coverUrl?: string;
    producerId: string;
    producer?: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string | null;
        artistName?: string | null;
    };
    createdAt: string;
    updatedAt: string;
}
export declare class TracksService {
    private readonly prisma;
    private inMemoryTracks;
    constructor(prisma: PrismaService);
    findAll(params?: {
        genre?: string;
        search?: string;
        tag?: string;
        maxPrice?: number;
        category?: string;
        sort?: string;
    }): Promise<Track[]>;
    findOne(id: string): Promise<Track>;
    create(data: Partial<Track> & {
        producerId?: string;
    }): Promise<Track>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    private formatTrack;
}

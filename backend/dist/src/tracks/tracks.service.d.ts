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
    };
    createdAt: string;
    updatedAt: string;
}
export declare class TracksService {
    private readonly prisma;
    private inMemoryTracks;
    constructor(prisma: PrismaService);
    findAll(genre?: string): Promise<Track[]>;
    findOne(id: string): Promise<Track>;
    create(data: Partial<Track>): Promise<Track>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    private formatTrack;
}

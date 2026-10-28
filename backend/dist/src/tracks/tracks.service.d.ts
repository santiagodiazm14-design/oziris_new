import { PrismaService } from '../prisma/prisma.service';
import { Track } from './dto';
export type { Track };
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

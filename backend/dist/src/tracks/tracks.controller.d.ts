import { TracksService, Track } from './tracks.service';
export declare class TracksController {
    private readonly tracksService;
    constructor(tracksService: TracksService);
    findAll(genre?: string): Promise<Track[]>;
    findOne(id: string): Promise<Track>;
    create(body: any, files: {
        audio?: any[];
        audioFile?: any[];
        cover?: any[];
        coverImage?: any[];
    }): Promise<Track>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

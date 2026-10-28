import { TracksService } from './tracks.service';
import { Track } from './dto';
export declare class TracksController {
    private readonly tracksService;
    constructor(tracksService: TracksService);
    findAll(genre?: string, search?: string, tag?: string, maxPrice?: string, category?: string, sort?: string): Promise<Track[]>;
    findOne(id: string): Promise<Track>;
    create(req: any, body: any, files: {
        audio?: any[];
        audioFile?: any[];
        cover?: any[];
        coverImage?: any[];
    }): Promise<Track>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

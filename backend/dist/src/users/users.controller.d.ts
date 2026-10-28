import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updateProfile(req: any, body: UpdateProfileDto): Promise<import("./users.service").UserResponse>;
    uploadAvatar(req: any, file: any): Promise<import("./users.service").UserResponse>;
    getFavorites(req: any): Promise<string[] | ({
        producer: {
            id: string;
            email: string;
            password: string;
            name: string;
            lastName: string | null;
            artistName: string | null;
            location: string | null;
            avatarUrl: string | null;
            bio: string | null;
            role: import("@prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            resetPasswordCode: string | null;
            resetPasswordExpires: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        title: string;
        coverUrl: string | null;
        audioUrl: string;
        fullAudioUrl: string | null;
        wavUrl: string | null;
        stemsUrl: string | null;
        genre: string | null;
        bpm: number | null;
        key: string | null;
        tags: string[];
        playsCount: number;
        downloadsCount: number;
        isSold: boolean;
        producerId: string;
    })[]>;
    toggleFavorite(req: any, trackId: string): Promise<{
        isFavorite: boolean;
        message: string;
    }>;
    getAdminStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        totalProducers: number;
        totalTracks: number;
        totalSales: number;
        totalRevenue: number;
    }>;
    findAll(search?: string): Promise<import("./users.service").UserResponse[]>;
    findOne(id: string): Promise<import("./users.service").UserResponse>;
    create(body: CreateUserDto): Promise<import("./users.service").UserResponse>;
    update(id: string, body: UpdateUserDto): Promise<import("./users.service").UserResponse>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updateProfile(req: any, body: Partial<{
        name: string;
        lastName: string;
        artistName: string;
        location: string;
        bio: string;
        avatarUrl: string;
    }>): Promise<import("./users.service").UserResponse>;
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
        title: string;
        description: string | null;
        price: number;
        coverUrl: string | null;
        audioUrl: string;
        fullAudioUrl: string | null;
        genre: string | null;
        bpm: number | null;
        key: string | null;
        tags: string[];
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
    create(body: {
        name: string;
        email: string;
        password: string;
        role?: string;
    }): Promise<import("./users.service").UserResponse>;
    update(id: string, body: Partial<{
        name: string;
        lastName: string;
        artistName: string;
        location: string;
        role: string;
        isActive: boolean;
        bio: string;
        avatarUrl: string;
    }>): Promise<import("./users.service").UserResponse>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

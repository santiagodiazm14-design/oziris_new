import { PrismaService } from '../prisma/prisma.service';
export interface UserResponse {
    id: string;
    email: string;
    name: string;
    lastName?: string | null;
    artistName?: string | null;
    location?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    resetPasswordCode?: string | null;
    resetPasswordExpires?: string | Date | null;
}
export declare class UsersService {
    private prisma;
    private inMemoryUsers;
    private inMemoryFavorites;
    constructor(prisma: PrismaService);
    findAll(search?: string): Promise<UserResponse[]>;
    findById(id: string): Promise<UserResponse>;
    findByEmailWithPassword(email: string): Promise<{
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
    } | (UserResponse & {
        password: string;
    }) | undefined>;
    createUser(data: {
        name: string;
        email: string;
        password: string;
        role?: string;
    }): Promise<UserResponse>;
    updateProfile(userId: string, data: Partial<{
        name: string;
        lastName: string;
        artistName: string;
        location: string;
        bio: string;
        avatarUrl: string;
    }>): Promise<UserResponse>;
    updateUser(id: string, data: Partial<{
        name: string;
        lastName: string;
        artistName: string;
        location: string;
        role: string;
        isActive: boolean;
        bio: string;
        avatarUrl: string;
    }>): Promise<UserResponse>;
    deleteUser(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleFavorite(userId: string, trackId: string): Promise<{
        isFavorite: boolean;
        message: string;
    }>;
    getUserFavorites(userId: string): Promise<string[] | ({
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
    getAdminStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        totalProducers: number;
        totalTracks: number;
        totalSales: number;
        totalRevenue: number;
    }>;
    private sanitizeUser;
}

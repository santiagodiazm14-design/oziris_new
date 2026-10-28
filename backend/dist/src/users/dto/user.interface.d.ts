export interface ArtistResponse {
    id: string;
    artisticName: string;
    bio?: string | null;
    genre?: string | null;
    bannerUrl?: string | null;
    spotifyUrl?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    verified: boolean;
    createdAt: string;
}
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
    artist?: ArtistResponse | null;
}

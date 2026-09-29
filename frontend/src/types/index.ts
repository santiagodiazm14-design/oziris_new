export interface User {
  id: string;
  name: string;
  lastName?: string | null;
  artistName?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  email: string;
  role: 'ADMIN' | 'USER' | 'PRODUCER' | 'BUYER' | string;
  bio?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProducers: number;
  totalTracks: number;
  totalSales: number;
  totalRevenue: number;
}

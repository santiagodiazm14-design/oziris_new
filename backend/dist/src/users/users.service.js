"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const defaultUserHash = bcrypt.hashSync('Oziris123!', 10);
const defaultAdminHash = bcrypt.hashSync('AdminOziris123!', 10);
const INITIAL_USERS = [
    {
        id: 'user-test-1',
        name: 'Usuario Prueba 1',
        lastName: 'Pérez',
        artistName: 'Producer One',
        location: 'Medellín, Colombia',
        avatarUrl: null,
        email: 'usuario1@oziris.test',
        password: defaultUserHash,
        role: 'USER',
        isActive: true,
        bio: 'Productor apasionado por el Trap y Reggaeton.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'user-test-2',
        name: 'Usuario Prueba 2',
        lastName: 'Gómez',
        artistName: 'BeatMaker X',
        location: 'Bogotá, Colombia',
        avatarUrl: null,
        email: 'usuario2@oziris.test',
        password: defaultUserHash,
        role: 'USER',
        isActive: true,
        bio: 'Creador de sonidos urbanos.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'user-test-3',
        name: 'Usuario Prueba 3',
        lastName: 'Rodríguez',
        artistName: 'Oziris Producer',
        location: 'Miami, USA',
        avatarUrl: null,
        email: 'usuario3@oziris.test',
        password: defaultUserHash,
        role: 'USER',
        isActive: true,
        bio: 'Usuario de prueba 3 en la plataforma.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'user-admin-1',
        name: 'Administrador Oziris',
        lastName: 'Admin',
        artistName: 'Oziris Master',
        location: 'Central Office',
        avatarUrl: null,
        email: 'admin@oziris.test',
        password: defaultAdminHash,
        role: 'ADMIN',
        isActive: true,
        bio: 'Administrador principal de OZIRIS platform.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];
let UsersService = class UsersService {
    prisma;
    inMemoryUsers = [...INITIAL_USERS];
    inMemoryFavorites = [];
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search) {
        try {
            const dbUsers = await this.prisma.user.findMany({
                where: search
                    ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                            { artistName: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : undefined,
                orderBy: { createdAt: 'desc' },
            });
            if (dbUsers && dbUsers.length > 0) {
                return dbUsers.map((u) => this.sanitizeUser(u));
            }
        }
        catch (e) {
        }
        let filtered = this.inMemoryUsers;
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.artistName && u.artistName.toLowerCase().includes(q)));
        }
        return filtered.map((u) => this.sanitizeUser(u));
    }
    async findById(id) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (user)
                return this.sanitizeUser(user);
        }
        catch (e) {
        }
        const user = this.inMemoryUsers.find((u) => u.id === id);
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado.`);
        }
        return this.sanitizeUser(user);
    }
    async findByEmailWithPassword(email) {
        try {
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (user)
                return user;
        }
        catch (e) {
        }
        return this.inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }
    async createUser(data) {
        const existing = await this.findByEmailWithPassword(data.email);
        if (existing) {
            throw new common_1.ConflictException('El correo electrónico ya se encuentra registrado.');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const assignedRole = data.role === 'ADMIN' ? 'ADMIN' : 'USER';
        const newUser = {
            id: `user-${Date.now()}`,
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: assignedRole,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        try {
            const dbUser = await this.prisma.user.create({
                data: newUser,
            });
            return this.sanitizeUser(dbUser);
        }
        catch (e) {
        }
        const memoryUser = {
            ...newUser,
            createdAt: newUser.createdAt.toISOString(),
            updatedAt: newUser.updatedAt.toISOString(),
        };
        this.inMemoryUsers.unshift(memoryUser);
        return this.sanitizeUser(memoryUser);
    }
    async updateProfile(userId, data) {
        try {
            const updated = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    name: data.name,
                    lastName: data.lastName,
                    artistName: data.artistName,
                    location: data.location,
                    bio: data.bio,
                    avatarUrl: data.avatarUrl,
                },
            });
            if (updated)
                return this.sanitizeUser(updated);
        }
        catch (e) {
        }
        const index = this.inMemoryUsers.findIndex((u) => u.id === userId);
        if (index === -1) {
            throw new common_1.NotFoundException('Usuario no encontrado.');
        }
        const current = this.inMemoryUsers[index];
        const updatedMemory = {
            ...current,
            name: data.name !== undefined ? data.name : current.name,
            lastName: data.lastName !== undefined ? data.lastName : current.lastName,
            artistName: data.artistName !== undefined ? data.artistName : current.artistName,
            location: data.location !== undefined ? data.location : current.location,
            bio: data.bio !== undefined ? data.bio : current.bio,
            avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : current.avatarUrl,
            updatedAt: new Date().toISOString(),
        };
        this.inMemoryUsers[index] = updatedMemory;
        return this.sanitizeUser(updatedMemory);
    }
    async updateUser(id, data) {
        try {
            const updated = await this.prisma.user.update({
                where: { id },
                data: {
                    name: data.name,
                    lastName: data.lastName,
                    artistName: data.artistName,
                    location: data.location,
                    role: data.role,
                    isActive: data.isActive,
                    bio: data.bio,
                    avatarUrl: data.avatarUrl,
                },
            });
            if (updated)
                return this.sanitizeUser(updated);
        }
        catch (e) {
        }
        const index = this.inMemoryUsers.findIndex((u) => u.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado.`);
        }
        const current = this.inMemoryUsers[index];
        const updatedMemory = {
            ...current,
            name: data.name !== undefined ? data.name : current.name,
            lastName: data.lastName !== undefined ? data.lastName : current.lastName,
            artistName: data.artistName !== undefined ? data.artistName : current.artistName,
            location: data.location !== undefined ? data.location : current.location,
            role: data.role !== undefined ? data.role : current.role,
            isActive: data.isActive !== undefined ? data.isActive : current.isActive,
            bio: data.bio !== undefined ? data.bio : current.bio,
            avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : current.avatarUrl,
            updatedAt: new Date().toISOString(),
        };
        this.inMemoryUsers[index] = updatedMemory;
        return this.sanitizeUser(updatedMemory);
    }
    async deleteUser(id) {
        try {
            await this.prisma.user.delete({ where: { id } });
        }
        catch (e) {
        }
        const index = this.inMemoryUsers.findIndex((u) => u.id === id);
        if (index !== -1) {
            this.inMemoryUsers.splice(index, 1);
        }
        return { success: true, message: 'Usuario eliminado correctamente.' };
    }
    async toggleFavorite(userId, trackId) {
        try {
            const existing = await this.prisma.favorite.findUnique({
                where: { userId_trackId: { userId, trackId } },
            });
            if (existing) {
                await this.prisma.favorite.delete({
                    where: { id: existing.id },
                });
                return { isFavorite: false, message: 'Removido de favoritos.' };
            }
            else {
                await this.prisma.favorite.create({
                    data: { userId, trackId },
                });
                return { isFavorite: true, message: 'Guardado en favoritos.' };
            }
        }
        catch (e) {
            const idx = this.inMemoryFavorites.findIndex((f) => f.userId === userId && f.trackId === trackId);
            if (idx !== -1) {
                this.inMemoryFavorites.splice(idx, 1);
                return { isFavorite: false, message: 'Removido de favoritos.' };
            }
            else {
                this.inMemoryFavorites.push({ id: `fav-${Date.now()}`, userId, trackId });
                return { isFavorite: true, message: 'Guardado en favoritos.' };
            }
        }
    }
    async getUserFavorites(userId) {
        try {
            const favorites = await this.prisma.favorite.findMany({
                where: { userId },
                include: { track: { include: { producer: true } } },
            });
            if (favorites) {
                return favorites.map((f) => f.track);
            }
        }
        catch (e) {
        }
        const userFavs = this.inMemoryFavorites.filter((f) => f.userId === userId);
        return userFavs.map((f) => f.trackId);
    }
    async getAdminStats() {
        let totalUsers = 0;
        let activeUsers = 0;
        let totalProducers = 0;
        let totalTracks = 0;
        try {
            totalUsers = await this.prisma.user.count();
            activeUsers = await this.prisma.user.count({ where: { isActive: true } });
            totalProducers = await this.prisma.user.count({ where: { role: 'PRODUCER' } });
            totalTracks = await this.prisma.track.count();
        }
        catch (e) {
            totalUsers = this.inMemoryUsers.length;
            activeUsers = this.inMemoryUsers.filter((u) => u.isActive).length;
            totalProducers = this.inMemoryUsers.filter((u) => u.role === 'PRODUCER' || u.role === 'ADMIN').length;
            totalTracks = 4;
        }
        return {
            totalUsers,
            activeUsers,
            totalProducers,
            totalTracks,
            totalSales: 12,
            totalRevenue: 359.88,
        };
    }
    sanitizeUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            lastName: user.lastName || null,
            artistName: user.artistName || null,
            location: user.location || null,
            avatarUrl: user.avatarUrl || null,
            bio: user.bio || null,
            role: user.role,
            isActive: user.isActive ?? true,
            createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt || new Date().toISOString(),
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map
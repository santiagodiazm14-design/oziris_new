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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcryptjs"));
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/oziris?schema=public';
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Starting database seed into PostgreSQL...');
    const userPasswordHash = await bcrypt.hash('Oziris123!', 10);
    const adminPasswordHash = await bcrypt.hash('AdminOziris123!', 10);
    const testUsers = [
        {
            id: 'user-test-1',
            name: 'Usuario Prueba 1',
            email: 'usuario1@oziris.test',
            password: userPasswordHash,
            role: client_1.Role.USER,
            isActive: true,
            bio: 'Usuario de prueba 1 en OZIRIS platform.',
        },
        {
            id: 'user-test-2',
            name: 'Usuario Prueba 2',
            email: 'usuario2@oziris.test',
            password: userPasswordHash,
            role: client_1.Role.USER,
            isActive: true,
            bio: 'Usuario de prueba 2 en OZIRIS platform.',
        },
        {
            id: 'user-test-3',
            name: 'Usuario Prueba 3',
            email: 'usuario3@oziris.test',
            password: userPasswordHash,
            role: client_1.Role.USER,
            isActive: true,
            bio: 'Usuario de prueba 3 en OZIRIS platform.',
        },
        {
            id: 'user-admin-1',
            name: 'Administrador Oziris',
            email: 'admin@oziris.test',
            password: adminPasswordHash,
            role: client_1.Role.ADMIN,
            isActive: true,
            bio: 'Administrador principal de la plataforma OZIRIS.',
        },
    ];
    for (const user of testUsers) {
        const createdUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
                name: user.name,
                password: user.password,
                role: user.role,
                isActive: user.isActive,
            },
            create: {
                id: user.id,
                email: user.email,
                name: user.name,
                password: user.password,
                role: user.role,
                isActive: user.isActive,
                bio: user.bio,
            },
        });
        console.log(`✅ Seeded user into PostgreSQL: ${createdUser.email} (${createdUser.role})`);
    }
    const licensePlans = [
        {
            id: 'license-basic-mp3',
            name: 'ESTÁNDAR COMERCIAL (MP3 HQ)',
            description: 'Ideal para proyectos independientes y lanzamientos iniciales.',
            price: 29.99,
            features: ['Audio MP3 320kbps', 'Hasta 100,000 reproducciones', 'Distribución digital limitada', '1 Video musical no monetizado'],
            includesWav: false,
            includesStems: false,
            isExclusive: false,
        },
        {
            id: 'license-premium-wav',
            name: 'PREMIUM WAV LEASE',
            description: 'Calidad de estudio master sin pérdida para artistas en crecimiento.',
            price: 49.99,
            features: ['Audio WAV 24-bit + MP3 HQ', 'Hasta 500,000 reproducciones', 'Distribución comercial', 'Radio & TV broadcasting'],
            includesWav: true,
            includesStems: false,
            isExclusive: false,
        },
        {
            id: 'license-unlimited-stems',
            name: 'ILIMITADA TRACKOUT STEMS',
            description: 'Control total de mezcla con pistas separadas (stems).',
            price: 99.99,
            features: ['Pistas separadas (Stems ZIP)', 'WAV 24-bit + MP3', 'Streams ilimitados', 'Uso comercial sin restricciones'],
            includesWav: true,
            includesStems: true,
            isExclusive: false,
        },
        {
            id: 'license-exclusive',
            name: 'DERECHOS EXCLUSIVOS',
            description: 'Propiedad total del instrumental. El beat se retira del catálogo.',
            price: 299.99,
            features: ['Propiedad total y exclusiva', 'Retiro de tienda', 'Todos los formatos + Stems', 'Sin límite de regalías'],
            includesWav: true,
            includesStems: true,
            isExclusive: true,
        },
    ];
    for (const plan of licensePlans) {
        await prisma.licensePlan.upsert({
            where: { id: plan.id },
            update: {
                name: plan.name,
                description: plan.description,
                price: plan.price,
                features: plan.features,
                includesWav: plan.includesWav,
                includesStems: plan.includesStems,
                isExclusive: plan.isExclusive,
            },
            create: plan,
        });
        console.log(`✅ Seeded license plan: ${plan.name}`);
    }
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@oziris.test' } });
    if (adminUser) {
        const sampleTracks = [
            {
                id: 'track-1',
                title: 'Dark Vibes Trap Beat',
                description: 'Heavy 808s and dark synth melodies.',
                price: 29.99,
                genre: 'Trap',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop',
                producerId: adminUser.id,
            },
            {
                id: 'track-2',
                title: 'Summer Reggaeton Hit',
                description: 'Bouncy dembow rhythm with smooth guitars.',
                price: 34.99,
                genre: 'Reggaeton',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop',
                producerId: adminUser.id,
            },
            {
                id: 'track-3',
                title: 'Midnight R&B Soul',
                description: 'Lush rhodes and smooth bassline.',
                price: 39.99,
                genre: 'R&B',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop',
                producerId: adminUser.id,
            },
            {
                id: 'track-4',
                title: 'Classic Boom Bap',
                description: '90s underground hip-hop style with vinyl crackle.',
                price: 24.99,
                genre: 'Boom Bap',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
                fullAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
                coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop',
                producerId: adminUser.id,
            },
        ];
        for (const track of sampleTracks) {
            await prisma.track.upsert({
                where: { id: track.id },
                update: {},
                create: track,
            });
            console.log(`✅ Seeded track: ${track.title}`);
        }
    }
    console.log('🎉 PostgreSQL Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Error during PostgreSQL seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed.js.map
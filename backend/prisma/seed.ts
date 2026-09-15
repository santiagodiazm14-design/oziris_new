import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/oziris?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
      role: Role.USER,
      isActive: true,
      bio: 'Usuario de prueba 1 en OZIRIS platform.',
    },
    {
      id: 'user-test-2',
      name: 'Usuario Prueba 2',
      email: 'usuario2@oziris.test',
      password: userPasswordHash,
      role: Role.USER,
      isActive: true,
      bio: 'Usuario de prueba 2 en OZIRIS platform.',
    },
    {
      id: 'user-test-3',
      name: 'Usuario Prueba 3',
      email: 'usuario3@oziris.test',
      password: userPasswordHash,
      role: Role.USER,
      isActive: true,
      bio: 'Usuario de prueba 3 en OZIRIS platform.',
    },
    {
      id: 'user-admin-1',
      name: 'Administrador Oziris',
      email: 'admin@oziris.test',
      password: adminPasswordHash,
      role: Role.ADMIN,
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
    ];

    for (const track of sampleTracks) {
      await prisma.track.upsert({
        where: { id: track.id },
        update: {},
        create: track,
      });
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

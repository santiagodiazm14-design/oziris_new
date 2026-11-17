import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... npx ts-node prisma/create-admin.ts
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Administrador Oziris';
  if (!email || !password || password.length < 8) {
    throw new Error('Define ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 8 caracteres).');
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const hash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: 'ADMIN', isActive: true, name },
    create: { email, password: hash, role: 'ADMIN', isActive: true, name },
  });
  console.log(`Admin listo: ${admin.email} (${admin.role}) id=${admin.id}`);
  await prisma.$disconnect();
  await pool.end();
}
main().catch((e) => { console.error(e.message); process.exit(1); });

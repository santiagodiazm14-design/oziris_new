import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL no está definido en el archivo .env.');
    }
    const pool = new Pool({
      connectionString,
      max: Number(process.env.DB_POOL_MAX) || 20,
      // Falla rápido en vez de colgar peticiones si la BD no responde
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
    });
    // Un error en un cliente inactivo no debe tumbar el proceso
    pool.on('error', (err) =>
      console.error('Error en el pool de PostgreSQL:', err.message),
    );
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end().catch(() => undefined);
  }
}

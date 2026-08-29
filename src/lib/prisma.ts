import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

/**
 * Prisma client factory - uses Supabase PostgreSQL exclusively
 * Uses SUPABASE_DATABASE_URL for queries (transaction pooler)
 * Uses DIRECT_URL for migrations (session pooler)
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error('Missing SUPABASE_DATABASE_URL or DIRECT_URL environment variable');
  }

  const pool = new pg.Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = undefined;
}

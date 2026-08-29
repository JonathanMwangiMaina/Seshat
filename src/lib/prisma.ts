import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import Database from 'better-sqlite3';
import pg from 'pg';

/**
 * Prisma client factory - creates appropriate client based on environment
 * Uses SQLite for local development, PostgreSQL/Supabase for production
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasSupabase = !!process.env.SUPABASE_DATABASE_URL;
  
  let adapter;
  
  if (hasSupabase) {
    // Use Supabase PostgreSQL with connection pooling
    // Use SUPABASE_DATABASE_URL for queries (transaction pooler)
    // Use DIRECT_URL for migrations (session pooler)
    const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DIRECT_URL;
    const pool = new pg.Pool({ 
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    adapter = new PrismaPg(pool);
  } else {
    // Development: Use local SQLite
    const connectionString = process.env.DATABASE_URL || 'file:./dev.db';
    const sqlite = new Database(connectionString.replace('file:', ''));
    adapter = new PrismaBetterSqlite3(sqlite);
  }

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
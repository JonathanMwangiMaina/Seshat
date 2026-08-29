import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: string | undefined;
  database?: {
    connected: boolean;
    type?: string;
    error?: string;
  };
  prisma?: {
    initialized: boolean;
    error?: string;
  };
  environmentVariables: {
    JWT_SECRET: 'configured' | 'missing';
    DATABASE_URL: 'configured' | 'missing';
    SUPABASE_DATABASE_URL: 'configured' | 'missing';
  };
  warnings?: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<HealthResponse>) {
  const warnings: string[] = [];
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Check environment variables
  const hasJWTSecret = !!process.env.JWT_SECRET;
  const hasSupabaseURL = !!process.env.SUPABASE_DATABASE_URL;
  const hasDatabaseURL = !!process.env.DATABASE_URL;

  if (!hasJWTSecret) {
    warnings.push('JWT_SECRET is not configured - authentication will fail');
    overallStatus = 'unhealthy';
  }

  if (!hasSupabaseURL && !hasDatabaseURL) {
    warnings.push(
      'Database connection not available - no DATABASE_URL or SUPABASE_DATABASE_URL configured'
    );
    overallStatus = 'unhealthy';
  }

  // Test database connectivity
  const databaseStatus = {
    connected: false,
    type: undefined as string | undefined,
    error: undefined as string | undefined,
  };

  const prismaStatus = {
    initialized: false,
    error: undefined as string | undefined,
  };

  try {
    // Check if Prisma client is initialized
    if (prisma) {
      prismaStatus.initialized = true;

      // Test database connection with a simple query
      await prisma.$queryRaw`SELECT 1 as health_check`;
      databaseStatus.connected = true;

      // Determine database type from connection string
      if (hasSupabaseURL) {
        databaseStatus.type = 'PostgreSQL (Supabase)';
      } else if (hasDatabaseURL) {
        databaseStatus.type = process.env.DATABASE_URL?.startsWith('file:')
          ? 'SQLite'
          : 'PostgreSQL';
      }
    } else {
      prismaStatus.error = 'Prisma client not initialized';
      warnings.push('Prisma client initialization failed');
      overallStatus = 'degraded';
    }
  } catch (error) {
    databaseStatus.connected = false;
    databaseStatus.error = error instanceof Error ? error.message : 'Unknown database error';
    warnings.push(`Database connection failed: ${databaseStatus.error}`);

    if (overallStatus === 'healthy') {
      overallStatus = 'degraded';
    }
  }

  const health: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: databaseStatus,
    prisma: prismaStatus,
    environmentVariables: {
      JWT_SECRET: hasJWTSecret ? 'configured' : 'missing',
      DATABASE_URL: hasDatabaseURL ? 'configured' : 'missing',
      SUPABASE_DATABASE_URL: hasSupabaseURL ? 'configured' : 'missing',
    },
  };

  // Only include warnings if there are any
  if (warnings.length > 0) {
    health.warnings = warnings;
  }

  // Return appropriate status code based on health
  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 207 : 503;

  return res.status(statusCode).json(health);
}

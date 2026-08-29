import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import type { DeleteProfileResponse, ErrorResponse } from '@/types/api';
import { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteProfileResponse | ErrorResponse>
) {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = await requireAuth(req, res);
    if (!user) {
      // requireAuth already sent 401 response
      return;
    }

    // Delete user from database
    await prisma.user.delete({
      where: { id: user.id },
    });

    // Clear auth cookie
    res.setHeader(
      'Set-Cookie',
      serialize('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/',
      })
    );

    return res.status(200).json({
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    console.error('Delete profile error:', error);

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } };

      // Database connection errors
      if (prismaError.code === 'P1001') {
        console.error('Database connection error: Cannot reach database server');
        return res.status(503).json({
          error: 'Unable to connect to the database. Please try again later.',
        });
      }

      if (prismaError.code === 'P1002') {
        console.error('Database timeout error: Database server timeout');
        return res.status(503).json({
          error: 'Database connection timed out. Please try again.',
        });
      }

      // Record not found
      if (prismaError.code === 'P2025') {
        console.error('User not found during deletion');
        return res.status(404).json({
          error: 'User not found',
        });
      }

      // Foreign key constraint violation (if user has related records)
      if (prismaError.code === 'P2003') {
        console.error('Cannot delete user with related records');
        return res.status(409).json({
          error: 'Cannot delete profile. Please remove all related data first.',
        });
      }

      // Generic Prisma error
      console.error('Prisma error:', prismaError.code);
      return res.status(500).json({
        error: 'A database error occurred. Please try again.',
      });
    }

    // Generic error fallback
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again later.',
    });
  }
}

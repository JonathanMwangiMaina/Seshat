import { requireAuth } from '@/lib/middleware';
import { comparePassword, hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import type { ErrorResponse, UpdatePasswordRequest, UpdatePasswordResponse } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdatePasswordResponse | ErrorResponse>
) {
  // Only allow PUT/PATCH requests
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = await requireAuth(req, res);
    if (!user) {
      // requireAuth already sent 401 response
      return;
    }

    const { currentPassword, newPassword } = req.body as UpdatePasswordRequest;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required',
      });
    }

    // Validate new password strength (minimum 8 characters)
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'New password must be at least 8 characters long',
      });
    }

    // Validate new password is different from old password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        error: 'New password must be different from current password',
      });
    }

    // Fetch current user with password hash
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!currentUser) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, currentUser.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Current password is incorrect',
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);

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
        console.error('User not found during update');
        return res.status(404).json({
          error: 'User not found',
        });
      }

      // Generic Prisma error
      console.error('Prisma error:', prismaError.code);
      return res.status(500).json({
        error: 'A database error occurred. Please try again.',
      });
    }

    // Handle bcrypt errors
    if (error instanceof Error && error.message.includes('bcrypt')) {
      console.error('Password hashing error:', error.message);
      return res.status(500).json({
        error: 'Error processing password. Please try again.',
      });
    }

    // Generic error fallback
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again later.',
    });
  }
}

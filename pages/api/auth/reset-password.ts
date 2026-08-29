import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import type { ErrorResponse, ResetPasswordRequest, ResetPasswordResponse } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResetPasswordResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, newPassword } = req.body as ResetPasswordRequest;

    // Validate inputs
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Reset token is required' });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'New password is required' });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token has expired
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res
        .status(400)
        .json({ error: 'Reset token has expired. Please request a new password reset.' });
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({
      message: 'Password successfully reset. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}

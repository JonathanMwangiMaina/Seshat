import { requireAuth } from '@/lib/middleware';
import { comparePassword, hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import type { ErrorResponse, UpdatePasswordRequest, UpdatePasswordResponse } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdatePasswordResponse | ErrorResponse>
) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Require authentication
    const currentUser = await requireAuth(req, res);
    if (!currentUser) return; // requireAuth already sent 401 response

    const { currentPassword, newPassword } = req.body as UpdatePasswordRequest;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Validate new password strength (minimum 8 characters)
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { passwordHash: newPasswordHash },
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import type { ErrorResponse, UpdateProfileRequest, UpdateProfileResponse } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateProfileResponse | ErrorResponse>
) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Require authentication
    const currentUser = await requireAuth(req, res);
    if (!currentUser) return; // requireAuth already sent 401 response

    const { name, email } = req.body as UpdateProfileRequest;

    // Validate at least one field is provided
    if (!name && !email) {
      return res.status(400).json({ error: 'At least one field (name or email) must be provided' });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser && existingUser.id !== currentUser.id) {
        return res.status(409).json({ error: 'Email is already taken' });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(name !== undefined && { name }),
        ...(email && { email: email.toLowerCase() }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        resetToken: true,
        resetTokenExpiry: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

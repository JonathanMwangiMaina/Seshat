import { sendPasswordResetEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import type { ErrorResponse, ForgotPasswordRequest, ForgotPasswordResponse } from '@/types/api';
import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ForgotPasswordResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body as ForgotPasswordRequest;

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // SECURITY: Always return success message even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      // Still return success to prevent email enumeration
      return res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set token expiry to 1 hour from now
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour = 3600000ms

    // Save token and expiry to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    // Return generic success message
    return res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process password reset request' });
  }
}

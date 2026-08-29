import { signToken } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';
import type { ErrorResponse, SignupRequest, SignupResponse } from '@/types/api';
import { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignupResponse | ErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, role = 'CUSTOMER' } = req.body as SignupRequest;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Please provide a valid email address (e.g., user@example.com)',
      });
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long',
      });
    }

    // Validate name length if provided
    if (name && name.length > 100) {
      return res.status(400).json({
        error: 'Name must not exceed 100 characters',
      });
    }

    // Validate role
    const validRoles = ['ADMIN', 'VENDOR', 'CUSTOMER'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be ADMIN, VENDOR, or CUSTOMER',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email already exists. Please log in instead.',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        passwordHash,
        role: role as 'ADMIN' | 'VENDOR' | 'CUSTOMER',
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

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    // Set HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      serialize('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    );

    return res.status(201).json({ user });
  } catch (error) {
    console.error('Signup error:', error);

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

      // Unique constraint violation (should be caught earlier, but just in case)
      if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target?.[0] || 'field';
        console.error(`Unique constraint violation on: ${target}`);
        return res.status(409).json({
          error: 'An account with this email already exists.',
        });
      }

      // Database table not found (migration issue)
      if (prismaError.code === 'P2021') {
        console.error('Database table not found - migrations may not have been run');
        return res.status(503).json({
          error: 'Database configuration error. Please contact support.',
        });
      }

      // Generic Prisma error
      console.error('Prisma error:', prismaError.code);
      return res.status(500).json({
        error: 'A database error occurred. Please try again.',
      });
    }

    // Handle JWT signing errors (missing JWT_SECRET)
    if (error instanceof Error && error.message.includes('secretOrPrivateKey')) {
      console.error('JWT_SECRET not configured');
      return res.status(503).json({
        error: 'Authentication service is not properly configured. Please contact support.',
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

import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Get JWT secret from environment variables
 * @throws Error if JWT_SECRET is not set
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

/**
 * Sign a JWT token with user data
 * @param payload - User data to encode in token
 * @returns JWT token string
 */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: '7d', // Token expires in 7 days
  });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJWTSecret()) as JWTPayload;
  } catch {
    return null;
  }
}

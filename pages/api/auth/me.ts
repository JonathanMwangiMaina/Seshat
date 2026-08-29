import { authenticateRequest } from '@/lib/middleware';
import type { ErrorResponse, MeResponse } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MeResponse | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate request
    const user = await authenticateRequest(req, res);

    // Return user (or null if not authenticated)
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

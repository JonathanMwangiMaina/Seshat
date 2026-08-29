import { analyzePasswordStrength } from '@/lib/password-validator';
import type { AnalyzePasswordStrengthOutput } from '@/types/password-strength';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzePasswordStrengthOutput | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required and must be a string' });
  }

  const result = analyzePasswordStrength(password);
  return res.status(200).json(result);
}

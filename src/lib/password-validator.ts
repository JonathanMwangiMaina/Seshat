import type { AnalyzePasswordStrengthOutput } from '@/types/password-strength';

export function analyzePasswordStrength(password: string): AnalyzePasswordStrengthOutput {
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  const suggestions: string[] = [];

  // Length scoring
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  else if (length < 12) suggestions.push('Use at least 12 characters for better security');

  // Character variety scoring
  if (hasLower) score += 1;
  else suggestions.push('Include lowercase letters');

  if (hasUpper) score += 1;
  else suggestions.push('Include uppercase letters');

  if (hasNumber) score += 1;
  else suggestions.push('Include numbers');

  if (hasSpecial) score += 1;
  else suggestions.push('Include special characters (!@#$%^&*)');

  // Common patterns check
  const commonPatterns = ['123', 'abc', 'password', 'qwerty', '111', '000'];
  const lowerPassword = password.toLowerCase();
  const hasCommonPattern = commonPatterns.some((pattern) => lowerPassword.includes(pattern));
  if (hasCommonPattern) {
    score -= 2;
    suggestions.push('Avoid common patterns and sequences');
  }

  // Determine strength level
  let strength: string;
  let reason: string;

  if (score >= 6) {
    strength = 'very strong';
    reason = 'Excellent! Your password meets all security criteria.';
  } else if (score >= 5) {
    strength = 'strong';
    reason = 'Good password strength with room for minor improvements.';
  } else if (score >= 3) {
    strength = 'moderate';
    reason = 'Fair password, but could be more secure.';
  } else if (score >= 1) {
    strength = 'weak';
    reason = 'Your password needs significant improvement.';
  } else {
    strength = 'very weak';
    reason = 'This password is too weak and easily guessable.';
  }

  return {
    strength,
    reason,
    suggestions: suggestions.slice(0, 3), // Limit to top 3 suggestions
  };
}

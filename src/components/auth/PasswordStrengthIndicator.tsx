'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { AnalyzePasswordStrengthOutput } from '@/types/password-strength';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  analysis: AnalyzePasswordStrengthOutput | null;
  isLoading?: boolean;
}

const strengthMap: Record<string, { color: string; value: number; label: string }> = {
  'very weak': { color: 'bg-red-500', value: 20, label: 'Very Weak' },
  weak: { color: 'bg-orange-500', value: 40, label: 'Weak' },
  moderate: { color: 'bg-yellow-500', value: 60, label: 'Moderate' },
  strong: { color: 'bg-blue-500', value: 80, label: 'Strong' },
  'very strong': { color: 'bg-green-500', value: 100, label: 'Very Strong' },
};

export default function PasswordStrengthIndicator({
  analysis,
  isLoading,
}: PasswordStrengthIndicatorProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground mt-2">Analyzing password...</p>;
  }

  if (!analysis) {
    return null;
  }

  const strengthInfo = strengthMap[analysis.strength.toLowerCase()] || {
    color: 'bg-gray-500',
    value: 0,
    label: 'Unknown',
  };

  return (
    <Card className="mt-4 border-border/50 shadow-sm">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-base flex items-center">
          Password Strength:{' '}
          <span className={`ml-2 font-semibold ${strengthInfo.color.replace('bg-', 'text-')}`}>
            {strengthInfo.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <Progress value={strengthInfo.value} className={`h-2 ${strengthInfo.color}`} />
        {analysis.reason && (
          <p className="text-xs text-muted-foreground flex items-start">
            <AlertTriangle className="h-3 w-3 mr-1.5 mt-0.5 shrink-0 text-yellow-600" />
            {analysis.reason}
          </p>
        )}
        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-1">Suggestions:</h4>
            <ul className="list-none space-y-1">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start">
                  <CheckCircle className="h-3 w-3 mr-1.5 mt-0.5 shrink-0 text-green-600" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

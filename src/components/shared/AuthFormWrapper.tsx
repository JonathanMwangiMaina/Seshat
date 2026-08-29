import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReactNode } from 'react';

interface AuthFormWrapperProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthFormWrapper({ title, children, footer }: AuthFormWrapperProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && (
          <div className="p-6 pt-0 text-center text-sm text-muted-foreground">{footer}</div>
        )}
      </Card>
    </div>
  );
}

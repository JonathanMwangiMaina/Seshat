import LoginForm from '@/components/auth/LoginForm';
import AuthFormWrapper from '@/components/shared/AuthFormWrapper';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { user, initialLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !initialLoading && user) {
      window.location.href = '/profile';
    }
  }, [user, initialLoading, mounted]);

  if (initialLoading || (!initialLoading && user)) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthFormWrapper
      title="Welcome Back"
      footer={
        <>
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthFormWrapper>
  );
}

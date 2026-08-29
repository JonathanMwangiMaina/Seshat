'use client';

import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import AuthFormWrapper from '@/components/shared/AuthFormWrapper';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import type { ResetPasswordRequest } from '@/types/api';
import type { AnalyzePasswordStrengthOutput } from '@/types/password-strength';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, CheckCircle, Loader2, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<AnalyzePasswordStrengthOutput | null>(
    null
  );
  const [strengthLoading, setStrengthLoading] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const passwordValue = form.watch('newPassword');
  const debouncedPassword = useDebounce(passwordValue, 500);

  // Validate token exists
  useEffect(() => {
    if (router.isReady && !token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [router.isReady, token]);

  // Check password strength
  useEffect(() => {
    const checkPasswordStrength = async () => {
      if (debouncedPassword && debouncedPassword.length > 0) {
        setStrengthLoading(true);
        try {
          const response = await fetch('/api/analyze-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: debouncedPassword }),
          });

          if (!response.ok) {
            throw new Error('Failed to analyze password');
          }

          const result = await response.json();
          setPasswordStrength(result);
        } catch (error) {
          console.error('Error analyzing password strength:', error);
          setPasswordStrength(null);
        } finally {
          setStrengthLoading(false);
        }
      } else {
        setPasswordStrength(null);
      }
    };
    checkPasswordStrength();
  }, [debouncedPassword]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token || typeof token !== 'string') {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const requestData: ResetPasswordRequest = {
        token: token,
        newPassword: data.newPassword,
      };

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      setSuccess(true);
      form.reset();

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormWrapper
      title="Reset Password"
      footer={
        <>
          Remember your password?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter your new password below. Make sure it's strong and secure.
        </p>

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Password successfully reset! Redirecting to login page...
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!error && !success && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="pl-10"
                          disabled={loading}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <PasswordStrengthIndicator analysis={passwordStrength} isLoading={strengthLoading} />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="pl-10"
                          disabled={loading}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading || !token}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Reset Password
              </Button>
            </form>
          </Form>
        )}

        {error && (
          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Request a new password reset
            </Link>
          </div>
        )}
      </div>
    </AuthFormWrapper>
  );
}

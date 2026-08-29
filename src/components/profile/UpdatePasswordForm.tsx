'use client';

import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
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
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import type { AnalyzePasswordStrengthOutput } from '@/types/password-strength';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Current password is required.' }),
    newPassword: z.string().min(8, { message: 'New password must be at least 8 characters.' }),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match.",
    path: ['confirmNewPassword'],
  });

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordForm() {
  const { updatePassword, loading: authLoading } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState<AnalyzePasswordStrengthOutput | null>(
    null
  );
  const [strengthLoading, setStrengthLoading] = useState(false);

  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPasswordValue = form.watch('newPassword');
  const debouncedNewPassword = useDebounce(newPasswordValue, 500);

  useEffect(() => {
    const checkPasswordStrength = async () => {
      if (debouncedNewPassword && debouncedNewPassword.length > 0) {
        setStrengthLoading(true);
        try {
          const response = await fetch('/api/analyze-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: debouncedNewPassword }),
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
  }, [debouncedNewPassword]);

  const onSubmit = async (data: UpdatePasswordFormValues) => {
    await updatePassword(data.currentPassword, data.newPassword);
    form.reset();
    setPasswordStrength(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <PasswordStrengthIndicator analysis={passwordStrength} isLoading={strengthLoading} />
        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={authLoading}>
          {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Update Password
        </Button>
      </form>
    </Form>
  );
}

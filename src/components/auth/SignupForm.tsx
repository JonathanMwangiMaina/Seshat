'use client';

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
import { Loader2, LockKeyhole, Mail, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

const signupSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const { signup, loading: authLoading } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState<AnalyzePasswordStrengthOutput | null>(
    null
  );
  const [strengthLoading, setStrengthLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = form.watch('password');
  const debouncedPassword = useDebounce(passwordValue, 500);

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

  const onSubmit = async (data: SignupFormValues) => {
    await signup(data.name, data.email, data.password);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name (Optional)</FormLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="Your Name" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
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
          Create Account
        </Button>
      </form>
    </Form>
  );
}

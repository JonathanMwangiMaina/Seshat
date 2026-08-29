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
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, User as UserIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface ProfileFormProps {
  currentUser: User;
}

const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address.' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm({ currentUser }: ProfileFormProps) {
  const { updateProfile, loading } = useAuth();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser.name || '',
      email: currentUser.email || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (data.name !== undefined) {
      // Ensure name is passed, even if empty string
      await updateProfile(data.name, data.email);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Update Profile
        </Button>
      </form>
    </Form>
  );
}

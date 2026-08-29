'use client';

import { useToast } from '@/hooks/use-toast';
import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initialLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string | undefined, email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
  updatePassword: (currentPass: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// SSR-safe navigation helper
function navigateTo(path: string) {
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();

  // Load initial user state from backend
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Failed to load user session', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(
    async (email: string, pass: string) => {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password: pass }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        setUser(data.user);
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.user.name || 'User'}!`,
        });
        navigateTo('/profile');
      } catch (error) {
        toast({
          title: 'Login Failed',
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const signup = useCallback(
    async (name: string | undefined, email: string, pass: string) => {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, password: pass }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }

        setUser(data.user);
        toast({
          title: 'Signup Successful',
          description: 'Welcome to RetailPass!',
        });
        navigateTo('/profile');
      } catch (error) {
        toast({
          title: 'Signup Failed',
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Logout failed');
      }

      setUser(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      navigateTo('/login');
    } catch (error) {
      // Even if logout fails on backend, clear local state
      setUser(null);
      toast({
        title: 'Logged Out',
        description: error instanceof Error ? error.message : 'Logged out with errors',
        variant: 'destructive',
      });
      navigateTo('/login');
    }
  }, [toast]);

  const updateProfile = useCallback(
    async (name: string, email: string) => {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Profile update failed');
        }

        setUser(data.user);
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        });
      } catch (error) {
        toast({
          title: 'Update Failed',
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const updatePassword = useCallback(
    async (currentPass: string, newPass: string) => {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Password update failed');
        }

        toast({
          title: 'Password Updated',
          description: 'Your password has been successfully updated.',
        });
      } catch (error) {
        toast({
          title: 'Update Failed',
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialLoading,
        login,
        signup,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

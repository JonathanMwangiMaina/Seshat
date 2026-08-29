'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, ShieldCheck, UserCog, UserPlus } from 'lucide-react';
import Link from 'next/link';

const AppHeader = () => {
  const { user, logout, initialLoading } = useAuth();

  if (initialLoading) {
    return (
      <header className="bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-7 w-7" />
            <span className="text-xl font-headline font-semibold">Seshat</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-7 w-7" />
          <span className="text-xl font-headline font-semibold">RetailPass</span>
        </Link>
        <nav>
          <ul className="flex items-center gap-4">
            {user ? (
              <>
                <li>
                  <Button variant="ghost" asChild>
                    <Link href="/profile" className="flex items-center gap-1">
                      <UserCog className="h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button variant="outline" onClick={logout} className="flex items-center gap-1">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Button variant="ghost" asChild>
                    <Link href="/login" className="flex items-center gap-1">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button variant="default" asChild>
                    <Link href="/signup" className="flex items-center gap-1">
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Link>
                  </Button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;

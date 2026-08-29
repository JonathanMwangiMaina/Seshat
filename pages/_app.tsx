import AppHeader from '@/components/layout/AppHeader';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>RetailPass - AI-Powered Authentication Platform</title>
        <meta
          name="description"
          content="Modern authentication platform with AI-powered password strength analysis, secure user registration, and profile management built with Next.js"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AuthProvider>
        <AppHeader />
        <main>
          <Component {...pageProps} />
        </main>
        <Toaster />
      </AuthProvider>
    </>
  );
}

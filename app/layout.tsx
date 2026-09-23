import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SEC AI Assistant | Sengunthar Engineering College',
  description: 'Your AI College Companion - Sengunthar Engineering College, Tiruchengode',
  icons: {
    icon: '/images/sec-logo.png',
    shortcut: '/images/sec-logo.png',
    apple: '/images/sec-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/sec-logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1468D5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SEC Portal" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 1. Safety redirect timeout: Never let the screen hang on loading
    const safetyTimer = setTimeout(() => {
      if (!profile) {
        router.replace('/login/');
      }
    }, 1500);

    if (loading) return;

    if (profile) {
      const route = profile.role === 'ADMIN' ? '/admin/' : profile.role === 'STAFF' ? '/staff/' : '/student/';
      router.replace(route);
    } else {
      router.replace('/login/');
    }

    return () => clearTimeout(safetyTimer);
  }, [profile, loading, router]);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FBFF',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      className="flex min-h-screen items-center justify-center bg-[#F8FBFF]"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
        className="flex flex-col items-center gap-4"
      >
        <div
          style={{
            height: '64px',
            width: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1468D5, #123B73)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px -5px rgba(20, 104, 213, 0.4)',
          }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1468D5] to-[#123B73] shadow-lg"
        >
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px' }} className="text-white font-bold text-lg">
            SEC
          </span>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-[#1468D5]" />
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }} className="text-sm text-[#6B7280]">
          Loading SEC AI Assistant...
        </p>
      </div>
    </div>
  );
}

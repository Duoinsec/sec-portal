'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      router.replace('/login/');
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login/') {
          window.location.replace('/login/');
        }
      }, 150);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(profile.role)) {
      const dashboardMap: Record<string, string> = {
        ADMIN: '/admin/',
        STAFF: '/staff/',
        STUDENT: '/student/',
      };
      const dest = dashboardMap[profile.role] || '/login/';
      router.replace(dest);
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname !== dest) {
          window.location.replace(dest);
        }
      }, 150);
    }
  }, [profile, loading, router, allowedRoles?.join(',')]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FBFF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
        className="flex min-h-screen items-center justify-center bg-[#F8FBFF]"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }} className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1468D5]" />
          <p style={{ fontSize: '14px', color: '#6B7280' }} className="text-sm text-[#6B7280]">Loading SEC AI Assistant...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  if (allowedRoles && !allowedRoles.includes(profile.role)) return null;

  return <>{children}</>;
}

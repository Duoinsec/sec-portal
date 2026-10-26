'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Profile } from '@/lib/types';

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [safetyTimedOut, setSafetyTimedOut] = useState(false);

  // Synchronous cached profile check for instant reload
  const cachedProfile = (() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('sec_cached_profile');
        if (raw) return JSON.parse(raw) as Profile;
      } catch (_) {}
    }
    return null;
  })();

  const activeProfile = profile || cachedProfile;

  useEffect(() => {
    setMounted(true);
    // Never let the user be stuck on loading for more than 500ms
    const timer = setTimeout(() => {
      setSafetyTimedOut(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (loading && !safetyTimedOut && !activeProfile) return;

    if (!activeProfile) {
      router.replace('/login/');
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login/') {
          window.location.replace('/login/');
        }
      }, 150);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(activeProfile.role)) {
      const dashboardMap: Record<string, string> = {
        ADMIN: '/admin/',
        STAFF: '/staff/',
        STUDENT: '/student/',
      };
      const dest = dashboardMap[activeProfile.role] || '/login/';
      router.replace(dest);
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname !== dest) {
          window.location.replace(dest);
        }
      }, 150);
    }
  }, [activeProfile, loading, router, mounted, safetyTimedOut, allowedRoles?.join(',')]);

  // Show loading spinner ONLY if not mounted OR (loading is true AND we have no cached profile AND safety timer hasn't expired)
  if (!mounted || (loading && !activeProfile && !safetyTimedOut)) {
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

  if (!activeProfile) return null;

  if (allowedRoles && !allowedRoles.includes(activeProfile.role)) return null;

  return <>{children}</>;
}

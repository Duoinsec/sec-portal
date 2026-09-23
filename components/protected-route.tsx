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
      router.replace('/login');
      return;
    }
    if (allowedRoles && !allowedRoles.includes(profile.role)) {
      const dashboardMap: Record<string, string> = {
        ADMIN: '/admin',
        STAFF: '/staff',
        STUDENT: '/student',
      };
      router.replace(dashboardMap[profile.role] || '/login');
    }
  }, [profile, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FBFF]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1468D5]" />
          <p className="text-sm text-[#6B7280]">Loading SEC AI Assistant...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  if (allowedRoles && !allowedRoles.includes(profile.role)) return null;

  return <>{children}</>;
}

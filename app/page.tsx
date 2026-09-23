'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (profile) {
      const route = profile.role === 'ADMIN' ? '/admin' : profile.role === 'STAFF' ? '/staff' : '/student';
      router.replace(route);
    } else {
      router.replace('/login');
    }
  }, [profile, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FBFF]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1468D5] to-[#123B73] shadow-lg">
          <span className="text-white font-bold text-lg">SEC</span>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-[#1468D5]" />
        <p className="text-sm text-[#6B7280]">Loading SEC AI Assistant...</p>
      </div>
    </div>
  );
}

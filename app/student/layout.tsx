'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AppShell } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <AppShell role="STUDENT">{children}</AppShell>
    </ProtectedRoute>
  );
}

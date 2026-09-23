'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AppShell } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  return (
    <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
      <AppShell role="STAFF">{children}</AppShell>
    </ProtectedRoute>
  );
}

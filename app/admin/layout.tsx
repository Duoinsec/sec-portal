'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AppShell } from '@/components/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AppShell role="ADMIN">{children}</AppShell>
    </ProtectedRoute>
  );
}

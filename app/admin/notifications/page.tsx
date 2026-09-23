'use client';

import { useNotifications } from '@/lib/hooks';
import { Card, LoadingState, EmptyState } from '@/components/shared';
import { Bell, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminNotifications() {
  const { data: notifications, loading, markAllRead } = useNotifications();

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">System Notifications</h1>
          <p className="text-sm text-[#6B7280] mt-1">Alerts, security logs, and institutional updates</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={() => markAllRead()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6EEF7] bg-white px-3 py-2 text-xs font-semibold text-[#1468D5] shadow-sm hover:bg-[#F8FBFF]"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState title="No Notifications" message="You have no notifications." icon={Bell} />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1468D5]/10 text-[#1468D5] shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm text-[#172033]">{n.title}</h3>
                  <span className="text-xs text-[#6B7280]">{format(new Date(n.created_at), 'MMM d, h:mm a')}</span>
                </div>
                <p className="text-xs text-[#4B5563] mt-1">{n.body}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

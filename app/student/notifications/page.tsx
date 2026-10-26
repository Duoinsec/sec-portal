'use client';

import { useNotifications } from '@/lib/hooks';
import { Card, LoadingState, EmptyState, Badge } from '@/components/shared';
import { Bell, CheckCheck, Clock, Info, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { requestNotificationPermission, sendOutsideNotification } from '@/lib/notification-service';

export default function StudentNotifications() {
  const { data: notifications, loading, markRead, markAllRead } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Notifications</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All notifications caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const granted = await requestNotificationPermission();
              if (granted) {
                await sendOutsideNotification({
                  title: '💼 New Placement Drive: Zoho Corp',
                  body: 'Role: Software Development Engineer | 8.5 LPA • Round 1 Test Link available!',
                  type: 'placement',
                  url: '/student/placements/',
                });
                toast.success('Test alert sent! Check your device notification tray outside the app.');
              } else {
                toast.error('Please allow notification permission in your device/browser settings.');
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1468D5] to-[#0A4BA3] px-3.5 py-2 text-xs font-bold text-white shadow hover:opacity-90 transition-all"
          >
            <Bell className="h-4 w-4" />
            Test Outside Notification
          </button>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6EEF7] bg-white px-3 py-2 text-xs font-semibold text-[#1468D5] shadow-sm hover:bg-[#F8FBFF] transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Mark read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading your notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No Notifications"
          message="You're all caught up! No notifications have arrived yet."
          icon={Bell}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`flex items-start gap-3 rounded-2xl border p-4 transition-all cursor-pointer ${
                  n.is_read
                    ? 'border-[#E6EEF7] bg-white hover:bg-[#F8FBFF]'
                    : 'border-[#1468D5]/30 bg-blue-50/40 hover:bg-blue-50/60'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                    n.is_read ? 'bg-gray-100 text-[#6B7280]' : 'bg-[#1468D5] text-white'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className={`text-sm ${
                        n.is_read ? 'font-medium text-[#172033]' : 'font-bold text-[#1468D5]'
                      }`}
                    >
                      {n.title}
                    </h3>
                    <span className="text-[11px] text-[#6B7280] whitespace-nowrap">
                      {n.created_at ? format(new Date(n.created_at), 'MMM d, h:mm a') : ''}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">{n.body}</p>
                </div>

                {!n.is_read && (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1468D5] shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

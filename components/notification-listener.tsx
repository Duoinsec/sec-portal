'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import {
  requestNotificationPermission,
  sendOutsideNotification,
  registerNotificationActionListeners,
  hasNotificationPermission,
} from '@/lib/notification-service';
import { Bell, Check, X, ShieldAlert, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NotificationListener() {
  const { profile } = useAuth();
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const registeredRef = useRef(false);

  useEffect(() => {
    // 1. Register click actions on native app
    registerNotificationActionListeners((url) => {
      try {
        router.push(url);
      } catch {
        window.location.href = url;
      }
    });

    // 2. Check if notification permission is already granted; if not, ask after 2.5s
    const checkTimer = setTimeout(async () => {
      const granted = await hasNotificationPermission();
      if (!granted && profile?.role === 'STUDENT') {
        setShowPrompt(true);
      }
    }, 2500);

    return () => clearTimeout(checkTimer);
  }, [profile, router]);

  useEffect(() => {
    if (!profile) return;
    if (registeredRef.current) return;
    registeredRef.current = true;

    // 3. Supabase Realtime Subscriptions for outside notifications
    const channel = supabase.channel('sec_campus_realtime_updates');

    // (A) Announcements (Staff / Admin creates announcement)
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'announcements' },
      async (payload) => {
        const newAnn = payload.new as any;
        if (!newAnn) return;

        await sendOutsideNotification({
          id: Math.floor(Math.random() * 10000) + 100,
          title: `📢 New Circular: ${newAnn.title || 'Campus Announcement'}`,
          body: (newAnn.content || 'A new announcement has been published by college administration.').slice(0, 120),
          type: 'announcement',
          url: '/student/announcements/',
          extra: { id: newAnn.id },
        });
      }
    );

    // (B) Placements (Staff / Placement Cell adds a drive)
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'placements' },
      async (payload) => {
        const newDrive = payload.new as any;
        if (!newDrive) return;

        const pkgText = newDrive.package_lpa ? ` | ${newDrive.package_lpa} LPA` : '';
        await sendOutsideNotification({
          id: Math.floor(Math.random() * 10000) + 200,
          title: `💼 New Placement Drive: ${newDrive.company_name || 'Upcoming Company'}`,
          body: `Role: ${newDrive.role || 'Graduate Trainee'}${pkgText} • Eligible students can apply now!`,
          type: 'placement',
          url: '/student/placements/',
          extra: { id: newDrive.id },
        });
      }
    );

    // (C) Study Materials (Staff uploads notes / lab manuals / question banks)
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'study_materials' },
      async (payload) => {
        const newMat = payload.new as any;
        if (!newMat) return;

        const deptSub = [newMat.department_code, newMat.subject_code].filter(Boolean).join(' • ');
        await sendOutsideNotification({
          id: Math.floor(Math.random() * 10000) + 300,
          title: `📚 New Study Material: ${newMat.title || 'Course Material'}`,
          body: `${deptSub ? `[${deptSub}] ` : ''}New academic resource available for download.`,
          type: 'material',
          url: '/student/materials/',
          extra: { id: newMat.id },
        });
      }
    );

    // (D) Direct broadcast channel for instant cross-device updates
    channel.on('broadcast', { event: 'campus_broadcast' }, async ({ payload }) => {
      if (!payload) return;
      await sendOutsideNotification({
        id: Math.floor(Math.random() * 10000) + 400,
        title: payload.title || 'SEC Campus Alert',
        body: payload.body || 'New academic update published.',
        type: payload.type || 'general',
        url: payload.url,
      });
    });

    // (E) Local Window Event for demo & instant triggers
    const handleLocalBroadcast = async (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        await sendOutsideNotification(customEvent.detail);
      }
    };
    window.addEventListener('sec:campus-update', handleLocalBroadcast);

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[NotificationListener] Subscribed to SEC campus realtime updates');
      }
    });

    return () => {
      window.removeEventListener('sec:campus-update', handleLocalBroadcast);
      supabase.removeChannel(channel);
      registeredRef.current = false;
    };
  }, [profile]);

  const handleEnablePermissions = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setShowPrompt(false);
      // Send a welcome confirmation notification
      await sendOutsideNotification({
        title: '🔔 SEC Notifications Activated!',
        body: 'You will receive outside alerts for new placement drives, lecture notes & circulars.',
        type: 'general',
      });
    } else {
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 animate-bounce-in">
      <div className="rounded-2xl bg-gradient-to-r from-[#0F294A] to-[#1468D5] p-4 text-white shadow-2xl border border-blue-400/30 flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
          <Bell className="h-5 w-5 text-amber-300 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Campus Push Alerts
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            </h4>
            <button
              onClick={() => setShowPrompt(false)}
              className="text-white/60 hover:text-white p-0.5 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">
            Get instant notifications outside the app when staff updates Placement drives, Materials, or Circulars!
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleEnablePermissions}
              className="flex-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#1468D5] shadow hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="h-3.5 w-3.5" /> Enable Notifications
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="rounded-xl px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/10"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

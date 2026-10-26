'use client';

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface CampusNotificationPayload {
  id?: number;
  title: string;
  body: string;
  type?: 'placement' | 'material' | 'announcement' | 'general';
  url?: string;
  extra?: Record<string, any>;
}

const CHANNEL_ID = 'sec_campus_updates';
let channelInitialized = false;

/**
 * Initializes notification channel on Android devices.
 * High importance (5) ensures head-up banner outside the app + sound + vibration.
 */
export async function initializeNotificationChannel(): Promise<void> {
  if (channelInitialized) return;
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: 'SEC Campus Updates',
        description: 'Instant alerts for placement drives, study materials & circular notices',
        importance: 5, // High importance -> Heads-up alert on Android
        visibility: 1, // Visible on lock screen
        vibration: true,
        lights: true,
        lightColor: '#1468D5',
      });
      channelInitialized = true;
    } catch (err) {
      console.warn('[NotificationService] Error creating channel:', err);
    }
  }
}

/**
 * Request OS or Browser notification permissions
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      await initializeNotificationChannel();
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') {
        return true;
      }
      const req = await LocalNotifications.requestPermissions();
      return req.display === 'granted';
    }

    // Web Browser Notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        return true;
      }
      if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
    }
  } catch (err) {
    console.warn('[NotificationService] Permission request failed:', err);
  }
  return false;
}

/**
 * Check if permission is already granted
 */
export async function hasNotificationPermission(): Promise<boolean> {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      return status.display === 'granted';
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Send a notification that appears OUTSIDE the app
 * (in Android notification tray / lock screen / desktop banner)
 */
export async function sendOutsideNotification(payload: CampusNotificationPayload): Promise<boolean> {
  const notifId = payload.id || Math.floor(Date.now() % 100000);
  const targetUrl = payload.url || (
    payload.type === 'placement' ? '/student/placements/' :
    payload.type === 'material' ? '/student/materials/' :
    payload.type === 'announcement' ? '/student/announcements/' :
    '/student/notifications/'
  );

  let delivered = false;

  // 1. Native Mobile (Capacitor Android / iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      await initializeNotificationChannel();
      const hasPerm = await requestNotificationPermission();
      if (hasPerm) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: notifId,
              title: payload.title,
              body: payload.body,
              channelId: CHANNEL_ID,
              schedule: { at: new Date(Date.now() + 100) }, // Trigger immediately
              sound: 'beep.wav',
              extra: {
                url: targetUrl,
                type: payload.type,
                ...(payload.extra || {}),
              },
            },
          ],
        });
        delivered = true;
      }
    } catch (nativeErr) {
      console.warn('[NotificationService] Native schedule error:', nativeErr);
    }
  }

  // 2. Web Browser Notification API (Desktop / Mobile Browser / PWA)
  if (!delivered && typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        const notif = new Notification(payload.title, {
          body: payload.body,
          icon: '/images/sec-logo.png',
          badge: '/images/sec-logo.png',
          tag: `sec-${notifId}`,
          data: { url: targetUrl },
        });

        notif.onclick = () => {
          window.focus();
          try {
            window.location.href = targetUrl;
          } catch {
            // ignore
          }
          notif.close();
        };
        delivered = true;
      }
    } catch (webErr) {
      console.warn('[NotificationService] Web notification error:', webErr);
    }
  }

  // Play audio chime if in browser
  try {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  } catch {
    // Ignore audio autoplay restrictions
  }

  return delivered;
}

/**
 * Handle notification click listeners on native app
 */
export function registerNotificationActionListeners(onOpenUrl?: (url: string) => void): void {
  if (Capacitor.isNativePlatform()) {
    LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
      const extra = notificationAction.notification.extra;
      const targetUrl = extra?.url || '/student/';
      if (onOpenUrl) {
        onOpenUrl(targetUrl);
      } else if (typeof window !== 'undefined') {
        window.location.href = targetUrl;
      }
    });
  }
}

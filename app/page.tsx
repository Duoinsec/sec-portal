'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2, ArrowRight } from 'lucide-react';

export default function Home() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [showManualBtn, setShowManualBtn] = useState(false);

  useEffect(() => {
    const navigate = (target: string) => {
      try {
        router.replace(target);
      } catch (err) {
        console.warn('router.replace exception:', err);
      }
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          if (window.location.pathname !== target) {
            window.location.replace(target);
          }
        }, 120);
      }
    };

    if (!loading) {
      if (profile) {
        const route =
          profile.role === 'ADMIN'
            ? '/admin/'
            : profile.role === 'STAFF'
            ? '/staff/'
            : '/student/';
        navigate(route);
      } else {
        navigate('/login/');
      }
    } else {
      // Safety fail-safe: Never wait more than 900ms on initial boot
      const safety = setTimeout(() => {
        let cached = null;
        try {
          const raw = localStorage.getItem('sec_cached_profile');
          if (raw) cached = JSON.parse(raw);
        } catch (_) {}

        if (cached) {
          const route =
            cached.role === 'ADMIN'
              ? '/admin/'
              : cached.role === 'STAFF'
              ? '/staff/'
              : '/student/';
          navigate(route);
        } else {
          navigate('/login/');
        }
      }, 900);

      const manualTimer = setTimeout(() => {
        setShowManualBtn(true);
      }, 1500);

      return () => {
        clearTimeout(safety);
        clearTimeout(manualTimer);
      };
    }
  }, [profile, loading, router]);

  const handleManualNav = () => {
    if (typeof window !== 'undefined') {
      const target = profile
        ? profile.role === 'ADMIN'
          ? '/admin/'
          : profile.role === 'STAFF'
          ? '/staff/'
          : '/student/'
        : '/login/';
      window.location.replace(target);
    }
  };

  return (
    <div
      onClick={handleManualNav}
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FBFF',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        cursor: 'pointer',
      }}
      className="flex min-h-screen items-center justify-center bg-[#F8FBFF] cursor-pointer"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
        className="flex flex-col items-center gap-4"
      >
        <div
          style={{
            height: '64px',
            width: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1468D5, #123B73)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px -5px rgba(20, 104, 213, 0.4)',
          }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1468D5] to-[#123B73] shadow-lg transition-transform active:scale-95"
        >
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px' }} className="text-white font-bold text-lg">
            SEC
          </span>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-[#1468D5]" />
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }} className="text-sm text-[#6B7280]">
          Loading SEC AI Assistant...
        </p>

        {showManualBtn && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleManualNav();
            }}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1468D5] text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <span>Continue to Login</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

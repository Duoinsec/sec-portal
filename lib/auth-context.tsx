'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; profile?: Profile | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null, profile: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('sec_cached_profile');
        if (cached) return JSON.parse(cached);
      } catch (_) {}
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        // If we already have a cached profile or if we know for sure there is no supabase token, don't block
        const cached = localStorage.getItem('sec_cached_profile');
        if (cached) return false;
      } catch (_) {}
    }
    return true;
  });

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Enforce 1000ms maximum timeout so loading never hangs when offline or on mobile
        const sessionPromise = supabase.auth.getSession().catch((err) => {
          console.warn('[Auth] getSession warning:', err);
          return { data: { session: null }, error: err };
        });

        const timeoutPromise = new Promise<{ data: { session: null }; error: null }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null }, error: null }), 1000)
        );

        const result = await Promise.race([sessionPromise, timeoutPromise]);
        const existingSession = result?.data?.session ?? null;

        if (!mounted) return;

        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', existingSession.user.id)
              .maybeSingle();
            if (mounted && data) {
              setProfile(data as Profile);
              try {
                localStorage.setItem('sec_cached_profile', JSON.stringify(data));
              } catch (_) {}
            }
          } catch (profileErr) {
            console.warn('[Auth] Error fetching profile:', profileErr);
          }
        } else {
          // If no active session, clear profile
          if (mounted) {
            setProfile(null);
            try {
              localStorage.removeItem('sec_cached_profile');
            } catch (_) {}
          }
        }
      } catch (err) {
        console.warn('[Auth] Init auth exception:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      (async () => {
        try {
          if (!mounted) return;
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .maybeSingle();
            if (mounted) {
              setProfile(data as Profile | null);
              if (data) {
                try {
                  localStorage.setItem('sec_cached_profile', JSON.stringify(data));
                } catch (_) {}
              }
            }
          } else {
            if (mounted) {
              setProfile(null);
              try {
                localStorage.removeItem('sec_cached_profile');
              } catch (_) {}
            }
          }
        } catch (stateErr) {
          console.warn('[Auth] onAuthStateChange warning:', stateErr);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim();
      const authPromise = supabase.auth.signInWithPassword({ email: cleanEmail, password });
      const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error('Connection timed out. Please check your internet connection.')
            ),
          8000
        )
      );

      const { data, error } = await Promise.race([authPromise, timeoutPromise]);
      if (error) return { error: error.message || 'Invalid email or password', profile: null };

      if (data?.user) {
        setSession(data.session);
        setUser(data.user);

        let fetchedProfile: Profile | null = null;
        try {
          const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          const profileTimeout = new Promise<{ data: any; error: any }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: null }), 3000)
          );
          const { data: profileData } = await Promise.race([profilePromise, profileTimeout]);
          fetchedProfile = profileData as Profile | null;
        } catch (err) {
          console.warn('[Auth] Profile fetch warning:', err);
        }

        if (!fetchedProfile) {
          const lowerEmail = cleanEmail.toLowerCase();
          const metaRole =
            (data.user.user_metadata?.role as UserRole) ||
            (lowerEmail.includes('admin')
              ? 'ADMIN'
              : lowerEmail.includes('staff')
              ? 'STAFF'
              : 'STUDENT');
          fetchedProfile = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            role: metaRole,
            avatar_url: null,
            phone: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }

        setProfile(fetchedProfile);
        try {
          localStorage.setItem('sec_cached_profile', JSON.stringify(fetchedProfile));
        } catch (_) {}
        setLoading(false);
        return { error: null, profile: fetchedProfile };
      }

      return { error: 'Authentication failed. Please try again.', profile: null };
    } catch (err: any) {
      console.error('[Auth] signIn exception:', err);
      return { error: err?.message || 'Login failed. Please try again.', profile: null };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('sec_cached_profile');
    } catch (_) {}
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    setProfile(data as Profile | null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

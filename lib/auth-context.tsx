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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Enforce 2.5s maximum timeout so loading never hangs when offline or on mobile
        const sessionPromise = supabase.auth.getSession().catch((err) => {
          console.warn('[Auth] getSession warning:', err);
          return { data: { session: null }, error: err };
        });

        const timeoutPromise = new Promise<{ data: { session: null }; error: null }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null }, error: null }), 2500)
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
            if (mounted) setProfile(data as Profile | null);
          } catch (profileErr) {
            console.warn('[Auth] Error fetching profile:', profileErr);
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
            if (mounted) setProfile(data as Profile | null);
          } else {
            if (mounted) setProfile(null);
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, profile: null };

    if (data?.user) {
      setSession(data.session);
      setUser(data.user);

      let fetchedProfile: Profile | null = null;
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        fetchedProfile = profileData as Profile | null;
      } catch (err) {
        console.error('Error fetching profile during signIn:', err);
      }

      if (!fetchedProfile) {
        const lowerEmail = email.toLowerCase();
        const metaRole = (data.user.user_metadata?.role as UserRole) ||
          (lowerEmail.includes('admin') ? 'ADMIN' : lowerEmail.includes('staff') ? 'STAFF' : 'STUDENT');
        fetchedProfile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          role: metaRole,
          avatar_url: null,
          phone: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      setProfile(fetchedProfile);
      setLoading(false);
      return { error: null, profile: fetchedProfile };
    }

    return { error: null, profile: null };
  };

  const signOut = async () => {
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

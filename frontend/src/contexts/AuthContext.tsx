import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, type Profile } from '../lib/supabase';
import { dashboardCache } from '../lib/dashboardCache';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null, user: null, profile: null, loading: true,
  refreshProfile: async () => {}, signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data ?? null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  useEffect(() => {
    // Safety valve: if getSession or loadProfile hang, unblock the app after 10s.
    const fallback = setTimeout(() => setLoading(false), 10000);

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          try { await loadProfile(session.user.id); } catch { /* proceed without profile */ }
        }
      })
      .catch(() => {})
      .finally(() => { clearTimeout(fallback); setLoading(false); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        try { await loadProfile(session.user.id); } catch { /* proceed without profile */ }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    dashboardCache.clear();
    await supabase.auth.signOut().catch(() => {});
    // Force-clear state immediately so the UI responds even if the
    // onAuthStateChange callback is delayed or the network call failed.
    setSession(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      session, user: session?.user ?? null, profile, loading, refreshProfile, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

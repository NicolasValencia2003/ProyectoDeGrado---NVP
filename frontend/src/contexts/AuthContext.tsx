import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, type Profile } from '../lib/supabase';
import { dashboardCache } from '../lib/dashboardCache';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoaded: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null, user: null, profile: null, loading: true, profileLoaded: false,
  refreshProfile: async () => {}, signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession]         = useState<Session | null>(null);
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [loading, setLoading]         = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  // Track the user id currently being loaded to avoid stale updates from concurrent calls.
  const loadingForRef = useRef<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    loadingForRef.current = userId;
    setProfileLoaded(false);

    let data: Profile | null = null;
    try {
      // Retry with per-attempt timeout so a hanging query never blocks the UI.
      // Supabase client sometimes needs a moment to propagate the new JWT before RLS sees auth.uid().
      for (let attempt = 0; attempt < 4; attempt++) {
        const queryPromise = supabase.from('profiles').select('*').eq('id', userId).single();
        const timeoutPromise = new Promise<{ data: null }>(resolve =>
          setTimeout(() => resolve({ data: null }), 2500),
        );
        const result = await Promise.race([queryPromise, timeoutPromise]);
        data = (result as { data: Profile | null }).data;
        if (data) break;
        if (attempt < 3) await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
      }

      if (data) {
        // Persist a copy so returning users can bypass an offline/slow Supabase.
        localStorage.setItem(`finvise_profile_${userId}`, JSON.stringify(data));
      } else {
        // Supabase didn't respond — fall back to the last known profile for this user
        // so they aren't bounced back to onboarding/disclaimer incorrectly.
        const cached = localStorage.getItem(`finvise_profile_${userId}`);
        if (cached) data = JSON.parse(cached) as Profile;
      }
    } catch {
      const cached = localStorage.getItem(`finvise_profile_${userId}`);
      if (cached) data = JSON.parse(cached) as Profile;
    } finally {
      // Always release the loading flag so the app never stays stuck.
      if (loadingForRef.current === userId) {
        setProfile(data ?? null);
        setProfileLoaded(true);
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  useEffect(() => {
    // Safety valve: if getSession or loadProfile hang, unblock the app after 10s.
    const fallback = setTimeout(() => { setLoading(false); setProfileLoaded(true); }, 10000);

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          try { await loadProfile(session.user.id); } catch { setProfileLoaded(true); }
        } else {
          setProfileLoaded(true);
        }
      })
      .catch(() => { setProfileLoaded(true); })
      .finally(() => { clearTimeout(fallback); setLoading(false); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        // Defer one tick so the Supabase client updates its internal JWT before
        // we run any query — otherwise RLS sees auth.uid() as null and blocks reads.
        await new Promise(r => setTimeout(r, 0));
        try { await loadProfile(session.user.id); } catch { setProfileLoaded(true); }
      } else {
        loadingForRef.current = null;
        setProfile(null);
        setProfileLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(() => {
    dashboardCache.clear();
    // Profile cache (finvise_profile_<id>) is intentionally kept so returning users
    // never get bounced back to onboarding if Supabase is slow on their next login.
    loadingForRef.current = null;
    setSession(null);
    setProfile(null);
    setProfileLoaded(true);
    // Fire-and-forget: clear local token immediately, then revoke server-side in background.
    supabase.auth.signOut({ scope: 'local' }).catch(() => {});
  }, [session]);

  return (
    <AuthContext.Provider value={{
      session, user: session?.user ?? null, profile, loading, profileLoaded, refreshProfile, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

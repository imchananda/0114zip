'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  role: string;
  points: number;
  level: number;
  badges: string[];
  bio: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowser();

  const fetchProfile = async (userId: string, retries = 3, delay = 1000) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
      
      if (error) {
        // Handle transient connection errors (e.g., Supabase instance waking up or proxy timeouts)
        const isTransientError = 
          error.message.includes('upstream connect error') || 
          error.message.includes('timeout') || 
          error.message.includes('stole it') ||
          error.code === '503' ||
          error.code === '502' ||
          error.code === '504';

        if (retries > 0 && isTransientError) {
          console.warn(`[AuthContext] Transient error fetching profile. Retrying in ${delay}ms... (${retries} retries left). Error: ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, delay));
          // Exponential backoff
          return fetchProfile(userId, retries - 1, delay * 1.5);
        }
        
        console.error('Failed to fetch user profile:', error.message);
        return;
      }
      
      if (data) setProfile(data as UserProfile);
    } catch (err: any) {
      if (retries > 0) {
        console.warn(`[AuthContext] Exception fetching profile. Retrying in ${delay}ms... (${retries} retries left).`, err);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchProfile(userId, retries - 1, delay * 1.5);
      }
      console.error('Failed to fetch user profile:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;

    const initialize = async () => {
      try {
        const { data: { user: verifiedUser } } = await supabase.auth.getUser();
        if (!isMounted) return;
        
        setUser(verifiedUser ?? null);
        if (verifiedUser) {
          await fetchProfile(verifiedUser.id);
        }
        if (isMounted) setLoading(false);

        // Subscribe only AFTER initial fetch to prevent concurrent lock stealing
        const { data } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
          if (!isMounted || event === 'INITIAL_SESSION') return;
          
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        });
        subscription = data.subscription;
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) setLoading(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (subscription) subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const isSuperAdmin = profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isSuperAdmin, signIn, signUp, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

'use client';

import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { trackAuth } from '@/lib/analytics';
import posthog from 'posthog-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
        });
      }
      setLoading(false);
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
        });
      } else {
        posthog.reset();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (data.user && !error) {
      // Create user profile
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email!,
        name,
      });
    }

    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Track successful logout
      trackAuth({
        method: 'email',
        action: 'logout',
        success: true,
      });
      
      posthog.reset();
      
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'A apărut o eroare';
      
      // Track failed logout
      trackAuth({
        method: 'email',
        action: 'logout',
        success: false,
        error: errorMessage,
      });
    }
  };

  return { session, user, loading, signIn, signUp, signInWithGoogle, signOut };
} 
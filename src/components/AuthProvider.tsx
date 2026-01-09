"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ 
  session: null, 
  user: null, 
  profile: null,
  loading: true,
  refreshProfile: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkAndFetchProfile = async (userId: string) => {
    try {
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Vérification de l'expiration Premium
      if (prof.is_premium && prof.subscription_expires_at) {
        const expiresAt = new Date(prof.subscription_expires_at);
        if (expiresAt < new Date()) {
          console.log("[AuthProvider] Subscription expired. Updating status...");
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              is_premium: false, 
              subscription_status: 'free',
              subscription_plan: null 
            })
            .eq('id', userId);
          
          if (!updateError) {
            prof.is_premium = false;
            prof.subscription_status = 'free';
          }
        }
      }

      setProfile(prof);
    } catch (err) {
      console.error("[AuthProvider] Error loading profile:", err);
    }
  };

  const refreshProfile = async () => {
    if (user) await checkAndFetchProfile(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) checkAndFetchProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) checkAndFetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
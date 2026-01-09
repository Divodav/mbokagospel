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
      setProfile(prof);
    } catch (err) {
      console.error("[AuthProvider] Error loading profile:", err);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) await checkAndFetchProfile(user.id);
  };

  useEffect(() => {
    // Récupération initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) checkAndFetchProfile(session.user.id);
      setLoading(false);
    });

    // Écoute des changements d'état
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log(`[AuthProvider] Auth Event: ${event}`);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_IN' && currentSession?.user) {
        checkAndFetchProfile(currentSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        // On s'assure que le cache local est vidé
        localStorage.removeItem('supabase.auth.token');
      }
      
      setLoading(false);
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
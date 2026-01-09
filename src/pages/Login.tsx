"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

export default function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate('/');
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080405] p-4 mesh-gradient">
      <div className="w-full max-w-md glass-main p-8 rounded-3xl border-white/10 shadow-2xl">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles size={32} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight">Mboka Gospel</h1>
            <p className="text-gray-400 text-sm">Espace Artiste & Adorateur</p>
          </div>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#D64E8B',
                  brandAccent: '#C13E78',
                },
              },
            },
            className: {
              container: 'auth-container',
              button: 'auth-button',
              input: 'auth-input',
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
              },
              sign_up: {
                button_label: 'Créer un compte',
                password_label: 'Mot de passe',
                email_label: 'Adresse email',
              }
            }
          }}
          theme="dark"
          providers={['google']}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
}
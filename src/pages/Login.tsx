"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

export default function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  // URL de redirection dynamique
  const getRedirectUrl = () => {
    return window.location.origin;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080405] p-4 mesh-gradient">
      <div className="w-full max-w-md glass-main p-8 rounded-3xl border-white/10 shadow-2xl relative overflow-hidden">
        {/* Bouton retour */}
        <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>

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
                  inputBackground: 'rgba(255, 255, 255, 0.05)',
                  inputText: 'white',
                  inputBorder: 'rgba(255, 255, 255, 0.1)',
                },
              },
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
                social_provider_text: 'Continuer avec {{provider}}',
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
          redirectTo={getRedirectUrl()}
          // Force l'utilisation des providers tiers si configurés
          onlyThirdPartyProviders={false}
        />
        
        <p className="mt-8 text-center text-[10px] text-gray-500 font-medium uppercase tracking-widest">
          En continuant, vous acceptez nos conditions d'utilisation.
        </p>
      </div>
    </div>
  );
}
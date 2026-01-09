"use client";

import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SubscriptionViewProps {
  onSubscribe: (plan: 'monthly' | 'yearly') => void;
}

export const SubscriptionView = ({ onSubscribe }: SubscriptionViewProps) => {
  const plans = [
    {
      id: 'monthly',
      name: 'Mensuel',
      price: '3',
      period: '/ mois',
      description: 'Idéal pour essayer Mboka Premium',
      features: ['Qualité audio supérieure', 'Écoute sans publicité', 'Mode hors-ligne', 'Badge Premium'],
      highlight: false
    },
    {
      id: 'yearly',
      name: 'Annuel',
      price: '25',
      period: '/ an',
      description: 'Économisez 30% par rapport au plan mensuel',
      features: ['Tout le plan Mensuel', '2 mois offerts', 'Soutien prioritaire aux artistes', 'Accès avant-premières'],
      highlight: true,
      badge: 'MEILLEURE OFFRE'
    }
  ];

  return (
    <div className="py-4 md:py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-2">
          <Crown size={14} className="text-primary fill-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Mboka Premium</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-black tracking-tighter">Élevez votre expérience de louange</h2>
        <p className="text-gray-500 text-xs md:text-sm max-w-md mx-auto">Soutenez les artistes et profitez de votre musique sans aucune interruption.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <motion.div 
            key={plan.id}
            whileHover={{ y: -5 }}
            className={cn(
              "relative glass-card-pro p-6 flex flex-col gap-6",
              plan.highlight ? "border-primary/50 bg-primary/[0.02]" : "border-white/5"
            )}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg shadow-primary/30">
                {plan.badge}
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-lg font-black">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{plan.price}$</span>
                <span className="text-gray-500 text-sm font-bold">{plan.period}</span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">{plan.description}</p>
            </div>

            <div className="space-y-3 flex-1">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                  <span className="text-[12px] font-medium text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => onSubscribe(plan.id as 'monthly' | 'yearly')}
              className={cn(
                "w-full h-11 rounded-xl font-black text-xs transition-all",
                plan.highlight 
                  ? "bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20" 
                  : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
              )}
            >
              CHOISIR CE PLAN
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 pt-4">
        <p className="text-[10px] text-gray-600 font-medium max-w-xs text-center">
          Paiement sécurisé. Annulable à tout moment depuis les paramètres de votre compte Apple ou Google.
        </p>
        <div className="flex gap-6">
          <button className="text-[10px] font-bold text-gray-500 hover:text-white underline">Conditions d'utilisation</button>
          <button className="text-[10px] font-bold text-gray-500 hover:text-white underline">Politique de confidentialité</button>
        </div>
      </div>
    </div>
  );
};
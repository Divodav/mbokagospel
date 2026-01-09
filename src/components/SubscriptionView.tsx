"use client";

import { Check, Crown, Sparkles, Zap, ShieldCheck, Star } from "lucide-react";
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
      description: 'Découvrez la puissance de la louange sans limites.',
      features: [
        'Qualité audio Hi-Fi (320kbps)',
        'Écoute 100% sans publicité',
        'Téléchargements illimités',
        'Badge "Adorateur" sur votre profil'
      ],
      highlight: false,
      cta: 'Commencer l\'essai'
    },
    {
      id: 'yearly',
      name: 'Annuel',
      price: '25',
      period: '/ an',
      description: 'L\'expérience ultime pour les vrais passionnés.',
      features: [
        'Tout le plan Mensuel inclus',
        'Économisez 11$ (environ 30%)',
        'Accès exclusif aux avant-premières',
        'Support VIP prioritaire 24/7',
        'Soutien direct aux ministères'
      ],
      highlight: true,
      badge: 'MEILLEURE VALEUR',
      cta: 'Devenir Membre Or'
    }
  ];

  return (
    <div className="py-8 md:py-16 space-y-12 max-w-6xl mx-auto px-4">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 mb-4">
          <Sparkles size={14} className="text-primary animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Offre Exclusive Mboka</span>
        </div>
        
        <h2 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          Élevez votre Adoration <br className="hidden md:block" /> au Niveau Supérieur
        </h2>
        
        <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          Rejoignez des milliers de chrétiens et profitez d'une expérience musicale <br className="hidden md:block" /> 
          pure, sans interruption et en haute fidélité.
        </p>
      </motion.div>

      {/* Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto relative">
        {/* Decorative Light Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        {plans.map((plan, index) => (
          <motion.div 
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.01 }}
            className={cn(
              "group relative p-8 md:p-10 flex flex-col gap-8 rounded-[2.5rem] transition-all duration-500",
              "backdrop-blur-3xl border",
              plan.highlight 
                ? "bg-gradient-to-br from-primary/[0.08] to-primary/[0.01] border-primary/30 shadow-[0_0_40px_rgba(214,78,139,0.15)]" 
                : "bg-white/[0.03] border-white/10 hover:border-white/20"
            )}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl shadow-primary/30 tracking-widest uppercase">
                {plan.badge}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{plan.description}</p>
                </div>
                <div className={cn(
                  "p-3 rounded-2xl",
                  plan.highlight ? "bg-primary/20 text-primary" : "bg-white/5 text-gray-400"
                )}>
                  {plan.highlight ? <Crown size={24} /> : <Star size={24} />}
                </div>
              </div>

              <div className="flex items-baseline gap-1 py-4 border-b border-white/5">
                <span className="text-5xl md:text-6xl font-black tracking-tighter tabular-nums">{plan.price}$</span>
                <span className="text-gray-500 text-lg font-bold">{plan.period}</span>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">Ce qui est inclus :</p>
              <div className="space-y-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 group/item">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      plan.highlight ? "bg-primary/20 text-primary" : "bg-white/10 text-white/40"
                    )}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-sm md:text-base font-semibold text-white/80 group-hover/item:text-white transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={() => onSubscribe(plan.id as 'monthly' | 'yearly')}
              className={cn(
                "w-full h-14 rounded-2xl font-black text-sm transition-all duration-300 transform active:scale-95",
                plan.highlight 
                  ? "bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/40 hover:shadow-primary/60" 
                  : "bg-white hover:bg-gray-100 text-black shadow-xl"
              )}
            >
              {plan.cta}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Trust Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="pt-12 flex flex-col items-center gap-8 border-t border-white/5"
      >
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} />
            <span className="text-xs font-black tracking-widest uppercase">Paiement 100% Sécurisé</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={20} />
            <span className="text-xs font-black tracking-widest uppercase">Activation Instantanée</span>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-[11px] text-gray-500 font-bold max-w-lg leading-relaxed uppercase tracking-wider">
            Votre abonnement sera débité de votre compte iTunes ou Google Play Store. <br />
            Annulation possible à tout moment sans frais cachés.
          </p>
          <div className="flex justify-center gap-8">
            <button className="text-[10px] font-black text-gray-400 hover:text-primary transition-colors underline-offset-4 hover:underline uppercase tracking-tighter">Conditions</button>
            <button className="text-[10px] font-black text-gray-400 hover:text-primary transition-colors underline-offset-4 hover:underline uppercase tracking-tighter">Confidentialité</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
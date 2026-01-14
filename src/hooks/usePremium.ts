/**
 * Hook pour gérer le statut premium de l'utilisateur
 * Vérifie l'abonnement et les fonctionnalités disponibles
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import {
    Subscription,
    SubscriptionPlan,
    PremiumFeatures,
    PLAN_FEATURES
} from '@/types/subscription';

interface UsePremiumReturn {
    isPremium: boolean;
    subscription: Subscription | null;
    plan: SubscriptionPlan;
    features: PremiumFeatures;
    isLoading: boolean;
    error: string | null;
    refreshSubscription: () => Promise<void>;
    canDownloadOffline: boolean;
    remainingDownloads: number;
}

export const usePremium = (): UsePremiumReturn => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadCount, setDownloadCount] = useState(0);

    const fetchSubscription = useCallback(async () => {
        if (!user) {
            setSubscription(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Fetch user's active subscription
            // For now, we'll check the profiles table for premium status
            // In a full implementation, this would query a subscriptions table
            const { data: profile, error: profError } = await supabase
                .from('profiles')
                .select('is_premium, premium_plan, premium_expires_at')
                .eq('id', user.id)
                .single();

            if (profError) {
                // If columns don't exist yet, default to free
                console.log('[usePremium] Profile data not available, defaulting to free');
                setSubscription(null);
                setIsLoading(false);
                return;
            }

            if (profile?.is_premium && profile?.premium_expires_at) {
                const expiresAt = new Date(profile.premium_expires_at);
                const now = new Date();

                if (expiresAt > now) {
                    setSubscription({
                        id: `sub_${user.id}`,
                        user_id: user.id,
                        plan: (profile.premium_plan as SubscriptionPlan) || 'monthly',
                        status: 'active',
                        started_at: '',
                        expires_at: profile.premium_expires_at,
                        auto_renew: true,
                        created_at: '',
                        updated_at: '',
                    });
                } else {
                    setSubscription(null);
                }
            } else {
                setSubscription(null);
            }

            // Get download count for limit checking
            // This would be stored in IndexedDB or a local table
            const storedCount = localStorage.getItem(`download_count_${user.id}`);
            setDownloadCount(storedCount ? parseInt(storedCount, 10) : 0);

        } catch (err) {
            console.error('[usePremium] Error:', err);
            setError('Erreur lors de la vérification du statut premium');
            setSubscription(null);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    const plan: SubscriptionPlan = subscription?.plan || 'free';
    const features = PLAN_FEATURES[plan];
    const isPremium = subscription?.status === 'active';

    const remainingDownloads = features.maxDownloads === -1
        ? Infinity
        : Math.max(0, features.maxDownloads - downloadCount);

    const canDownloadOffline = isPremium && features.offlineDownloads && remainingDownloads > 0;

    return {
        isPremium,
        subscription,
        plan,
        features,
        isLoading,
        error,
        refreshSubscription: fetchSubscription,
        canDownloadOffline,
        remainingDownloads,
    };
};

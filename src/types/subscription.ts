/**
 * Types pour le système d'abonnement premium
 * Structure extensible pour un futur système d'abonnement complet
 */

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';

export type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'cancelled';

export interface Subscription {
    id: string;
    user_id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    started_at: string;
    expires_at: string;
    auto_renew: boolean;
    created_at: string;
    updated_at: string;
}

export interface PremiumFeatures {
    offlineDownloads: boolean;
    highQualityAudio: boolean;
    noAds: boolean;
    exclusiveContent: boolean;
    maxDownloads: number; // -1 for unlimited
}

export const PLAN_FEATURES: Record<SubscriptionPlan, PremiumFeatures> = {
    free: {
        offlineDownloads: false,
        highQualityAudio: false,
        noAds: false,
        exclusiveContent: false,
        maxDownloads: 0,
    },
    monthly: {
        offlineDownloads: true,
        highQualityAudio: true,
        noAds: true,
        exclusiveContent: false,
        maxDownloads: 50,
    },
    yearly: {
        offlineDownloads: true,
        highQualityAudio: true,
        noAds: true,
        exclusiveContent: true,
        maxDownloads: -1, // Unlimited
    },
};

export interface DownloadedSong {
    id: string;
    song_id: string;
    title: string;
    artist_name: string;
    cover_url: string;
    local_audio_path: string;
    local_cover_path: string;
    downloaded_at: string;
    file_size: number;
    duration?: number;
    // Protection data
    user_id: string;
    checksum: string;
}

export interface DownloadProgress {
    song_id: string;
    progress: number; // 0-100
    status: 'pending' | 'downloading' | 'completed' | 'failed';
    error?: string;
}

import { useState, useEffect } from 'react';

type AudioQuality = 'standard' | 'high';

export const useAudioQuality = () => {
    const [quality, setQuality] = useState<AudioQuality>('standard');

    useEffect(() => {
        const stored = localStorage.getItem('audio_quality');
        if (stored === 'high' || stored === 'standard') {
            setQuality(stored);
        }
    }, []);

    const changeQuality = (newQuality: AudioQuality) => {
        setQuality(newQuality);
        localStorage.setItem('audio_quality', newQuality);
    };

    return { quality, changeQuality };
};

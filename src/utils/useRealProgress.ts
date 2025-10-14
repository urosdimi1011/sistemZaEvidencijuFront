// hooks/useRealProgress.ts
import { useState, useCallback, useEffect } from 'react';

export const useRealProgress = () => {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const calculateRealProgress = useCallback(() => {
        // Koristimo Performance API za praćenje učitavanja resursa
        const resources = performance.getEntriesByType('resource');
        const totalResources = resources.length;

        if (totalResources === 0) return 0;

        // Brojimo koliko resursa je već učitano
        const loadedResources = resources.filter((resource: PerformanceResourceTiming) => {
            return resource.duration > 0 && resource.transferSize > 0;
        }).length;

        // Računamo progres na osnovu učitanih resursa
        return Math.min(90, Math.round((loadedResources / totalResources) * 90));
    }, []);

    const startRealProgressTracking = useCallback(() => {
        setIsLoading(true);
        setProgress(0);

        // Prvo postavimo osnovni progres za HTML parsing
        setProgress(10);

        // Pratimo DOMContentLoaded event (HTML je parsiran)
        const handleDOMContentLoaded = () => {
            setProgress(40);
        };

        // Pratimo load event (svi resursi su učitaní)
        const handleLoad = () => {
            setProgress(100);
            setTimeout(() => setIsLoading(false), 300);
        };

        // Interval za praćenje progresa tokom učitavanja resursa
        const progressInterval = setInterval(() => {
            const newProgress = calculateRealProgress();
            if (newProgress > progress) {
                setProgress(newProgress);
            }
        }, 100);

        // Event listeneri
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
            window.addEventListener('load', handleLoad);
        } else if (document.readyState === 'interactive') {
            setProgress(40);
        } else if (document.readyState === 'complete') {
            setProgress(100);
            setIsLoading(false);
        }

        return () => {
            clearInterval(progressInterval);
            document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
            window.removeEventListener('load', handleLoad);
        };
    }, [calculateRealProgress]);

    return {
        progress,
        isLoading,
        startRealProgressTracking
    };
};
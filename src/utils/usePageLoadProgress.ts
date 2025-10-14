import { useState, useCallback, useEffect } from 'react';

export const usePageLoadProgress = () => {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const simulateProgress = useCallback(() => {
        setIsLoading(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 5;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const completeLoading = useCallback(() => {
        setProgress(100);
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    }, []);

    const resetLoading = useCallback(() => {
        setIsLoading(false);
        setProgress(0);
    }, []);

    return {
        progress,
        isLoading,
        simulateProgress,
        completeLoading,
        resetLoading
    };
};
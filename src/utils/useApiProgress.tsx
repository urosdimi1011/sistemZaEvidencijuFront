// utils/useApiProgress.js
import { useState, useCallback, useRef } from 'react';

export const useApiProgress = () => {
    const [apiProgress, setApiProgress] = useState(0);
    const [isApiLoading, setIsApiLoading] = useState(false);
    const intervalRef = useRef(null);

    const startApiProgress = useCallback(() => {
        setIsApiLoading(true);
        setApiProgress(0);

        // Očistimo prethodni interval ako postoji
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setApiProgress(prev => {
                if (prev >= 90) {
                    clearInterval(intervalRef.current);
                    return 90;
                }
                return prev + 10;
            });
        }, 300);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const completeApiProgress = useCallback(() => {
        // Očistimo interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        setApiProgress(100);
        setTimeout(() => {
            setIsApiLoading(false);
        }, 300);
    }, []);

    const resetApiProgress = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsApiLoading(false);
        setApiProgress(0);
    }, []);

    return {
        apiProgress,
        isApiLoading,
        startApiProgress,
        completeApiProgress,
        resetApiProgress
    };
};
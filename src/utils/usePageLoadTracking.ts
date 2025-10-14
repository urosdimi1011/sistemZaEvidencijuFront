import { useEffect } from 'react';

export const usePageLoadTracking = (onComplete: () => void) => {
    useEffect(() => {
        const handleLoad = () => {
            onComplete();
        };

        const handleDOMContentLoaded = () => {
            setTimeout(onComplete, 500);
        };

        if (document.readyState === 'complete') {
            onComplete();
        } else {
            window.addEventListener('load', handleLoad);
            document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
        }

        return () => {
            window.removeEventListener('load', handleLoad);
            document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
        };
    }, [onComplete]);
};
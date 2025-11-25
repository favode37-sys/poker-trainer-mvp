import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed: number = 30, startDelay: number = 0) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setDisplayedText('');
        setIsComplete(false);

        if (!text) return;

        const timeout = setTimeout(() => {
            let currentIndex = 0;

            const interval = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText(text.substring(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    setIsComplete(true);
                    clearInterval(interval);
                }
            }, speed);

            return () => clearInterval(interval);
        }, startDelay);

        return () => clearTimeout(timeout);
    }, [text, speed, startDelay]);

    return { displayedText, isComplete };
}

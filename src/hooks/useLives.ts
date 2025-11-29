import { useState, useEffect } from 'react';

const MAX_LIVES = 5;
const REFILL_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function useLives() {
    // Initialize from storage or default
    const [lives, setLives] = useState<number>(() => {
        const saved = localStorage.getItem('poker_lives');
        return saved ? parseInt(saved, 10) : MAX_LIVES;
    });

    const [lastRefill, setLastRefill] = useState<number>(() => {
        const saved = localStorage.getItem('poker_last_refill');
        return saved ? parseInt(saved, 10) : Date.now();
    });

    // Save to storage
    useEffect(() => {
        localStorage.setItem('poker_lives', lives.toString());
        localStorage.setItem('poker_last_refill', lastRefill.toString());
    }, [lives, lastRefill]);

    // Passive Regeneration Logic
    useEffect(() => {
        if (lives >= MAX_LIVES) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const timePassed = now - lastRefill;

            if (timePassed >= REFILL_INTERVAL_MS) {
                const livesToAdd = Math.floor(timePassed / REFILL_INTERVAL_MS);
                if (livesToAdd > 0) {
                    setLives(prev => Math.min(MAX_LIVES, prev + livesToAdd));
                    setLastRefill(now); // Reset timer
                }
            }
        }, 1000); // Check every second

        return () => clearInterval(interval);
    }, [lives, lastRefill]);

    const loseLife = () => {
        if (lives > 0) {
            setLives(l => l - 1);
            if (lives === MAX_LIVES) {
                // Start timer if we drop from full
                setLastRefill(Date.now());
            }
        }
    };

    const refillFull = () => {
        setLives(MAX_LIVES);
        setLastRefill(Date.now());
    };

    // Calculate time remaining for next heart
    const getNextRefillTime = (): string => {
        if (lives >= MAX_LIVES) return 'Full';
        const now = Date.now();
        const timePassed = now - lastRefill;
        const remaining = Math.max(0, REFILL_INTERVAL_MS - timePassed);
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return {
        lives,
        maxLives: MAX_LIVES,
        loseLife,
        refillFull,
        timeToNextLife: getNextRefillTime()
    };
}

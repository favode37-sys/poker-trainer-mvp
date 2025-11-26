import { useState, useEffect } from 'react';

const STORAGE_KEY_BANKROLL = 'poker-trainer-bankroll';
const STORAGE_KEY_STREAK = 'poker-trainer-streak';
const STORAGE_KEY_LAST_PLAYED = 'poker-trainer-last-played';
const STORAGE_KEY_COMPLETED_LEVELS = 'poker-trainer-completed-levels';

export function usePlayerState() {
    // --- BANKROLL STATE ---
    const [bankroll, setBankroll] = useState<number>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_BANKROLL);
        return saved ? parseInt(saved, 10) : 1000; // Start with 1000 BB
    });

    // --- STREAK STATE ---
    const [streak, setStreak] = useState<number>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_STREAK);
        return saved ? parseInt(saved, 10) : 0;
    });

    // --- COMPLETED LEVELS STATE ---
    const [completedLevels, setCompletedLevels] = useState<string[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_COMPLETED_LEVELS);
        return saved ? JSON.parse(saved) : [];
    });

    // --- PERSISTENCE ---
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_BANKROLL, bankroll.toString());
    }, [bankroll]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_STREAK, streak.toString());
    }, [streak]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_COMPLETED_LEVELS, JSON.stringify(completedLevels));
    }, [completedLevels]);

    // --- ACTIONS ---

    const updateBankroll = (amount: number) => {
        setBankroll(prev => Math.max(0, prev + amount));
    };

    const completeLevel = (levelId: string) => {
        setCompletedLevels(prev => {
            if (!prev.includes(levelId)) {
                return [...prev, levelId];
            }
            return prev;
        });
        checkStreak();
    };

    const resetProgress = () => {
        setCompletedLevels([]);
        setBankroll(1000);
        setStreak(0);
        localStorage.removeItem(STORAGE_KEY_COMPLETED_LEVELS);
        localStorage.removeItem(STORAGE_KEY_BANKROLL);
        localStorage.removeItem(STORAGE_KEY_STREAK);
        localStorage.removeItem(STORAGE_KEY_LAST_PLAYED);
    };

    // Call this when the user completes a lesson/scenario
    const checkStreak = () => {
        const today = new Date().toDateString();
        const lastPlayed = localStorage.getItem(STORAGE_KEY_LAST_PLAYED);

        if (lastPlayed !== today) {
            // It's a new day or first time
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastPlayed === yesterday.toDateString()) {
                // Played yesterday -> Increment streak
                setStreak(s => s + 1);
            } else {
                // Streak broken (or first play) -> Reset to 1
                setStreak(1);
            }
            // Save today as last played
            localStorage.setItem(STORAGE_KEY_LAST_PLAYED, today);
        }
    };

    // Daily Top-up (Bankruptcy Protection)
    // If user is broke (< 50 BB), give them a small loan on reload
    useEffect(() => {
        if (bankroll < 50) {
            // In a real app, this would be an ad or timer. For MVP: Free top-up.
            setBankroll(100);
        }
    }, []);

    return {
        completedLevels,
        bankroll,
        streak,
        completeLevel,
        updateBankroll,
        resetProgress,
        checkStreak
    };
}

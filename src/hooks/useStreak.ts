import { useState, useEffect } from 'react';

export function useStreak() {
    const [streak, setStreak] = useState<number>(() => {
        return parseInt(localStorage.getItem('poker_streak') || '0', 10);
    });

    const [lastLoginDate, setLastLoginDate] = useState<string>(() => {
        return localStorage.getItem('poker_last_login') || '';
    });

    const checkStreak = () => {
        const today = new Date().toDateString();

        if (lastLoginDate === today) return; // Already logged today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastLoginDate === yesterday.toDateString()) {
            // Continued streak
            const newStreak = streak + 1;
            setStreak(newStreak);
            localStorage.setItem('poker_streak', newStreak.toString());
        } else {
            // Broken streak (or first time)
            setStreak(1);
            localStorage.setItem('poker_streak', '1');
        }

        setLastLoginDate(today);
        localStorage.setItem('poker_last_login', today);
    };

    // Auto-check on mount
    useEffect(() => {
        checkStreak();
    }, []);

    return { streak };
}

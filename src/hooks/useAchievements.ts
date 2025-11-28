import { useState, useEffect } from 'react';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS_DATA: Achievement[] = [
    { id: 'blitz_streak_10', title: 'On Fire!', description: 'Win 10 Blitz hands in a row', icon: '🔥', rarity: 'common' },
    { id: 'blitz_streak_25', title: 'Unstoppable', description: 'Win 25 Blitz hands in a row', icon: '🚀', rarity: 'rare' },
    { id: 'blitz_streak_50', title: 'Poker God', description: 'Win 50 Blitz hands in a row', icon: '⚡', rarity: 'epic' },
    { id: 'blitz_streak_100', title: 'Living Legend', description: 'Win 100 Blitz hands in a row', icon: '👑', rarity: 'legendary' },
];

const STORAGE_KEY = 'poker-trainer-achievements';

export function useAchievements() {
    const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch { return []; }
    });

    const [lastUnlocked, setLastUnlocked] = useState<Achievement | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds));
    }, [unlockedIds]);

    const unlock = (id: string) => {
        if (!unlockedIds.includes(id)) {
            const achievement = ACHIEVEMENTS_DATA.find(a => a.id === id);
            if (achievement) {
                setUnlockedIds(prev => [...prev, id]);
                setLastUnlocked(achievement);

                // Play sound & Clear notification after 4s
                // Note: You might want to add a specific achievement sound to soundEngine later
                setTimeout(() => setLastUnlocked(null), 4000);
            }
        }
    };

    const resetAchievements = () => {
        setUnlockedIds([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        unlockedIds,
        unlock,
        lastUnlocked,
        allAchievements: ACHIEVEMENTS_DATA,
        resetAchievements
    };
}

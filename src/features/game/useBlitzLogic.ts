import { useState, useEffect, useCallback } from 'react';
import { scenarios } from './scenarios';
import { type Action, type Scenario } from '@/lib/types';
import { soundEngine } from '@/lib/sound';
import { playSuccessEffect, triggerShake } from '@/lib/effects';
import { scenarioStore } from '@/lib/scenario-store';

const BASE_POINTS = 10;
const getMultiplier = (streak: number) => {
    if (streak >= 20) return 5;
    if (streak >= 10) return 3;
    if (streak >= 5) return 2;
    return 1;
};

export function useBlitzLogic(onGameOver: (score: number, streak: number) => void) {
    // Helper to filter scenarios based on difficulty (streak)
    const getScenariosByDifficulty = (currentStreak: number) => {
        const all = [...scenarios, ...scenarioStore.getAll()];

        // Define allowed streets based on streak
        const allowedStreets = new Set<string>();
        allowedStreets.add('preflop'); // Always allow preflop

        if (currentStreak >= 6) allowedStreets.add('flop');
        if (currentStreak >= 11) allowedStreets.add('turn');
        if (currentStreak >= 21) allowedStreets.add('river');

        const filtered = all.filter(s => {
            // Use explicit 'street' tag if available
            if (s.street) {
                return allowedStreets.has(s.street);
            }
            // Fallback to card count logic
            const count = s.communityCards.length;
            if (count === 0) return allowedStreets.has('preflop');
            if (count === 3) return allowedStreets.has('flop');
            if (count === 4) return allowedStreets.has('turn');
            if (count === 5) return allowedStreets.has('river');
            return false;
        });

        // Fallback to all scenarios if filtered is empty (safety net)
        return filtered.length > 0 ? filtered : all;
    };

    const [timeLeft, setTimeLeft] = useState(60); // Start with 60 seconds
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [isActive, setIsActive] = useState(true);

    const [currentScenario, setCurrentScenario] = useState<Scenario>(() => {
        // Initial state: Streak is 0, so get easiest scenarios
        const source = getScenariosByDifficulty(0);
        return source[Math.floor(Math.random() * source.length)];
    });

    // Timer Tick & Sound
    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsActive(false);
                    // Pass maxStreak to leaderboard, not current streak (which might be 0 if failed last)
                    onGameOver(score, Math.max(streak, maxStreak));
                    return 0;
                }
                // Ticking sound for last 3 seconds
                if (prev <= 4) {
                    soundEngine.playTick();
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, score, streak, maxStreak, onGameOver]);

    // We need to pass the *next* streak value to this function to determine difficulty
    const nextScenario = useCallback((nextStreak: number) => {
        const source = getScenariosByDifficulty(nextStreak);
        const randomIndex = Math.floor(Math.random() * source.length);
        setCurrentScenario(source[randomIndex]);
    }, []);

    const handleAction = (action: Action) => {
        if (!isActive) return;

        const isCorrect = action === currentScenario.correctAction;

        if (isCorrect) {
            // Success Logic
            soundEngine.playSuccess();
            playSuccessEffect(); // Confetti

            const newStreak = streak + 1;
            const multiplier = getMultiplier(newStreak);
            const points = BASE_POINTS * multiplier;

            setScore(s => s + points);
            setStreak(newStreak);
            setMaxStreak(m => Math.max(m, newStreak));

            setTimeLeft(t => Math.min(t + 5, 60)); // Add 5s cap at 60s
            nextScenario(newStreak); // Pass new streak to determine next difficulty
        } else {
            // Failure Logic
            soundEngine.playError();
            triggerShake('blitz-container'); // Visual shake
            setStreak(0); // Reset streak
            setTimeLeft(t => Math.max(0, t - 10)); // Penalty -10s
            // We don't skip scenario on error in Blitz, must solve or fail
        }
    };

    const multiplier = getMultiplier(streak);

    return {
        timeLeft,
        score,
        streak,
        multiplier,
        currentScenario,
        handleAction,
        isActive
    };
}

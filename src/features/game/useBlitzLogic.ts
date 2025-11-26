import { useState, useEffect, useCallback } from 'react';
import { scenarios } from './scenarios';
import { type Action, type Scenario } from '@/lib/types';
import { soundEngine } from '@/lib/sound';
import { playSuccessEffect, triggerShake } from '@/lib/effects';

export function useBlitzLogic(onGameOver: (score: number) => void) {
    const [timeLeft, setTimeLeft] = useState(60); // Start with 60 seconds
    const [score, setScore] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [currentScenario, setCurrentScenario] = useState<Scenario>(() => {
        // Pick random scenario initially
        return scenarios[Math.floor(Math.random() * scenarios.length)];
    });

    // Timer Tick
    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsActive(false);
                    onGameOver(score);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, score, onGameOver]);

    const nextScenario = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * scenarios.length);
        setCurrentScenario(scenarios[randomIndex]);
    }, []);

    const handleAction = (action: Action) => {
        if (!isActive) return;

        const isCorrect = action === currentScenario.correctAction;

        if (isCorrect) {
            // Success Logic
            soundEngine.playSuccess();
            playSuccessEffect(); // Confetti
            setScore(s => s + 1);
            setTimeLeft(t => Math.min(t + 5, 60)); // Add 5s cap at 60s
            nextScenario();
        } else {
            // Failure Logic
            soundEngine.playError();
            triggerShake('blitz-container'); // Visual shake
            setTimeLeft(t => Math.max(0, t - 10)); // Penalty -10s
            // We don't skip scenario on error in Blitz, must solve or fail
        }
    };

    return {
        timeLeft,
        score,
        currentScenario,
        handleAction,
        isActive
    };
}

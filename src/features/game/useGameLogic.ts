import { useState } from 'react';
import { REAL_SCENARIOS } from './scenarios';
import { type Action } from '@/lib/types';
import { soundEngine } from '@/lib/sound';

export type GameState = 'playing' | 'success' | 'error' | 'levelComplete';

interface UseGameLogicProps {
    scenarioIds?: string[];
    onLevelComplete?: () => void;
}

export function useGameLogic({ scenarioIds, onLevelComplete }: UseGameLogicProps = {}) {
    // Filter scenarios based on provided IDs, or use all scenarios
    const levelScenarios = scenarioIds
        ? REAL_SCENARIOS.filter(s => scenarioIds.includes(s.id))
        : REAL_SCENARIOS;

    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [lives, setLives] = useState(100);
    const [streak, setStreak] = useState(0);
    const [gameState, setGameState] = useState<GameState>('playing');
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [correctAnswers, setCorrectAnswers] = useState(0);

    const currentScenario = levelScenarios[currentScenarioIndex];
    const isLastScenario = currentScenarioIndex === levelScenarios.length - 1;

    const handleAction = (action: Action) => {
        if (gameState !== 'playing') return;

        const isCorrect = action === currentScenario.correctAction;

        if (isCorrect) {
            soundEngine.playSuccess();
            setGameState('success');
            setStreak(prev => prev + 1);
            setCorrectAnswers(prev => prev + 1);
            setFeedbackMessage(`Perfect! ${currentScenario.explanation_simple}`);
        } else {
            soundEngine.playError();
            setGameState('error');
            setLives(prev => Math.max(0, prev - 10));
            setStreak(0);
            setFeedbackMessage(
                `Incorrect. The correct answer was "${currentScenario.correctAction}". ${currentScenario.explanation_simple}`
            );
        }
    };

    const handleNext = () => {
        setFeedbackMessage(null);

        // Check for chained scenario (nextStageId)
        if (currentScenario.nextStageId) {
            const nextIndex = levelScenarios.findIndex(s => s.id === currentScenario.nextStageId);
            if (nextIndex !== -1) {
                setGameState('playing');
                setCurrentScenarioIndex(nextIndex);
                return;
            }
        }

        // Check if this was the last scenario
        if (isLastScenario) {
            setGameState('levelComplete');
            if (onLevelComplete) {
                onLevelComplete();
            }
        } else {
            setGameState('playing');
            setCurrentScenarioIndex(prev => prev + 1);
        }
    };

    const resetGame = () => {
        setCurrentScenarioIndex(0);
        setLives(100);
        setStreak(0);
        setGameState('playing');
        setFeedbackMessage(null);
        setCorrectAnswers(0);
    };

    return {
        currentScenario,
        lives,
        streak,
        gameState,
        feedbackMessage,
        handleAction,
        handleNext,
        resetGame,
        progress: ((currentScenarioIndex + 1) / levelScenarios.length) * 100,
        correctAnswers,
        totalQuestions: levelScenarios.length,
        isLastScenario,
    };
}

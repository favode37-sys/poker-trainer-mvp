import { useState } from 'react';
import { scenarios } from './scenarios';
import { type Action } from '@/lib/types';
import { soundEngine } from '@/lib/sound'; // Assuming sound logic is here or handled in UI

export type GameState = 'playing' | 'success' | 'error' | 'levelComplete';

interface UseGameLogicProps {
    scenarioIds?: string[];
    onLevelComplete?: () => void;
    // New props for global state integration
    onCorrectAnswer?: () => void;
    onWrongAnswer?: () => void;
}

export function useGameLogic({ scenarioIds, onLevelComplete, onCorrectAnswer, onWrongAnswer }: UseGameLogicProps = {}) {
    const levelScenarios = scenarioIds
        ? scenarios.filter(s => scenarioIds.includes(s.id))
        : scenarios;

    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    // Removed local 'lives' and 'streak' state here. They are now global.

    const [gameState, setGameState] = useState<GameState>('playing');
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [correctAnswers, setCorrectAnswers] = useState(0);

    const currentScenario = levelScenarios[currentScenarioIndex];
    const isLastScenario = currentScenarioIndex === levelScenarios.length - 1;

    const handleAction = (action: Action) => {
        if (gameState !== 'playing') return;

        const isCorrect = action === currentScenario.correctAction;

        if (isCorrect) {
            setGameState('success');
            setCorrectAnswers(prev => prev + 1);
            setFeedbackMessage(`Perfect! ${currentScenario.explanation_simple}`);
            if (onCorrectAnswer) onCorrectAnswer();
        } else {
            setGameState('error');
            setFeedbackMessage(
                `Incorrect. The correct answer was "${currentScenario.correctAction}". ${currentScenario.explanation_simple}`
            );
            if (onWrongAnswer) onWrongAnswer();
        }
    };

    const handleNext = () => {
        setFeedbackMessage(null);

        if (currentScenario.nextStageId) {
            const nextIndex = levelScenarios.findIndex(s => s.id === currentScenario.nextStageId);
            if (nextIndex !== -1) {
                setGameState('playing');
                setCurrentScenarioIndex(nextIndex);
                return;
            }
        }

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

    // Note: resetGame might need to communicate up to reset level progress if needed

    return {
        currentScenario,
        gameState,
        feedbackMessage,
        handleAction,
        handleNext,
        progress: ((currentScenarioIndex + 1) / levelScenarios.length) * 100,
        correctAnswers,
        totalQuestions: levelScenarios.length,
        isLastScenario,
    };
}

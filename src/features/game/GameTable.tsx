import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { PokerChip } from '@/components/ui/PokerChip';
import { FeedbackSheet } from '@/components/ui/FeedbackSheet';
import { LevelCompleteModal } from '@/components/ui/LevelCompleteModal';
import { CoachModal } from '@/components/game/CoachModal';
import { BossBriefing } from '@/components/game/BossBriefing';
import { SmartTable, type SmartTableControlsProps } from '@/components/game/SmartTable'; // [NEW]
import { useGameLogic } from '@/features/game/useGameLogic';
import { soundEngine } from '@/lib/sound';
import { analytics } from '@/lib/analytics';
import { geminiService } from '@/lib/gemini';
import { type Quest } from '@/hooks/useQuests';
import { BOSSES, type BossId } from './boss-profiles';

interface GameTableProps {
    levelId: string;
    levelTitle: string;
    scenarioIds: string[];
    xpReward: number;
    onLevelComplete: (levelId: string) => void;
    onBackToMap: () => void;
    bankroll: number;
    streak: number;
    updateBankroll: (amount: number) => void;
    onQuestEvent: (type: Quest['type'], amount?: number) => void;
    bossId?: BossId;
}

export function GameTable({ levelId, levelTitle, scenarioIds, xpReward, onLevelComplete, onBackToMap, bankroll, streak, updateBankroll, onQuestEvent, bossId }: GameTableProps) {
    const boss = bossId ? BOSSES[bossId] : null;
    const [showBriefing, setShowBriefing] = useState<boolean>(!!bossId);

    const handleStartBossFight = () => {
        setShowBriefing(false);
        soundEngine.playClick();
    };

    const {
        currentScenario,
        gameState,
        feedbackMessage,
        handleAction,
        handleNext,
        progress,
        correctAnswers,
        totalQuestions,
    } = useGameLogic({
        scenarioIds,
        onLevelComplete: () => analytics.levelComplete(levelId, xpReward),
        onCorrectAnswer: () => {
            updateBankroll(10);
            onQuestEvent('play_hands', 1);
            onQuestEvent('win_hands', 1);
            if (currentScenario?.correctAction === 'Fold') onQuestEvent('correct_folds', 1);
        },
        onWrongAnswer: () => {
            updateBankroll(-50);
            onQuestEvent('play_hands', 1);
        }
    });

    const [coachExplanation, setCoachExplanation] = useState<string>('');
    const [isCoachLoading, setIsCoachLoading] = useState(false);
    const [isCoachOpen, setIsCoachOpen] = useState(false);

    useEffect(() => { soundEngine.init(); }, []);

    const handleOpenCoach = async () => {
        setIsCoachOpen(true);
        if (!coachExplanation && currentScenario) {
            setIsCoachLoading(true);
            const isLastCorrect = gameState === 'success';
            const userActionDescription = isLastCorrect ? currentScenario.correctAction : "Incorrect Move";
            try {
                const advice = await geminiService.getCoachAdvice(
                    currentScenario,
                    userActionDescription,
                    isLastCorrect,
                    boss || undefined
                );
                setCoachExplanation(advice);
            } catch (e) {
                setCoachExplanation(currentScenario.explanation_deep);
            } finally {
                setIsCoachLoading(false);
            }
        }
    };

    if (!currentScenario) return null;

    return (
        <div className="absolute inset-0 bg-neutral-bg flex flex-col overflow-hidden font-sans">
            <AnimatePresence>
                {showBriefing && boss && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100]">
                        <BossBriefing boss={boss} onStart={handleStartBossFight} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="flex-none relative z-10 glass-panel border-b border-white/50">
                <div className="h-2 bg-neutral-100 w-full">
                    <motion.div className="h-full bg-brand-accent rounded-r-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>
                <div className="flex justify-between items-center p-2 px-4 h-14">
                    <button onClick={onBackToMap} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-white/50 shadow-sm">
                            <PokerChip color="blue" size="sm" />
                            <span className="font-bold text-neutral-800 text-sm">${bankroll}</span>
                        </div>
                        <div className="flex items-center gap-1 text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full border border-orange-100 shadow-sm">
                            <Flame className="w-5 h-5 fill-current" />
                            <span>{streak}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* UNIFIED SMART TABLE */}
            <div className="flex-1 min-h-0 w-full relative">
                <SmartTable
                    currentScenario={currentScenario}
                    boss={boss}
                    onActionComplete={(action) => {
                        analytics.scenarioResult(currentScenario.id, action === currentScenario.correctAction, action);
                        handleAction(action);
                    }}
                    renderControls={({ handleAction: onAction, isReady, amountToCall, raiseAmount }: SmartTableControlsProps) => {
                        const isCheck = amountToCall === 0;
                        return (
                            <div className="absolute bottom-0 left-0 right-0 glass-panel rounded-t-3xl p-4 pb-8 space-y-3 z-50 border-t border-white/50">
                                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                                    <Button
                                        variant="danger"
                                        size="lg"
                                        className="col-span-1 h-12 px-2"
                                        onClick={() => onAction('Fold')}
                                        disabled={!isReady || gameState !== 'playing'}
                                    >
                                        FOLD
                                    </Button>
                                    <Button
                                        variant={isCheck ? "outline" : "primary"}
                                        size="lg"
                                        className={`col-span-1 h-12 px-2 ${isCheck ? "bg-white/50 text-neutral-600" : ""}`}
                                        onClick={() => onAction('Call')}
                                        disabled={!isReady || gameState !== 'playing'}
                                    >
                                        {isCheck ? "CHECK" : <>CALL ${amountToCall}</>}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="col-span-1 h-12 px-2"
                                        onClick={() => onAction('Raise')}
                                        disabled={!isReady || gameState !== 'playing'}
                                    >
                                        {raiseAmount ? <>RAISE ${raiseAmount}</> : 'RAISE'}
                                    </Button>
                                </div>
                            </div>
                        );
                    }}
                />
            </div>

            <FeedbackSheet
                state={gameState === 'success' || gameState === 'error' ? gameState : null}
                message={feedbackMessage}
                onNext={handleNext}
                onExpand={handleOpenCoach}
            />

            <CoachModal
                isOpen={isCoachOpen}
                isLoading={isCoachLoading}
                onClose={() => setIsCoachOpen(false)}
                explanation={coachExplanation}
            />

            {gameState === 'levelComplete' && (
                <LevelCompleteModal
                    levelTitle={levelTitle}
                    xpEarned={xpReward}
                    correctAnswers={correctAnswers}
                    totalQuestions={totalQuestions}
                    onContinue={() => {
                        onLevelComplete(levelId);
                        onBackToMap();
                    }}
                />
            )}
        </div>
    );
}

import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Flame } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CoachModal } from '@/components/game/CoachModal';
import { SmartTable, type SmartTableControlsProps } from '@/components/game/SmartTable';
import { useBlitzLogic } from '@/features/game/useBlitzLogic';
import { analytics } from '@/lib/analytics';
import { type Quest } from '@/hooks/useQuests';
import { type Action } from '@/lib/types';

interface BlitzModeProps {
    onBack: () => void;
    onQuestEvent: (type: Quest['type'], amount?: number) => void;
}

export function BlitzMode({ onBack, onQuestEvent }: BlitzModeProps) {
    const [feedbackState, setFeedbackState] = useState<'success' | 'error' | null>(null);

    const {
        currentScenario,
        handleAction: blitzHandleAction,
        score,
        streak,
        timeLeft,
        isActive
    } = useBlitzLogic((finalScore: number, _finalStreak: number) => {
        analytics.levelComplete('blitz_mode', finalScore);
    });

    const isGameOver = !isActive && timeLeft === 0;

    // Wrapper to add quest events and feedback
    const handleAction = (action: Action) => {
        if (!currentScenario) return;

        const isCorrect = action === currentScenario.correctAction;

        setFeedbackState(isCorrect ? 'success' : 'error');
        setTimeout(() => setFeedbackState(null), 500);

        onQuestEvent('play_hands', 1);
        if (isCorrect) {
            onQuestEvent('win_hands', 1);
            if (currentScenario.correctAction === 'Fold') onQuestEvent('correct_folds', 1);
        }

        blitzHandleAction(action);
    };

    const [coachExplanation] = useState<string>('');
    const [isCoachOpen, setIsCoachOpen] = useState(false);

    if (!currentScenario && !isGameOver) return <div className="flex items-center justify-center h-screen text-white">Loading Blitz...</div>;

    if (isGameOver) {
        return (
            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
                <Flame className="w-16 h-16 text-orange-500 mb-4 animate-bounce" />
                <h2 className="text-3xl font-black mb-2">TIME'S UP!</h2>
                <p className="text-slate-400 mb-6">Final Score</p>
                <div className="text-6xl font-black text-white mb-8">{score}</div>
                <Button variant="primary" size="lg" onClick={onBack} className="w-full max-w-xs">
                    BACK TO MENU
                </Button>
            </div>
        );
    }

    if (!currentScenario) return null;

    return (
        <div id="blitz-table-container" className="absolute inset-0 bg-slate-900 flex flex-col overflow-hidden font-sans border-4 border-orange-500/30">

            {/* BLITZ HEADER */}
            <div className="flex-none relative z-10 bg-slate-800/80 border-b border-orange-500/30 backdrop-blur-md">
                <div className="flex justify-between items-center p-2 px-4 h-16">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Time</span>
                            <div className={`text-xl font-black font-mono ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                {timeLeft}s
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-white/20"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Score</span>
                            <div className="text-xl font-black text-white flex items-center gap-1">
                                <Zap className="w-4 h-4 text-yellow-400 fill-current" />
                                {score}
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-white/20"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Streak</span>
                            <div className="text-xl font-black text-white flex items-center gap-1">
                                <Flame className="w-4 h-4 text-orange-400 fill-current" />
                                {streak}
                            </div>
                        </div>
                    </div>

                    <div className="w-8"></div>
                </div>
                <div className="h-1 bg-slate-700 w-full">
                    <motion.div
                        className="h-full bg-orange-500"
                        animate={{ width: `${(timeLeft / 60) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                    />
                </div>
            </div>

            {/* UNIFIED SMART TABLE (With Custom Blitz Theme & Controls) */}
            <div className="flex-1 min-h-0 w-full relative bg-[url('/felt-pattern.png')] bg-repeat opacity-90">
                <SmartTable
                    currentScenario={currentScenario}
                    onActionComplete={(action) => handleAction(action)}
                    renderControls={({ handleAction: onAction, isReady, amountToCall }: SmartTableControlsProps) => {
                        const isCheck = amountToCall === 0;
                        return (
                            <div className="absolute bottom-0 left-0 right-0 glass-panel rounded-t-3xl p-4 pb-8 space-y-3 z-50 border-t border-white/50 bg-slate-900/90">
                                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                                    <Button
                                        variant="danger"
                                        size="lg"
                                        className="col-span-1 h-14 px-2 text-xl font-black"
                                        onClick={() => onAction('Fold')}
                                        disabled={!isReady}
                                    >
                                        FOLD
                                    </Button>
                                    <Button
                                        variant={isCheck ? "outline" : "primary"}
                                        size="lg"
                                        className={`col-span-1 h-14 px-2 text-xl font-black ${isCheck ? "bg-white/10 text-white border-white/20" : ""}`}
                                        onClick={() => onAction('Call')}
                                        disabled={!isReady}
                                    >
                                        {isCheck ? "CHECK" : "CALL"}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="col-span-1 h-14 px-2 text-xl font-black"
                                        onClick={() => onAction('Raise')}
                                        disabled={!isReady}
                                    >
                                        RAISE
                                    </Button>
                                </div>
                            </div>
                        );
                    }}
                />
            </div>

            {/* Simple feedback flash */}
            {feedbackState && (
                <div className={`absolute inset-0 pointer-events-none z-[100] ${feedbackState === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`} />
            )}

            <CoachModal
                isOpen={isCoachOpen}
                isLoading={false}
                onClose={() => setIsCoachOpen(false)}
                explanation={coachExplanation}
            />
        </div>
    );
}

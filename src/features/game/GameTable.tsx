import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ArrowLeft, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { PokerChip } from '@/components/ui/PokerChip';
import { FeedbackSheet } from '@/components/ui/FeedbackSheet';
import { LevelCompleteModal } from '@/components/ui/LevelCompleteModal';
import { TableLayout } from '@/components/game/TableLayout';
import { CoachModal } from '@/components/game/CoachModal';
import { useGameLogic } from '@/features/game/useGameLogic';
import { soundEngine } from '@/lib/sound';
import { calculateTableSeats, type Position } from '@/lib/poker-engine';
import { analytics } from '@/lib/analytics';
import { geminiService } from '@/lib/gemini';
import { playSuccessEffect, playFoldEffect, triggerShake } from '@/lib/effects';
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
        onLevelComplete: () => {
            analytics.levelComplete(levelId, xpReward);
            console.log('🎊 All scenarios completed for level:', levelId);
        },
        onCorrectAnswer: () => {
            updateBankroll(10);
            // Quest Triggers
            onQuestEvent('play_hands', 1);
            onQuestEvent('win_hands', 1);

            // Check if it was a fold
            if (currentScenario?.correctAction === 'Fold') {
                onQuestEvent('correct_folds', 1);
            }
        },
        onWrongAnswer: () => {
            updateBankroll(-50);
            // Even wrong answers count as "played"
            onQuestEvent('play_hands', 1);
        }
    });

    if (!currentScenario) {
        return (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <div className="text-center p-6">
                    <h2 className="text-xl font-bold text-white mb-2">⚠️ Scenario Not Found</h2>
                    <p className="text-slate-400 mb-6">The requested scenario could not be loaded.</p>
                    <Button variant="secondary" onClick={onBackToMap}>Return to Map</Button>
                </div>
            </div>
        );
    }

    // State for AI explanation
    const [coachExplanation, setCoachExplanation] = useState<string>('');
    const [isCoachLoading, setIsCoachLoading] = useState(false);
    const [isCoachOpen, setIsCoachOpen] = useState(false);

    // Boss logic
    const boss = bossId ? BOSSES[bossId] : null;
    const [villainMessage, setVillainMessage] = useState("");
    const tableTheme = boss ? boss.colorTheme : undefined;

    // Show boss greeting on mount
    useEffect(() => {
        if (boss) {
            setVillainMessage(boss.phrases.greeting);
            const timer = setTimeout(() => setVillainMessage(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [boss]);

    // Destructure new fields with defaults
    const {
        villainAction,
        heroCards,
        communityCards,
        potSize,
        heroPosition = 'BTN',
        villainPosition = 'BB',
        heroChipsInFront = 0,
        villainChipsInFront = 0
    } = currentScenario;

    // --- REPLACE OLD SEAT LOGIC WITH THIS ---

    // 1. Calculate seat configuration based on positions
    const seatConfigs = calculateTableSeats(
        heroPosition as Position,
        villainPosition as Position
    );

    // 2. Map configurations to renderable player objects
    const seatsArray = seatConfigs.map((config) => {
        // Hero (Seat 1) is handled separately in the UI overlay
        if (config.isHero) return undefined;

        // Villain Logic
        if (config.isVillain) {
            const stack = 100 - villainChipsInFront;

            return {
                player: {
                    name: boss ? boss.name : 'Villain',
                    stack: stack,
                    isActive: true,
                    avatar: boss ? boss.avatar : undefined
                },
                betAmount: villainChipsInFront, // Explicit bet amount
                positionLabel: config.positionLabel,
                isFolded: false,
                lastAction: villainAction,
                isDealer: config.isDealer,
                isHero: false
            };
        }

        // Filler Player Logic
        return {
            player: { name: `Player ${config.id}`, stack: 100, isActive: false },
            positionLabel: config.positionLabel,
            isFolded: true,
            lastAction: 'Fold',
            isDealer: config.isDealer,
            betAmount: 0,
            isHero: false
        };
    });

    // Construct the seats tuple for TableLayout
    const seats: [any, any, any, any, any, any] = [
        seatsArray[0], // Seat 1 (Hero - undefined)
        seatsArray[1], // Seat 2
        seatsArray[2], // Seat 3
        seatsArray[3], // Seat 4
        seatsArray[4], // Seat 5
        seatsArray[5]  // Seat 6
    ];

    // --- END NEW LOGIC ---

    useEffect(() => {
        soundEngine.init();
    }, []);

    // Handler for opening coach
    const handleOpenCoach = async () => {
        setIsCoachOpen(true);
        analytics.coachOpened(currentScenario.id, 'game_table');

        // Only fetch if we haven't already (or force refresh if you prefer)
        if (!coachExplanation) {
            setIsCoachLoading(true);
            const isLastCorrect = gameState === 'success';

            // We infer the user's last action based on correctness. 
            // (For MVP simplification. In v2 we can store `lastAction` in state)
            const userActionDescription = isLastCorrect
                ? currentScenario.correctAction
                : "Incorrect Move";

            try {
                const advice = await geminiService.getCoachAdvice(
                    currentScenario,
                    userActionDescription,
                    isLastCorrect
                );
                setCoachExplanation(advice);
            } catch (e) {
                console.error(e);
                setCoachExplanation(currentScenario.explanation_deep);
            } finally {
                setIsCoachLoading(false);
            }
        }
    };

    useEffect(() => {
        if (gameState === 'levelComplete') {
            soundEngine.playLevelComplete();
        }
        // Reset explanation state when starting new move or closing sheet
        if (gameState === 'playing' || gameState === null) {
            setIsCoachOpen(false);
            setCoachExplanation(''); // Clear previous advice
        }
    }, [gameState, currentScenario.id]);

    const handleContinueJourney = () => {
        onLevelComplete(levelId);
        onBackToMap();
    };

    const handleActionWithSound = (action: 'Fold' | 'Call' | 'Raise') => {
        // 1. Audio (Existing)
        soundEngine.playClick();

        // 2. Logic Check
        const isCorrect = action === currentScenario.correctAction;

        // 3. Analytics Tracking
        analytics.scenarioResult(currentScenario.id, isCorrect, action);

        // 4. Visual Effects (The Juice)
        if (isCorrect) {
            if (action === 'Fold') {
                playFoldEffect(); // Specific reward for discipline
            } else {
                playSuccessEffect(); // Standard victory
            }
        } else {
            // Shake the table container on error
            triggerShake('game-table-container');
        }

        // 5. Pass to game logic
        handleAction(action);
    };

    const amountToCall = currentScenario.amountToCall ?? Math.max(0, villainChipsInFront - heroChipsInFront);
    const isCheck = amountToCall === 0;
    const raiseAmount = currentScenario.defaultRaiseAmount;

    const explanationToPass = null; // Never pass deep text to sheet, forcing the button to appear

    return (
        <div id="game-table-container" className="absolute inset-0 bg-neutral-bg flex flex-col overflow-hidden font-sans">
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

            <div className="flex-1 min-h-0 w-full flex items-center justify-center relative p-4">
                <div className="relative w-full h-full max-w-md">
                    <TableLayout seats={seats} communityCards={communityCards} potSize={potSize} themeClass={tableTheme} />

                    {/* Boss Speech Bubble */}
                    <AnimatePresence>
                        {villainMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-white px-4 py-3 rounded-xl rounded-bl-none shadow-xl border-2 border-slate-200 max-w-xs"
                            >
                                <p className="text-sm font-bold text-slate-800">{villainMessage}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* HERO SECTION Overlay updates */}
            <div className="absolute bottom-[110px] sm:bottom-[138px] left-1/2 -translate-x-1/2 sm:left-[30px] sm:translate-x-0 flex gap-2 z-30 origin-bottom scale-[0.65] sm:scale-[0.8] sm:origin-bottom-left pointer-events-none">
                {/* Note: Added pointer-events-none to container so clicks pass through to table if needed, 
                    but cards need pointer-events-auto if they were interactive (they aren't yet). */}

                {/* Dealer Button for Hero - Derived from Engine Config (Seat 1) */}
                {seatConfigs[0].isDealer && (
                    <div className="absolute -top-6 -right-2 sm:-top-4 sm:-right-4 h-6 w-6 sm:h-8 sm:w-8 bg-yellow-400 border border-yellow-500 text-yellow-950 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold z-40 shadow-md">
                        D
                    </div>
                )}

                {/* Hero Chips - Explicit Logic */}
                {heroChipsInFront > 0 && (
                    <div className="absolute -top-12 sm:-top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
                        <div className="bg-neutral-900 px-2 py-1 rounded-full border border-neutral-700 flex items-center gap-1 shadow-lg whitespace-nowrap">
                            <Coins className="w-3 h-3 text-yellow-400" />
                            <span className="text-white text-xs font-bold">${heroChipsInFront}</span>
                        </div>
                    </div>
                )}

                {heroCards.map((card, index) => (
                    <motion.div
                        key={`${currentScenario.id}-hero-${index}`}
                        initial={{ y: 50, opacity: 0, rotate: index === 0 ? -5 : 5 }}
                        animate={{ y: 0, opacity: 1, rotate: index === 0 ? -5 : 5 }}
                        transition={{ delay: 0.2 + index * 0.1, type: 'spring', stiffness: 150 }}
                        className="origin-bottom"
                    >
                        <PlayingCard card={card} size="lg" className="shadow-2xl ring-2 ring-brand-accent/50" />
                    </motion.div>
                ))}
            </div>

            <div className="flex-none glass-panel rounded-t-3xl p-4 pb-8 space-y-3 z-20 relative border-t border-white/50">
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    <Button variant="danger" size="lg" className="col-span-1 h-12 text-sm sm:text-base px-2" onClick={() => handleActionWithSound('Fold')} disabled={gameState !== 'playing'}>FOLD</Button>
                    <Button
                        variant={isCheck ? "outline" : "primary"}
                        size="lg"
                        className={`col-span-1 h-12 text-sm sm:text-base px-2 ${isCheck ? "bg-white/50 text-neutral-600 hover:bg-white/80" : ""}`}
                        onClick={() => handleActionWithSound('Call')}
                        disabled={gameState !== 'playing'}
                    >
                        {isCheck ? "CHECK" : <>CALL ${amountToCall}</>}
                    </Button>
                    <Button variant="secondary" size="lg" className="col-span-1 h-12 text-sm sm:text-base px-2" onClick={() => handleActionWithSound('Raise')} disabled={gameState !== 'playing'}>
                        {raiseAmount ? <>RAISE ${raiseAmount}</> : 'RAISE'}
                    </Button>
                </div>

            </div>

            <FeedbackSheet
                state={gameState === 'success' || gameState === 'error' ? gameState : null}
                message={feedbackMessage}
                explanation={explanationToPass}
                onNext={handleNext}
                onExpand={handleOpenCoach}
            />

            <CoachModal
                isOpen={isCoachOpen}
                isLoading={isCoachLoading}
                onClose={() => setIsCoachOpen(false)}
                explanation={coachExplanation}
            />

            {gameState === 'levelComplete' && <LevelCompleteModal levelTitle={levelTitle} xpEarned={xpReward} correctAnswers={correctAnswers} totalQuestions={totalQuestions} onContinue={handleContinueJourney} />}
        </div>
    );
}

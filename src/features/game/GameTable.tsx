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
import { BossBriefing } from '@/components/game/BossBriefing';
import { useGameLogic } from '@/features/game/useGameLogic';
import { soundEngine } from '@/lib/sound';
import { calculateTableSeats, getFillerSeatStatus, type Position } from '@/lib/poker-engine';
import { analytics } from '@/lib/analytics';
import { geminiService } from '@/lib/gemini';
import { playSuccessEffect, playFoldEffect, triggerShake, triggerHaptic } from '@/lib/effects';
import { type Quest } from '@/hooks/useQuests';
import { BOSSES, type BossId } from './boss-profiles';
// NEW IMPORT
import { bossLogic } from '@/lib/boss-logic';

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

// [NEW] Standard acting order for 6-max


export function GameTable({ levelId, levelTitle, scenarioIds, xpReward, onLevelComplete, onBackToMap, bankroll, streak, updateBankroll, onQuestEvent, bossId }: GameTableProps) {
    // Boss setup
    const boss = bossId ? BOSSES[bossId] : null;
    const [villainMessage, setVillainMessage] = useState("");
    const tableTheme = boss ? boss.colorTheme : undefined;

    // State for Boss Briefing
    const [showBriefing, setShowBriefing] = useState<boolean>(!!bossId);

    // [NEW] Track chips added by player interaction
    const [addedHeroChips, setAddedHeroChips] = useState(0);

    // [NEW] Cinematic Playback State
    // 0: Init (Empty)
    // 1: Deal Hero (Cards fly in)
    // 2: Deal Board (Community cards appear)
    // 3: Villain Action (Chips & Bubble appear)
    // 4: Ready (Controls unlock)
    const [playbackStage, setPlaybackStage] = useState<0 | 1 | 2 | 3 | 4>(0);

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
        onLevelComplete: () => {
            analytics.levelComplete(levelId, xpReward);
            console.log('🎊 All scenarios completed for level:', levelId);
        },
        onCorrectAnswer: () => {
            updateBankroll(10);
            onQuestEvent('play_hands', 1);
            onQuestEvent('win_hands', 1);
            if (currentScenario?.correctAction === 'Fold') {
                onQuestEvent('correct_folds', 1);
            }

            // BOSS REACTION ON LOSS (Player Wins)
            if (boss) {
                const reaction = boss.phrases.lose[Math.floor(Math.random() * boss.phrases.lose.length)];
                setVillainMessage(reaction);
                setTimeout(() => setVillainMessage(""), 3000);
            }
        },
        onWrongAnswer: () => {
            updateBankroll(-50);
            onQuestEvent('play_hands', 1);

            // BOSS REACTION ON WIN (Player Loses)
            if (boss) {
                const reaction = boss.phrases.win[Math.floor(Math.random() * boss.phrases.win.length)];
                setVillainMessage(reaction);
                setTimeout(() => setVillainMessage(""), 3000);
            }
        }
    });

    // [NEW] Replay Effect
    useEffect(() => {
        if (!currentScenario) return;

        setPlaybackStage(0); // Reset

        const timeline = [
            // Stage 1: Hero Cards (100ms)
            {
                stage: 1,
                delay: 100,
                action: () => soundEngine.playCard()
            },
            // Stage 2: Board Cards (600ms) - only if board exists
            {
                stage: 2,
                delay: 600,
                action: () => currentScenario.communityCards.length > 0 && soundEngine.playCard()
            },
            // Stage 3: Villain Action (1100ms) - only if villain acts/bets
            {
                stage: 3,
                delay: 1100,
                action: () => (currentScenario.villainChipsInFront! > 0 || currentScenario.villainAction) && soundEngine.playChips()
            },
            // Stage 4: Ready (1600ms)
            {
                stage: 4,
                delay: 1600,
                action: () => { }
            }
        ];

        const timeouts: ReturnType<typeof setTimeout>[] = [];

        timeline.forEach(({ stage, delay, action }) => {
            const t = setTimeout(() => {
                setPlaybackStage(stage as any);
                action();
            }, delay);
            timeouts.push(t);
        });

        return () => timeouts.forEach(clearTimeout);
    }, [currentScenario?.id]); // Trigger on new scenario

    // Reset chips when scenario changes
    useEffect(() => {
        setAddedHeroChips(0);
    }, [currentScenario?.id]);

    // ... (rest of standard checks)

    if (!currentScenario) return null; // Simplified loading check

    // Destructure new fields
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

    // [NEW] Derived Data for Rendering based on Stage
    const showHeroCards = playbackStage >= 1;
    const showBoard = playbackStage >= 2;
    const showVillainAction = playbackStage >= 3;
    const isReady = playbackStage >= 4;

    // --- Hero Chips Logic ---
    const isPreflop = communityCards.length === 0;

    // 1. Base chips (from Scenario start state)
    let baseHeroChips = heroChipsInFront;
    if (isPreflop && baseHeroChips === 0) {
        if (heroPosition === 'SB') baseHeroChips = 0.5;
        if (heroPosition === 'BB') baseHeroChips = 1.0;
    }

    // 2. Total chips to display (Base + Added by Action)
    const displayHeroChips = baseHeroChips + addedHeroChips;

    // --- [NEW] Helper: Calculate state for "Filler" (background) players ---


    // --- SEAT LOGIC ---
    const seatConfigs = calculateTableSeats(
        heroPosition as Position,
        villainPosition as Position
    );

    const seatsArray = seatConfigs.map((config) => {
        // 1. HERO
        if (config.isHero) return undefined;

        // 2. VILLAIN (Always Active)
        if (config.isVillain) {
            const stack = 100 - villainChipsInFront;

            // Determine displayed bet for Villain
            // If action hasn't started, show blinds if applicable
            let displayBet = villainChipsInFront;
            if (currentScenario.actionHistory.length === 0 && displayBet === 0) {
                if (config.positionLabel === 'SB') displayBet = 0.5;
                if (config.positionLabel === 'BB') displayBet = 1.0;
            }

            return {
                player: {
                    name: boss ? boss.name : 'Villain',
                    stack: stack,
                    isActive: true,
                    avatar: boss ? boss.avatar : undefined
                },
                // [UPDATE] Hide bet/action until Stage 3
                betAmount: showVillainAction ? displayBet : 0,
                positionLabel: config.positionLabel,
                isFolded: false,
                lastAction: showVillainAction ? villainAction : '',
                isDealer: config.isDealer,
                isHero: false
            };
        }

        // 3. FILLER PLAYERS (Dynamic Logic)
        const { isFolded, betAmount } = getFillerSeatStatus(
            config.positionLabel,
            heroPosition as Position,
            currentScenario.street,
            currentScenario.actionHistory
        );

        return {
            player: { name: `Player ${config.id}`, stack: 100, isActive: !isFolded },
            positionLabel: config.positionLabel,
            isFolded: isFolded,
            lastAction: isFolded ? 'Fold' : '',
            isDealer: config.isDealer,
            betAmount: betAmount, // Show blind if active
            isHero: false
        };
    });

    const seats: [any, any, any, any, any, any] = [
        seatsArray[0], seatsArray[1], seatsArray[2], seatsArray[3], seatsArray[4], seatsArray[5]
    ];
    // ------------------

    // Coach Logic
    const [coachExplanation, setCoachExplanation] = useState<string>('');
    const [isCoachLoading, setIsCoachLoading] = useState(false);
    const [isCoachOpen, setIsCoachOpen] = useState(false);

    // Initial Boss Greeting
    useEffect(() => {
        if (boss) {
            setVillainMessage(boss.phrases.greeting);
            const timer = setTimeout(() => setVillainMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [boss]);

    useEffect(() => {
        soundEngine.init();
    }, []);

    const handleOpenCoach = async () => {
        setIsCoachOpen(true);
        analytics.coachOpened(currentScenario.id, 'game_table');

        if (!coachExplanation) {
            setIsCoachLoading(true);
            const isLastCorrect = gameState === 'success';
            const userActionDescription = isLastCorrect ? currentScenario.correctAction : "Incorrect Move";

            try {
                // PASS BOSS PROFILE TO COACH
                const advice = await geminiService.getCoachAdvice(
                    currentScenario,
                    userActionDescription,
                    isLastCorrect,
                    boss || undefined
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

    const handleContinueJourney = () => {
        onLevelComplete(levelId);
        onBackToMap();
    };

    const handleActionWithSound = (action: 'Fold' | 'Call' | 'Raise') => {
        // Haptic feedback based on action weight
        if (action === 'Fold') triggerHaptic('light');
        if (action === 'Call') triggerHaptic('medium');
        if (action === 'Raise') triggerHaptic('heavy');

        soundEngine.playClick();
        const isCorrect = action === currentScenario.correctAction;
        analytics.scenarioResult(currentScenario.id, isCorrect, action);

        // --- BOSS DYNAMIC REACTION ---
        if (boss) {
            const reaction = bossLogic.getReaction(boss, action, { potSize });
            if (reaction) {
                setVillainMessage(reaction);
                // Clear reaction after 2.5s so it doesn't stick
                setTimeout(() => setVillainMessage(""), 2500);
            }
        }
        // -----------------------------

        // [NEW] Visualize the Bet
        if (action === 'Call') {
            // Amount to call is the gap between Villain and Hero
            const callAmount = Math.max(0, villainChipsInFront - baseHeroChips);
            setAddedHeroChips(callAmount);
        }
        if (action === 'Raise') {
            // Raise to the specific amount defined in scenario
            const targetAmount = currentScenario.defaultRaiseAmount || (villainChipsInFront * 3);
            const added = Math.max(0, targetAmount - baseHeroChips);
            setAddedHeroChips(added);
        }

        if (isCorrect) {
            triggerHaptic('success');
            if (action === 'Fold') playFoldEffect();
            else playSuccessEffect();
        } else {
            triggerHaptic('error');
            triggerShake('game-table-container');
        }

        handleAction(action);
    };

    const amountToCall = currentScenario.amountToCall ?? Math.max(0, villainChipsInFront - heroChipsInFront);
    const isCheck = amountToCall === 0;
    const raiseAmount = currentScenario.defaultRaiseAmount;

    return (
        <div id="game-table-container" className="absolute inset-0 bg-neutral-bg flex flex-col overflow-hidden font-sans">
            {/* BOSS BRIEFING OVERLAY */}
            <AnimatePresence>
                {showBriefing && boss && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100]"
                    >
                        <BossBriefing boss={boss} onStart={handleStartBossFight} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
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

            {/* Table Area */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center relative p-4">
                <div className="relative w-full h-full max-w-md">
                    <TableLayout
                        seats={seats}
                        // [UPDATE] Hide board until Stage 2
                        communityCards={showBoard ? communityCards : []}
                        potSize={potSize}
                        themeClass={tableTheme}
                    />

                    {/* Villain Message Bubble */}
                    <AnimatePresence>
                        {villainMessage && showVillainAction && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-white px-4 py-2 rounded-2xl rounded-bl-none shadow-xl border-2 border-brand-primary/20 max-w-[200px]"
                            >
                                <p className="text-xs sm:text-sm font-bold text-slate-800 text-center leading-tight">
                                    {villainMessage}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Hero Cards Overlay */}
            <div className="absolute bottom-[110px] sm:bottom-[138px] left-1/2 -translate-x-1/2 sm:left-[30px] sm:translate-x-0 flex gap-2 z-30 origin-bottom scale-[0.65] sm:scale-[0.8] sm:origin-bottom-left pointer-events-none">
                {seatConfigs[0].isDealer && (
                    <div className="absolute -top-6 -right-2 sm:-top-4 sm:-right-4 h-6 w-6 sm:h-8 sm:w-8 bg-yellow-400 border border-yellow-500 text-yellow-950 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold z-40 shadow-md">D</div>
                )}
                {displayHeroChips > 0 && (
                    <div className="absolute -top-12 sm:-top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
                        <div className="bg-neutral-900 px-2 py-1 rounded-full border border-neutral-700 flex items-center gap-1 shadow-lg whitespace-nowrap">
                            <Coins className="w-3 h-3 text-yellow-400" />
                            <span className="text-white text-xs font-bold">${displayHeroChips}</span>
                        </div>
                    </div>
                )}
                {/* [UPDATE] Hide Hero Cards until Stage 1 */}
                {showHeroCards && heroCards.map((card, index) => (
                    <motion.div
                        key={`${currentScenario.id}-hero-${index}`}
                        initial={{ y: 200, opacity: 0, rotate: 0 }} // Start further down
                        animate={{ y: 0, opacity: 1, rotate: index === 0 ? -5 : 5 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="origin-bottom"
                    >
                        <PlayingCard card={card} size="lg" className="shadow-2xl ring-2 ring-brand-accent/50" />
                    </motion.div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex-none glass-panel rounded-t-3xl p-4 pb-8 space-y-3 z-20 relative border-t border-white/50">
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    <Button
                        variant="danger"
                        size="lg"
                        className="col-span-1 h-12 px-2"
                        onClick={() => handleActionWithSound('Fold')}
                        // [UPDATE] Disable if not ready OR game not playing
                        disabled={!isReady || gameState !== 'playing'}
                    >
                        FOLD
                    </Button>
                    <Button
                        variant={isCheck ? "outline" : "primary"}
                        size="lg"
                        className={`col-span-1 h-12 px-2 ${isCheck ? "bg-white/50 text-neutral-600" : ""}`}
                        onClick={() => handleActionWithSound('Call')}
                        // [UPDATE] Disable if not ready OR game not playing
                        disabled={!isReady || gameState !== 'playing'}
                    >
                        {isCheck ? "CHECK" : <>CALL ${amountToCall}</>}
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        className="col-span-1 h-12 px-2"
                        onClick={() => handleActionWithSound('Raise')}
                        // [UPDATE] Disable if not ready OR game not playing
                        disabled={!isReady || gameState !== 'playing'}
                    >
                        {raiseAmount ? <>RAISE ${raiseAmount}</> : 'RAISE'}
                    </Button>
                </div>
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
                    onContinue={handleContinueJourney}
                />
            )}
        </div>
    );
}

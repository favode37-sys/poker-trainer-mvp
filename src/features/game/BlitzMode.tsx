import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, ArrowLeft, Trophy, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { TableLayout } from '@/components/game/TableLayout';
import { useBlitzLogic } from './useBlitzLogic';
import { calculateTableSeats, type Position } from '@/lib/poker-engine';
import { useState, useEffect, useRef } from 'react';
import { type Quest } from '@/hooks/useQuests';
import { triggerHaptic } from '@/lib/effects';
import { soundEngine } from '@/lib/sound';
import { leaderboardService, type LeaderboardEntry } from '@/lib/leaderboard';
import { useAchievements } from '@/hooks/useAchievements';
import { analytics } from '@/lib/analytics';
import { statsStore } from '@/lib/stats-store';
import { usePlayerState } from '@/hooks/usePlayerState';

interface BlitzModeProps {
    onBack: () => void;
    onQuestEvent: (type: Quest['type'], amount?: number) => void;
}

export function BlitzMode({ onBack, onQuestEvent }: BlitzModeProps) {
    const [gameOverScore, setGameOverScore] = useState<number | null>(null);
    const [addedTime, setAddedTime] = useState(false);
    const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [showVillainAction, setShowVillainAction] = useState(false);
    const prevScoreRef = useRef(0);

    const { timeLeft, score, streak, currentScenario, handleAction: logicHandleAction } = useBlitzLogic((finalScore, finalStreak) => {
        analytics.blitzEnd(finalScore, finalStreak, 'time_up');
        setGameOverScore(finalScore);
        const currentEntry = leaderboardService.saveScore(finalScore, finalStreak);
        setLeaderboardData(leaderboardService.getLeaderboard(currentEntry));
    });

    const { unlock, lastUnlocked } = useAchievements();
    const { bankroll } = usePlayerState();

    if (!currentScenario) {
        return (
            <div className="absolute inset-0 bg-neutral-bg flex flex-col items-center justify-center p-8 text-center font-sans">
                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <span className="text-4xl">📭</span>
                </div>
                <h2 className="text-2xl font-black text-neutral-800 mb-2">No Hands Found</h2>
                <p className="text-neutral-500 mb-8 leading-relaxed">
                    The Blitz database is empty. Please visit the Secret Admin Dashboard to generate new scenarios.
                </p>
                <Button variant="secondary" size="lg" onClick={onBack}>
                    Return to Map
                </Button>
            </div>
        );
    }

    // Track Blitz session start
    useEffect(() => {
        analytics.blitzStart();
    }, []);

    // Delay villain action reveal for suspense
    useEffect(() => {
        setShowVillainAction(false);
        const timer = setTimeout(() => setShowVillainAction(true), 600); // 600ms delay
        return () => clearTimeout(timer);
    }, [currentScenario.id]);

    // Track score increments for quest progress
    useEffect(() => {
        if (score > prevScoreRef.current) {
            const diff = score - prevScoreRef.current;
            onQuestEvent('blitz_score', diff);
        }
        prevScoreRef.current = score;
    }, [score, onQuestEvent]);

    // Achievement unlock triggers
    useEffect(() => {
        if (streak === 10) unlock('blitz_streak_10');
        if (streak === 25) unlock('blitz_streak_25');
        if (streak === 50) unlock('blitz_streak_50');
        if (streak === 100) unlock('blitz_streak_100');
    }, [streak, unlock]);

    // Milestone Toast Logic
    useEffect(() => {
        if (streak > 0 && (streak === 10 || streak === 25 || streak === 50)) {
            setMilestoneMessage(`🔥 ${streak} STREAK! LEGENDARY!`);
            soundEngine.playBadge();
            const timer = setTimeout(() => setMilestoneMessage(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [streak]);

    const handleActionWrapper = (action: any) => {
        const isCorrect = action === currentScenario.correctAction;

        // Record stats
        statsStore.recordHand(
            isCorrect,
            action,
            currentScenario.correctAction,
            currentScenario.street || 'preflop',
            bankroll
        );

        if (isCorrect) {
            triggerHaptic('success');
            setAddedTime(true);
            setTimeout(() => setAddedTime(false), 1000);

            // Play fire sound on high streak
            if (streak >= 4) {
                soundEngine.playFire();
            }
        } else {
            triggerHaptic('error');
        }

        logicHandleAction(action);
    };

    // --- Engine Logic (Reused) ---
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

    const seatConfigs = calculateTableSeats(heroPosition as Position, villainPosition as Position);

    const seatsArray = seatConfigs.map((config) => {
        if (config.isHero) return undefined;
        if (config.isVillain) {
            // Calculate display bet with fallback to blinds on Preflop
            let rawBet = villainChipsInFront;

            // Fallback for Preflop Blinds if no chips shown
            if (rawBet === 0 && communityCards.length === 0) {
                if (config.positionLabel === 'SB') rawBet = 0.5;
                if (config.positionLabel === 'BB') rawBet = 1.0;
            }

            // Apply delay animation
            const displayVillainBet = showVillainAction ? rawBet : 0;
            const displayVillainAction = showVillainAction ? villainAction : '...';

            return {
                player: { name: 'Villain', stack: 100, isActive: true },
                betAmount: displayVillainBet,
                positionLabel: config.positionLabel,
                isFolded: false,
                lastAction: displayVillainAction,
                isDealer: config.isDealer,
                isHero: false
            };
        }


        // Filler players (non-Hero, non-Villain)
        // Everyone is active initially (history length 0). 
        // Non-blinds fold immediately once any action happens (> 0).
        let isFillerFolded = currentScenario.actionHistory.length > 0;
        let fillerBet = 0;

        // Keep blinds active on Preflop ONLY if no actions have occurred yet
        if (communityCards.length === 0) {
            if (config.positionLabel === 'SB') {
                fillerBet = 0.5;
                // SB stays active longer (until 2nd action)
                isFillerFolded = currentScenario.actionHistory.length > 1;
            } else if (config.positionLabel === 'BB') {
                fillerBet = 1.0;
                // BB stays active longer (until 2nd action)
                isFillerFolded = currentScenario.actionHistory.length > 1;
            }
        }


        return {
            player: { name: `Player ${config.id}`, stack: 100, isActive: !isFillerFolded },
            positionLabel: config.positionLabel,
            isFolded: isFillerFolded,
            lastAction: isFillerFolded ? 'Fold' : '',
            isDealer: config.isDealer,
            betAmount: fillerBet,
            isHero: false
        };
    });

    const seats: [any, any, any, any, any, any] = [
        undefined, ...seatsArray.slice(1)
    ] as any;

    // Calculate accurate pot including current bets and blinds (using delayed villain bet)
    const displayVillainBet = showVillainAction ? villainChipsInFront : 0;
    const fillerBlinds = (communityCards.length === 0) ? 1.5 : 0; // SB (0.5) + BB (1.0) if Preflop
    const activePot = potSize + heroChipsInFront + displayVillainBet + fillerBlinds;

    // Calculate Hero display chips with blind fallback
    const isPreflop = communityCards.length === 0;
    let heroDisplayChips = heroChipsInFront;

    // Fallback: If Preflop and chips are 0, force display of blinds based on position
    if (isPreflop && heroDisplayChips === 0) {
        if (heroPosition === 'SB') heroDisplayChips = 0.5;
        if (heroPosition === 'BB') heroDisplayChips = 1.0;
    }

    // Check if Hero is the dealer
    const isHeroDealer = heroPosition === 'BTN';
    // -----------------------------

    return (
        <div id="blitz-container" className="absolute inset-0 bg-neutral-bg flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <div className="flex-none p-4 flex justify-between items-center glass-panel border-b border-white/50 z-20">
                <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-neutral-600" />
                </button>

                {/* Timer & Score */}
                <div className="flex items-center gap-6">
                    <motion.div
                        animate={{
                            scale: timeLeft <= 10 ? [1, 1.1, 1] : 1,
                            color: timeLeft <= 10 ? "#ef4444" : "#fbbf24"
                        }}
                        transition={{ repeat: timeLeft <= 10 ? Infinity : 0, duration: 0.5 }}
                        className="flex items-center gap-2 font-black text-xl relative"
                    >
                        <Clock className="w-6 h-6" />
                        <span>{timeLeft}s</span>

                        {/* Floating +5s */}
                        <AnimatePresence>
                            {addedTime && (
                                <motion.div
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: 1, y: -20 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute -right-8 text-functional-success text-sm font-bold"
                                >
                                    +5s
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <div className="flex items-center gap-4">
                        {/* Streak Counter - ALWAYS VISIBLE for debugging */}
                        <motion.div
                            animate={{ scale: streak > 0 ? 1 : 0.9, opacity: streak > 0 ? 1 : 0.5 }}
                            className={`flex items-center gap-1 font-black ${streak >= 5 ? 'text-orange-500' : 'text-neutral-400'}`}
                        >
                            <Flame className={`w-5 h-5 ${streak >= 5 ? 'fill-orange-500 animate-pulse' : 'text-neutral-400'}`} />
                            <span>{streak}</span>
                        </motion.div>

                        <div className="flex items-center gap-2 font-black text-xl text-neutral-800">
                            <Trophy className="w-6 h-6 text-brand-primary" />
                            <span>{score}</span>
                        </div>
                    </div>
                </div>

                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Milestone Toast */}
            <AnimatePresence>
                {milestoneMessage && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="absolute top-20 left-0 right-0 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-black shadow-lg border-2 border-white">
                            {milestoneMessage}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Game Area */}
            <div className="flex-1 relative">
                {/* Simplified Table */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="relative w-full h-full max-w-md">
                        <TableLayout seats={seats} communityCards={communityCards} potSize={activePot} />
                    </div>
                </div>

                {/* Hero UI Overlay */}
                <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 flex gap-2 z-30 origin-bottom scale-[0.8]">
                    {heroDisplayChips > 0 && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-neutral-200 font-bold text-sm text-neutral-800 shadow-sm">
                            ${heroDisplayChips}
                        </div>
                    )}
                    {isHeroDealer && (
                        <div className="absolute -top-6 -right-2 h-8 w-8 bg-yellow-400 border-2 border-yellow-600 rounded-full flex items-center justify-center text-xs font-black text-black z-40 shadow-md">
                            D
                        </div>
                    )}
                    {heroCards.map((card, i) => (
                        <PlayingCard key={i} card={card} size="lg" className="shadow-2xl ring-4 ring-brand-primary/50" />
                    ))}
                </div>
            </div>

            {/* Fast Controls */}
            <div className="flex-none p-4 pb-8 glass-panel border-t border-white/50 z-20">
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    <Button variant="danger" size="lg" onClick={() => handleActionWrapper('Fold')} className="h-14 text-lg">FOLD</Button>
                    <Button variant="outline" size="lg" onClick={() => handleActionWrapper('Call')} className="h-14 text-lg">CALL</Button>
                    <Button variant="secondary" size="lg" onClick={() => handleActionWrapper('Raise')} className="h-14 text-lg">RAISE</Button>
                </div>
            </div>

            {/* Game Over Modal */}
            {gameOverScore !== null && (
                <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white text-neutral-800 rounded-3xl p-6 max-w-md w-full text-center shadow-2xl border border-white/50 max-h-[80vh] overflow-y-auto"
                    >
                        <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-8 h-8 text-brand-primary" />
                        </div>
                        <h2 className="text-2xl font-black mb-1">Time's Up!</h2>
                        <div className="text-5xl font-black text-brand-primary mb-6">{gameOverScore}</div>

                        {/* Leaderboard */}
                        <div className="bg-neutral-50 rounded-xl p-4 mb-6 text-left">
                            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Leaderboard</h3>
                            <div className="space-y-2">
                                {leaderboardData.map((entry, index) => (
                                    <div
                                        key={entry.id}
                                        className={`flex items-center justify-between p-2 rounded-lg ${entry.isPlayer ? 'bg-brand-primary/10 border border-brand-primary/20' : 'bg-white border border-neutral-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-yellow-400 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-bold text-sm ${entry.isPlayer ? 'text-brand-primary' : 'text-neutral-700'}`}>
                                                    {entry.name} {entry.isPlayer && '(YOU)'}
                                                </span>
                                                {entry.streak > 5 && (
                                                    <span className="text-[10px] text-orange-500 flex items-center gap-0.5">
                                                        <Flame className="w-3 h-3" /> {entry.streak} streak
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="font-black text-neutral-800">{entry.score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button variant="primary" fullWidth onClick={onBack}>Back to Map</Button>
                    </motion.div>
                </div>
            )}

            {/* Achievement Unlock Notification */}
            <AnimatePresence>
                {lastUnlocked && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 20, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-4 rounded-b-2xl shadow-2xl border-x-2 border-b-2 border-yellow-500 flex items-center gap-4"
                    >
                        <div className="text-4xl">{lastUnlocked.icon}</div>
                        <div>
                            <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Achievement Unlocked</div>
                            <div className="text-lg font-black">{lastUnlocked.title}</div>
                            <div className="text-xs text-slate-400">{lastUnlocked.description}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

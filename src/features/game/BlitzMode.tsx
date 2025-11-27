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

interface BlitzModeProps {
    onBack: () => void;
    onQuestEvent: (type: Quest['type'], amount?: number) => void;
}

export function BlitzMode({ onBack, onQuestEvent }: BlitzModeProps) {
    const [gameOverScore, setGameOverScore] = useState<number | null>(null);
    const [addedTime, setAddedTime] = useState(false);
    const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const prevScoreRef = useRef(0);

    const { timeLeft, score, streak, currentScenario, handleAction: logicHandleAction } = useBlitzLogic((finalScore, finalStreak) => {
        setGameOverScore(finalScore);
        const currentEntry = leaderboardService.saveScore(finalScore, finalStreak);
        setLeaderboardData(leaderboardService.getLeaderboard(currentEntry));
    });

    // Track score increments for quest progress
    useEffect(() => {
        if (score > prevScoreRef.current) {
            const diff = score - prevScoreRef.current;
            onQuestEvent('blitz_score', diff);
        }
        prevScoreRef.current = score;
    }, [score, onQuestEvent]);

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
            return {
                player: { name: 'Villain', stack: 100, isActive: true },
                betAmount: villainChipsInFront,
                positionLabel: config.positionLabel,
                isFolded: false,
                lastAction: villainAction,
                isDealer: config.isDealer,
                isHero: false
            };
        }
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

    const seats: [any, any, any, any, any, any] = [
        undefined, ...seatsArray.slice(1)
    ] as any;
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
                        <TableLayout seats={seats} communityCards={communityCards} potSize={potSize} />
                    </div>
                </div>

                {/* Hero UI Overlay */}
                <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 flex gap-2 z-30 origin-bottom scale-[0.8]">
                    {heroChipsInFront > 0 && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-neutral-200 font-bold text-sm text-neutral-800 shadow-sm">
                            {heroChipsInFront} BB
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
        </div>
    );
}

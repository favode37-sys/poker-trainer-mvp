import { motion } from 'framer-motion';
import { Zap, Clock, ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { TableLayout } from '@/components/game/TableLayout';
import { useBlitzLogic } from './useBlitzLogic';
import { calculateTableSeats, type Position } from '@/lib/poker-engine';
import { useState, useEffect, useRef } from 'react';
import { type Quest } from '@/hooks/useQuests';

interface BlitzModeProps {
    onBack: () => void;
    onQuestEvent: (type: Quest['type'], amount?: number) => void;
}

export function BlitzMode({ onBack, onQuestEvent }: BlitzModeProps) {
    const [gameOverScore, setGameOverScore] = useState<number | null>(null);
    const prevScoreRef = useRef(0);

    const { timeLeft, score, currentScenario, handleAction, isActive } = useBlitzLogic((finalScore) => {
        setGameOverScore(finalScore);
    });

    // Track score increments for quest progress
    useEffect(() => {
        if (score > prevScoreRef.current) {
            const diff = score - prevScoreRef.current;
            onQuestEvent('blitz_score', diff);
        }
        prevScoreRef.current = score;
    }, [score, onQuestEvent]);

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
        <div id="blitz-container" className="absolute inset-0 bg-indigo-900 flex flex-col overflow-hidden font-sans text-white">
            {/* Header */}
            <div className="flex-none p-4 flex justify-between items-center bg-indigo-950/50 backdrop-blur-md border-b border-white/10">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>

                {/* Timer & Score */}
                <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-2 font-black text-xl ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                        <Clock className="w-6 h-6" />
                        <span>{timeLeft}s</span>
                    </div>
                    <div className="flex items-center gap-2 font-black text-xl text-white">
                        <Trophy className="w-6 h-6 text-indigo-400" />
                        <span>{score}</span>
                    </div>
                </div>

                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Game Area */}
            <div className="flex-1 relative">
                {/* Simplified Table - slightly darker/focused theme */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="relative w-full h-full max-w-md opacity-90">
                        <TableLayout seats={seats} communityCards={communityCards} potSize={potSize} />
                    </div>
                </div>

                {/* Hero UI Overlay */}
                <div className="absolute bottom-[138px] left-1/2 -translate-x-1/2 flex gap-2 z-30 origin-bottom scale-[0.8]">
                    {heroChipsInFront > 0 && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-1 rounded-full border border-white/20 font-bold text-sm">
                            {heroChipsInFront} BB
                        </div>
                    )}
                    {heroCards.map((card, i) => (
                        <PlayingCard key={i} card={card} size="lg" className="shadow-2xl ring-4 ring-indigo-500" />
                    ))}
                </div>
            </div>

            {/* Fast Controls */}
            <div className="flex-none p-4 pb-8 bg-indigo-950 border-t border-white/10">
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    <Button variant="danger" size="lg" onClick={() => handleAction('Fold')} className="h-14 text-lg">FOLD</Button>
                    <Button variant="outline" size="lg" onClick={() => handleAction('Call')} className="h-14 text-lg bg-indigo-800 border-indigo-600 text-white hover:bg-indigo-700">CALL</Button>
                    <Button variant="secondary" size="lg" onClick={() => handleAction('Raise')} className="h-14 text-lg bg-emerald-500 border-emerald-700 hover:bg-emerald-400">RAISE</Button>
                </div>
            </div>

            {/* Game Over Modal */}
            {gameOverScore !== null && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white text-slate-900 rounded-3xl p-8 max-w-xs w-full text-center"
                    >
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-black mb-2">Time's Up!</h2>
                        <p className="text-slate-500 mb-6">You solved</p>
                        <div className="text-6xl font-black text-indigo-600 mb-8">{gameOverScore}</div>
                        <Button variant="primary" fullWidth onClick={onBack}>Back to Map</Button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

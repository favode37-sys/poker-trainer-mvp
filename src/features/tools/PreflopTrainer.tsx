import { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Settings, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { type Card, type Action } from '@/lib/types';
import { pokerEvaluator } from '@/lib/poker-evaluator';
import { RangeChart } from '@/components/ui/RangeChart';
import { AnimatePresence, motion } from 'framer-motion';
import { chartStore } from '@/lib/chart-store';
import { soundEngine } from '@/lib/sound';
import { triggerHaptic } from '@/lib/effects';
import { cn } from '@/lib/utils';

// Helper to generate full range for a position
const generateOpeningRange = (position: string): Set<string> => {
    // 1. Try to find custom chart first
    const charts = chartStore.getAll();
    const matchingChart = charts.find(c => c.position === position && c.mode === 'cash'); // Simple match for now

    if (matchingChart) {
        return new Set(matchingChart.range);
    }

    // 2. Fallback to Heuristic Evaluator
    const range = new Set<string>();
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

    for (let i = 0; i < ranks.length; i++) {
        for (let j = 0; j < ranks.length; j++) {
            const r1 = ranks[i];
            const r2 = ranks[j];

            let c1: Card, c2: Card;
            let handStr = "";

            if (i === j) { // Pair
                c1 = { rank: r1, suit: 'hearts' } as Card;
                c2 = { rank: r2, suit: 'spades' } as Card;
                handStr = r1 + r2;
            } else if (i < j) { // Suited (upper triangle)
                c1 = { rank: r1, suit: 'hearts' } as Card;
                c2 = { rank: r2, suit: 'hearts' } as Card;
                handStr = r1 + r2 + 's';
            } else { // Offsuit (lower triangle)
                c1 = { rank: r2, suit: 'hearts' } as Card; // High card
                c2 = { rank: r1, suit: 'spades' } as Card; // Low card
                handStr = r2 + r1 + 'o';
            }

            const result = pokerEvaluator.evaluate([c1, c2], [], 0, 1.5);
            if (result.action === 'Raise') {
                range.add(handStr);
            }
        }
    }
    return range;
};

interface PreflopTrainerProps {
    onBack: () => void;
}

const POSITIONS = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

export function PreflopTrainer({ onBack }: PreflopTrainerProps) {
    const [isSetup, setIsSetup] = useState(true);
    const [heroCards, setHeroCards] = useState<Card[]>([]);
    const [position, setPosition] = useState('BTN');
    const [feedback, setFeedback] = useState<{ correct: boolean; msg: string } | null>(null);
    const [streak, setStreak] = useState(0);
    const [showChart, setShowChart] = useState(false);
    const [currentRange, setCurrentRange] = useState<Set<string>>(new Set());
    const [formattedHand, setFormattedHand] = useState("");

    // Initial Deal
    const dealHand = () => {
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        const suits = ['spades', 'hearts', 'diamonds', 'clubs'] as const;

        const c1 = { rank: ranks[Math.floor(Math.random() * 13)], suit: suits[Math.floor(Math.random() * 4)] };
        let c2 = { rank: ranks[Math.floor(Math.random() * 13)], suit: suits[Math.floor(Math.random() * 4)] };

        // Ensure distinct cards
        while (c1.rank === c2.rank && c1.suit === c2.suit) {
            c2 = { rank: ranks[Math.floor(Math.random() * 13)], suit: suits[Math.floor(Math.random() * 4)] };
        }

        setHeroCards([c1 as Card, c2 as Card]);

        // Format hand for chart highlighting
        const r1 = c1.rank;
        const r2 = c2.rank;
        const RANKS_STR = "AKQJT98765432";
        const idx1 = RANKS_STR.indexOf(r1);
        const idx2 = RANKS_STR.indexOf(r2);

        let hStr = "";
        if (idx1 === idx2) hStr = r1 + r2;
        else if (c1.suit === c2.suit) {
            // Ensure high card first
            hStr = (idx1 < idx2 ? r1 + r2 : r2 + r1) + 's';
        } else {
            hStr = (idx1 < idx2 ? r1 + r2 : r2 + r1) + 'o';
        }
        setFormattedHand(hStr);

        setFeedback(null);
        setShowChart(false);
    };

    const handleStart = () => {
        setIsSetup(false);
        dealHand();
    };

    const handleAction = (action: Action) => {
        let correctAction: Action = 'Fold';
        let reason = '';

        // 1. Check Custom Charts
        const charts = chartStore.getAll();
        const matchingChart = charts.find(c => c.position === position && c.mode === 'cash');

        if (matchingChart) {
            if (matchingChart.range.includes(formattedHand)) {
                correctAction = 'Raise';
                reason = `Custom Chart: ${matchingChart.title}`;
            } else {
                correctAction = 'Fold';
                reason = `Not in ${matchingChart.title} range`;
            }
        } else {
            // 2. Fallback to Evaluator
            const evalResult = pokerEvaluator.evaluate([heroCards[0], heroCards[1]], [], 0, 1.5);
            correctAction = evalResult.action;
            reason = evalResult.reason;
        }

        const isCorrect = correctAction === action;

        if (isCorrect) {
            soundEngine.playSuccess();
            triggerHaptic('success');
            setFeedback({ correct: true, msg: "Correct! " + reason });
            setStreak(s => s + 1);
            setTimeout(dealHand, 1500);
        } else {
            soundEngine.playError();
            triggerHaptic('error');
            setFeedback({ correct: false, msg: `Wrong. Best move: ${correctAction} (${reason})` });
            setStreak(0);

            // Generate and show chart
            const range = generateOpeningRange(position);
            setCurrentRange(range);
            setShowChart(true);
        }
    };

    if (isSetup) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans p-6">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h1 className="text-2xl font-black text-slate-800">Trainer Setup</h1>
                </div>

                <div className="flex-1 flex flex-col gap-8 max-w-md mx-auto w-full">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Select Position
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {POSITIONS.map(pos => (
                                <button
                                    key={pos}
                                    onClick={() => setPosition(pos)}
                                    className={cn(
                                        "py-3 rounded-xl font-bold text-sm transition-all border-2",
                                        position === pos
                                            ? "bg-brand-primary text-white border-brand-primary shadow-lg scale-105"
                                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                                    )}
                                >
                                    {pos}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button size="lg" onClick={handleStart} className="h-16 text-xl shadow-xl shadow-brand-primary/20">
                        <Play className="w-6 h-6 mr-2 fill-current" />
                        START DRILL
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <button onClick={() => setIsSetup(true)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                <h1 className="font-black text-slate-800">Preflop Trainer</h1>
                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold text-sm">
                    🔥 {streak}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">

                <div className="text-center space-y-2">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider">Your Position</div>
                    <div className="text-3xl font-black text-slate-800">{position}</div>
                    <div className="text-slate-500 text-xs">Everyone folded to you</div>
                </div>

                <div className="flex gap-4">
                    {heroCards.map((c, i) => (
                        <PlayingCard key={i} card={c} size="lg" className="shadow-xl" />
                    ))}
                </div>

                {/* Feedback Overlay */}
                <div className="h-16 flex items-center justify-center">
                    {feedback && (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold animate-in fade-in slide-in-from-bottom-2 ${feedback.correct ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            {feedback.correct ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            <span>{feedback.msg}</span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <Button variant="danger" size="lg" onClick={() => handleAction('Fold')}>Fold</Button>
                    <Button variant="secondary" size="lg" onClick={() => handleAction('Raise')}>Raise</Button>
                </div>
            </div>

            {/* Range Chart Overlay */}
            <AnimatePresence>
                {showChart && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col items-center gap-6"
                        >
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-slate-800">Study the Range</h2>
                                <p className="text-slate-500">Here is the correct opening strategy for {position}</p>
                            </div>

                            <RangeChart range={currentRange} heroHand={formattedHand} title="Opening Range" />

                            <Button size="lg" fullWidth onClick={dealHand}>Next Hand</Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

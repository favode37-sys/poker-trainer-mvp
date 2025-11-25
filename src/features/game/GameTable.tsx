import { motion } from 'framer-motion';
import { Flame, ArrowLeft, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { PokerChip } from '@/components/ui/PokerChip';
import { FeedbackSheet } from '@/components/ui/FeedbackSheet';
import { LevelCompleteModal } from '@/components/ui/LevelCompleteModal';
import { TableLayout } from '@/components/game/TableLayout';
import { useGameLogic } from './useGameLogic';
import { soundEngine } from '@/lib/sound';

interface GameTableProps {
    levelId: string;
    levelTitle: string;
    scenarioIds: string[];
    xpReward: number;
    onLevelComplete: (levelId: string) => void;
    onBackToMap: () => void;
}

export function GameTable({ levelId, levelTitle, scenarioIds, xpReward, onLevelComplete, onBackToMap }: GameTableProps) {
    const {
        currentScenario,
        lives,
        streak,
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
            console.log('🎊 All scenarios completed for level:', levelId);
        }
    });

    const [showExplanation, setShowExplanation] = useState(false);
    const { villainAction, villainPosition, heroCards, communityCards, potSize } = currentScenario;

    useEffect(() => {
        soundEngine.init();
    }, []);

    useEffect(() => {
        if (gameState === 'levelComplete') {
            soundEngine.playLevelComplete();
        }
        // Reset explanation state when starting new move or closing sheet
        if (gameState === 'playing' || gameState === null) {
            setShowExplanation(false);
        }
    }, [gameState]);

    const handleContinueJourney = () => {
        onLevelComplete(levelId);
        onBackToMap();
    };

    const handleActionWithSound = (action: 'Fold' | 'Call' | 'Raise') => {
        soundEngine.playClick();
        handleAction(action);
    };

    const ORDER = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'];
    const heroPosition = currentScenario.heroPosition || 'BTN'; // Default to BTN if missing
    const heroIndex = ORDER.indexOf(heroPosition);
    const rotatedOrder = [
        ...ORDER.slice(heroIndex),
        ...ORDER.slice(0, heroIndex)
    ];

    // Helper to determine blind amount based on position
    const getBlind = (label: string) => {
        // Only post blinds Preflop (no community cards)
        if (communityCards.length > 0) return 0;

        if (label === 'SB') return 0.5;
        if (label === 'BB') return 1.0;
        return 0;
    };

    // Helper to create a filler player
    const createFiller = (index: number, label: string) => {
        const blind = getBlind(label);
        return {
            player: { name: `Player ${index + 1}`, stack: 100 - blind, isActive: false },
            positionLabel: label,
            isFolded: true,
            lastAction: 'Fold',
            isDealer: label === 'BTN',
            betAmount: blind
        };
    };

    // Calculate Hero's state
    const heroBlind = getBlind(heroPosition);
    // const heroStack = 100 - heroBlind; // Assuming 100 BB starting stack for Hero if not specified

    // Calculate Opponent's state
    const opponentLabel = villainPosition;
    const opponentBlind = getBlind(opponentLabel);
    const opponentActionAmount = villainAction.includes('Bet') || villainAction.includes('Raise') || villainAction.includes('Limps')
        ? parseInt(villainAction.match(/\d+/)?.[0] || '0')
        : 0;
    const opponentBet = Math.max(opponentActionAmount, opponentBlind);
    const opponentStack = 100 - opponentBet; // Assuming 100 BB starting stack

    const seats: [any, any, any, any, any, any] = [
        undefined, // Seat 1: Hero (Always hidden/undefined in seats array, rendered separately)
        createFiller(1, rotatedOrder[1]), // Seat 2
        createFiller(2, rotatedOrder[2]), // Seat 3
        { // Seat 4: Opponent
            player: { name: 'Villain', stack: opponentStack, isActive: true },
            betAmount: opponentBet,
            positionLabel: opponentLabel,
            isFolded: false,
            lastAction: villainAction,
            isDealer: opponentLabel === 'BTN'
        },
        createFiller(4, rotatedOrder[4]), // Seat 5
        createFiller(5, rotatedOrder[5]), // Seat 6
    ];

    const amountToCall = currentScenario.amountToCall ?? Math.max(0, opponentBet - heroBlind);
    const isCheck = amountToCall === 0;
    const raiseAmount = currentScenario.defaultRaiseAmount;

    const explanationToPass = (gameState === 'error' || showExplanation)
        ? currentScenario.explanation_deep
        : null;

    return (
        <div className="absolute inset-0 bg-emerald-100 flex flex-col overflow-hidden font-sans">
            <div className="flex-none relative z-10 bg-white border-b border-slate-200 shadow-sm">
                <div className="h-2 bg-slate-100 w-full">
                    <motion.div className="h-full bg-yellow-400 rounded-r-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>
                <div className="flex justify-between items-center p-2 px-4 h-14">
                    <button onClick={onBackToMap} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                            <PokerChip color="blue" size="sm" />
                            <span className="font-bold text-slate-700 text-sm">{lives} BB</span>
                        </div>
                        <div className="flex items-center gap-1 text-brand-red font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">
                            <Flame className="w-5 h-5 fill-current" />
                            <span>{streak}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 w-full flex items-center justify-center relative p-4">
                <div className="relative w-full h-full max-w-md">
                    <TableLayout seats={seats} communityCards={communityCards} potSize={potSize} />
                </div>
            </div>

            <div className="absolute bottom-[138px] left-[30px] flex gap-2 z-30 origin-bottom-left scale-[0.8]">
                {/* Dealer Button for Hero */}
                {heroPosition === 'BTN' && (
                    <div className="absolute -top-4 -right-4 h-8 w-8 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center text-sm font-bold text-slate-900 z-40 shadow-md">
                        D
                    </div>
                )}
                {/* Hero Chips (Blinds/Bets) */}
                {heroBlind > 0 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
                        <div className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1 shadow-sm">
                            <Coins className="w-3 h-3 text-yellow-400" />
                            <span className="text-white text-xs font-bold">{heroBlind} BB</span>
                        </div>
                    </div>
                )}
                {heroCards.map((card, index) => (
                    <motion.div key={`${currentScenario.id}-hero-${index}`} initial={{ y: 50, opacity: 0, rotate: index === 0 ? -5 : 5 }} animate={{ y: 0, opacity: 1, rotate: index === 0 ? -5 : 5 }} transition={{ delay: 0.2 + index * 0.1, type: 'spring', stiffness: 150 }} whileHover={{ y: -10, rotate: 0, transition: { duration: 0.2 } }}>
                        <PlayingCard card={card} size="lg" className="shadow-2xl ring-2 ring-yellow-400" />
                    </motion.div>
                ))}
            </div>

            <div className="flex-none bg-white rounded-t-3xl shadow-[0_-4px_30px_rgba(0,0,0,0.1)] p-4 pb-8 space-y-3 z-20 relative">
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    <Button variant="danger" size="lg" className="col-span-1 h-12 text-sm sm:text-base px-2" onClick={() => handleActionWithSound('Fold')} disabled={gameState !== 'playing'}>FOLD</Button>
                    <Button
                        variant={isCheck ? "outline" : "primary"}
                        size="lg"
                        className={`col-span-1 h-12 text-sm sm:text-base px-2 ${isCheck ? "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200" : ""}`}
                        onClick={() => handleActionWithSound('Call')}
                        disabled={gameState !== 'playing'}
                    >
                        {isCheck ? "CHECK" : <>CALL {amountToCall}<span className="text-xs ml-0.5">BB</span></>}
                    </Button>
                    <Button variant="secondary" size="lg" className="col-span-1 h-12 text-sm sm:text-base px-2" onClick={() => handleActionWithSound('Raise')} disabled={gameState !== 'playing'}>
                        {raiseAmount ? <>RAISE {raiseAmount}<span className="text-xs ml-0.5">BB</span></> : 'RAISE'}
                    </Button>
                </div>

            </div>

            <FeedbackSheet
                state={gameState === 'success' || gameState === 'error' ? gameState : null}
                message={feedbackMessage}
                explanation={explanationToPass}
                onNext={handleNext}
                onExpand={() => setShowExplanation(true)}
            />
            {gameState === 'levelComplete' && <LevelCompleteModal levelTitle={levelTitle} xpEarned={xpReward} correctAnswers={correctAnswers} totalQuestions={totalQuestions} onContinue={handleContinueJourney} />}
        </div>
    );
}

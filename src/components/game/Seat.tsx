import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BettingStack } from './BettingStack';

interface Player {
    name: string;
    stack: number;
    avatar?: string;
    isActive: boolean;
}

interface SeatProps {
    position: number; // 1-6
    player?: Player;
    positionLabel?: string;
    betAmount?: number;
    isDealer?: boolean;
    isHero?: boolean;
    isFolded?: boolean;
    lastAction?: string;
}

export function Seat({ position, player, positionLabel, betAmount = 0, isDealer = false, isHero = false, isFolded = false, lastAction }: SeatProps) {
    if (!player) return null; // Empty seat

    return (
        <div className={cn("relative flex flex-col items-center justify-center transition-all duration-500", isFolded ? "opacity-50 grayscale" : "opacity-100")}>

            {/* 1. PLAYER TOKEN (The Seat Itself) */}
            <div className="relative group">

                {/* Active Cards (Peeking from behind) */}
                {!isFolded && !isHero && (
                    <div className="absolute -z-10 top-[-10px] left-1/2 -translate-x-1/2 flex gap-1 w-12 h-10">
                        <div className="w-6 h-8 bg-white border-2 border-slate-300 rounded-sm rotate-[-15deg] shadow-sm" />
                        <div className="w-6 h-8 bg-white border-2 border-slate-300 rounded-sm rotate-[15deg] shadow-sm -ml-3" />
                    </div>
                )}

                {/* The "Clay" Token Body */}
                <div className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center relative z-10 transition-transform",
                    "bg-slate-100 shadow-[inset_2px_2px_5px_rgba(255,255,255,1),inset_-2px_-2px_5px_rgba(0,0,0,0.1),0_5px_10px_rgba(0,0,0,0.15)]", // Claymorphism
                    isHero ? "ring-4 ring-yellow-400/50" : "border-4 border-slate-200"
                )}>
                    {/* Avatar */}
                    <span className="text-2xl sm:text-3xl select-none filter drop-shadow-sm">
                        {player.avatar || '👤'}
                    </span>

                    {/* Dealer Button (Pinned to Token) */}
                    {isDealer && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-md z-20 text-yellow-900">
                            D
                        </div>
                    )}
                </div>

                {/* Name & Stack Badge (Floating below) */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-max">
                    <div className="bg-slate-800 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-lg border border-slate-600 flex items-center gap-1">
                        <span className="text-slate-400 uppercase tracking-tighter text-[8px]">{positionLabel}</span>
                        <span>${player.stack}</span>
                    </div>
                </div>

                {/* ACTION BUBBLE (Pop-up) */}
                <AnimatePresence>
                    {lastAction && !isFolded && (
                        <motion.div
                            initial={{ scale: 0, y: 10, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 z-30"
                        >
                            <div className={cn(
                                "px-3 py-1 rounded-lg font-black text-xs shadow-xl border-b-2 uppercase whitespace-nowrap",
                                lastAction.includes('Fold') ? "bg-red-500 text-white border-red-700" :
                                    lastAction.includes('Raise') ? "bg-orange-500 text-white border-orange-700" :
                                        "bg-white text-slate-800 border-slate-300"
                            )}>
                                {lastAction}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 2. BET CHIPS (Animating to Pot) */}
            <AnimatePresence>
                {betAmount > 0 && (
                    <BettingStack amount={betAmount} position={position} />
                )}
            </AnimatePresence>
        </div>
    );
}

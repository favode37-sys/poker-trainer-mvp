import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

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

const SEAT_COLORS = [
    { border: 'border-red-500', text: 'text-red-600' },       // Pos 1
    { border: 'border-blue-500', text: 'text-blue-600' },     // Pos 2
    { border: 'border-emerald-500', text: 'text-emerald-600' }, // Pos 3
    { border: 'border-purple-500', text: 'text-purple-600' }, // Pos 4
    { border: 'border-orange-500', text: 'text-orange-600' }, // Pos 5
    { border: 'border-cyan-500', text: 'text-cyan-600' },     // Pos 6
];

const SEAT_ANIMALS = ['🦊', '🐼', '🦁', '🐻', '🐸', '🦉'];

export function Seat({ position, player, positionLabel, betAmount = 0, isDealer = false, isHero = false, isFolded = false, lastAction }: SeatProps) {
    if (!player) return null;

    const activeColors = SEAT_COLORS[(position - 1) % SEAT_COLORS.length];
    const animal = SEAT_ANIMALS[(position - 1) % SEAT_ANIMALS.length];

    const colors = isFolded ? { border: 'border-slate-300', text: 'text-slate-400' } : activeColors;

    // RESPONSIVE CHIP POSITIONING
    // Mobile: Closer to avatar (-8 / 2rem). Desktop: Standard (-12 / 3rem).
    const getChipPosition = (pos: number) => {
        switch (pos) {
            case 1: return "-top-8 sm:-top-10 left-1/2 -translate-x-1/2";
            case 2: return "-top-2 -right-8 sm:-top-4 sm:-right-12";
            case 3: return "-bottom-2 -right-8 sm:-bottom-4 sm:-right-12";
            case 4: return "-bottom-8 sm:-bottom-10 left-1/2 -translate-x-1/2";
            case 5: return "-bottom-2 -left-8 sm:-bottom-4 sm:-left-12";
            case 6: return "-top-2 -left-8 sm:-top-4 sm:-left-12";
            default: return "-top-10";
        }
    };

    return (
        <div className={`relative w-20 sm:w-24 rounded-2xl p-1 sm:p-1.5 overflow-visible shadow-[0_8px_16px_-2px_rgba(0,0,0,0.3),0_4px_8px_-2px_rgba(0,0,0,0.15)] border-b-4 transition-all duration-300 ${isFolded ? 'bg-slate-100 opacity-75 border-slate-200' : 'bg-white border-slate-300'}`}>

            {/* Dealer Button */}
            {isDealer && (
                <div className="absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-900 z-20 shadow-md">
                    D
                </div>
            )}

            {/* Bet Amount (Animated) */}
            <AnimatePresence>
                {betAmount > 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={`absolute ${getChipPosition(position)} flex flex-col items-center z-30`}
                    >
                        <div className="bg-black/60 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 rounded-full border border-white/20 flex items-center gap-1 shadow-sm whitespace-nowrap">
                            <Coins className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" />
                            <span className="text-white text-[10px] sm:text-xs font-bold">{betAmount} BB</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Cards Indicator (Hidden for Hero & Folded) */}
            {!isFolded && !isHero && (
                <div className={`absolute z-20 flex scale-75 sm:scale-100 origin-center ${(position >= 2 && position <= 4)
                    ? "-bottom-1 -right-3 sm:-bottom-2 sm:-right-4"
                    : "-bottom-1 -left-3 sm:-bottom-2 sm:-left-4"
                    }`}>
                    <div className="w-5 h-7 bg-blue-600 rounded-[2px] border border-white shadow-sm transform -rotate-12 origin-bottom-right"></div>
                    <div className="w-5 h-7 bg-blue-600 rounded-[2px] border border-white shadow-sm transform rotate-6 -ml-3"></div>
                </div>
            )}

            {/* Inner Content */}
            <div className={`h-full w-full rounded-xl border-[3px] flex flex-col overflow-hidden ${colors.border} ${isFolded ? 'bg-slate-50' : 'bg-white'}`}>
                {/* Avatar */}
                <div className={`flex-[0.45] flex items-center justify-center p-1 ${isFolded ? 'bg-slate-200/50' : 'bg-slate-50/50'}`}>
                    <div className={`h-10 w-10 sm:h-14 sm:w-14 rounded-full border-2 flex items-center justify-center ${isFolded ? 'bg-slate-100 grayscale opacity-50' : 'bg-white'} ${colors.border}`}>
                        {player.avatar ? (
                            <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-2xl sm:text-3xl">{animal}</span>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className={`flex-1 flex flex-col justify-center gap-0.5 sm:gap-1 ${isFolded ? 'bg-slate-50' : 'bg-white'}`}>
                    <div className={`flex items-center py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold border-y ${isFolded ? 'text-slate-400 border-slate-300' : `text-slate-700 ${colors.border}`}`}>
                        <span className={`flex-1 text-center border-r ${isFolded ? 'border-slate-300' : colors.border}`}>{positionLabel || 'POS'}</span>
                        <span className="flex-1 text-center">
                            {player.stack}<span className="hidden sm:inline text-[8px] ml-0.5 opacity-70">BB</span>
                        </span>
                    </div>
                    <div className={`px-1 text-center text-xs sm:text-sm font-extrabold truncate leading-tight ${colors.text}`}>
                        {lastAction || '\u00A0'}
                    </div>
                </div>
            </div>
        </div>
    );
}

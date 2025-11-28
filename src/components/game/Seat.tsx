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



const SEAT_ANIMALS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'];

export function Seat({ position, player, positionLabel, betAmount = 0, isDealer = false, isHero = false, isFolded = false, lastAction }: SeatProps) {
    if (!player) return null;

    const animal = SEAT_ANIMALS[(position - 1) % SEAT_ANIMALS.length];

    // RESPONSIVE CHIP POSITIONING
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
        <div className="relative w-20 sm:w-24 rounded-2xl p-1 transition-all duration-300">

            {/* Dealer Button */}
            {isDealer && (
                <div className="absolute -top-2 -right-2 h-5 w-5 sm:h-6 sm:w-6 bg-yellow-400 border border-yellow-600 text-yellow-900 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold z-20 shadow-sm">
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
                        <div className="bg-neutral-800 px-2 py-1 rounded-full border border-neutral-700 flex items-center gap-1 shadow-lg whitespace-nowrap">
                            <Coins className="w-3 h-3 text-yellow-400" />
                            <span className="text-white text-xs font-bold">{betAmount} BB</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Cards Indicator */}
            {!isFolded && !isHero && (
                <div className={`absolute z-20 flex scale-75 sm:scale-100 origin-center ${(position >= 2 && position <= 4)
                    ? "-bottom-1 -right-3 sm:-bottom-2 sm:-right-4"
                    : "-bottom-1 -left-3 sm:-bottom-2 sm:-left-4"
                    }`}>
                    <div className="w-5 h-7 bg-brand-primary rounded-[2px] border border-white shadow-sm transform -rotate-12 origin-bottom-right"></div>
                    <div className="w-5 h-7 bg-brand-primary rounded-[2px] border border-white shadow-sm transform rotate-6 -ml-3"></div>
                </div>
            )}

            {/* Inner Content - Glassmorphism Card with opacity effect applied here */}
            <div className={`h-full w-full rounded-xl flex flex-col overflow-hidden border border-neutral-200 transition-all duration-300 ${isFolded
                    ? 'opacity-40 grayscale blur-[0.5px] scale-95 bg-neutral-100'
                    : 'scale-100 bg-white shadow-md ring-2 ring-brand-primary/20'
                }`}>
                {/* Avatar */}
                <div className="flex-[0.5] flex items-center justify-center p-1 bg-neutral-50">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center bg-white border border-neutral-100 shadow-inner text-2xl">
                        {player.avatar ? (
                            <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span>{animal}</span>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-center gap-0.5 bg-white p-1">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs font-extrabold border-b border-neutral-100 pb-0.5">
                        <span className="text-neutral-600 tracking-wider">{positionLabel || 'POS'}</span>
                        <span className="text-black text-sm">{player.stack}</span>
                    </div>
                    <div className="text-center text-xs sm:text-sm font-bold truncate text-brand-primary h-5 flex items-center justify-center">
                        {lastAction || ''}
                    </div>
                </div>
            </div>
        </div>
    );
}

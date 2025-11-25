import { motion } from 'framer-motion';
import { Seat } from './Seat';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { type Card } from '@/lib/types';

interface Player {
    name: string;
    stack: number;
    avatar?: string;
    isActive: boolean;
}

interface SeatData {
    player?: Player;
    betAmount?: number;
    isDealer?: boolean;
    isHero?: boolean;
    positionLabel?: string;
}

interface TableLayoutProps {
    seats: [SeatData?, SeatData?, SeatData?, SeatData?, SeatData?, SeatData?];
    communityCards: Card[];
    potSize: number;
}

export function TableLayout({ seats, communityCards, potSize }: TableLayoutProps) {
    return (
        <div className="relative w-full h-full">
            {/* The Felt */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-[120px] border-8 border-emerald-800 shadow-[inset_0_4px_30px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] rounded-[110px]" />
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
                    <span className="text-8xl font-black text-white rotate-90 tracking-widest">POKER</span>
                </div>
            </div>

            {/* Seat 1 - Hero (Bottom Center) */}
            {seats[0] && (
                <div className="absolute bottom-[-9px] left-1/2 -translate-x-1/2 z-30">
                    <Seat position={1} {...seats[0]} />
                </div>
            )}

            {/* Seat 2 - Bottom Left */}
            {seats[1] && (
                <div className="absolute bottom-[20%] -left-[9px]">
                    <Seat position={2} {...seats[1]} />
                </div>
            )}

            {/* Seat 3 - Top Left */}
            {seats[2] && (
                <div className="absolute top-[20%] -left-[9px]">
                    <Seat position={3} {...seats[2]} />
                </div>
            )}

            {/* Seat 4 - Top Center */}
            {seats[3] && (
                <div className="absolute top-[-9px] left-1/2 -translate-x-1/2">
                    <Seat position={4} {...seats[3]} />
                </div>
            )}

            {/* Seat 5 - Top Right */}
            {seats[4] && (
                <div className="absolute top-[20%] -right-[9px]">
                    <Seat position={5} {...seats[4]} />
                </div>
            )}

            {/* Seat 6 - Bottom Right */}
            {seats[5] && (
                <div className="absolute bottom-[20%] -right-[9px]">
                    <Seat position={6} {...seats[5]} />
                </div>
            )}

            {/* Center Area */}
            {/* Center Area - Community Cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 justify-center items-center">
                {communityCards.length > 0 ? (
                    <>
                        {communityCards.map((card, index) => (
                            <motion.div
                                key={`${card.rank}-${card.suit}-${index}`}
                                initial={{ y: -20, opacity: 0, rotateX: 90 }}
                                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                                transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                            >
                                <div className="w-14 h-20">
                                    <PlayingCard card={card} size="md" className="shadow-lg w-full h-full" />
                                </div>
                            </motion.div>
                        ))}
                        {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                className="w-14 h-20 rounded bg-white/5 border-2 border-white/20 border-dashed"
                            />
                        ))}
                    </>
                ) : (
                    <div className="flex gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={`preflop-${i}`}
                                className="w-14 h-20 rounded bg-white/5 border-2 border-white/20 border-dashed"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pot Info - Positioned below cards */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, x: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%" }}
                className="absolute top-1/2 left-1/2 mt-14 bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full border border-white/20 z-10"
            >
                <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm">🪙</span>
                    <span className="text-white font-black text-sm">{potSize} BB</span>
                </div>
            </motion.div>
        </div>
    );
}

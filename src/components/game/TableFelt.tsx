import { motion } from 'framer-motion';
import { type Card } from '@/lib/types';
import { PlayingCard } from '@/components/ui/PlayingCard';

interface TableFeltProps {
    communityCards: Card[];
    potSize: number;
    themeClass?: string;
}

export function TableFelt({ communityCards, potSize, themeClass }: TableFeltProps) {
    return (
        <div className={`relative w-full h-full max-w-md mx-auto rounded-[100px] border-8 shadow-[inset_0_4px_20px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center overflow-hidden ${themeClass || 'bg-emerald-100 border-emerald-200'}`}>

            {/* Table Texture/Logo Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                <span className="text-6xl font-black text-black/10 tracking-widest rotate-90">POKER</span>
            </div>

            {/* Center Content Group */}
            <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-8 -mt-16">

                {/* Community Cards */}
                <div className="flex gap-1 sm:gap-2 justify-center h-20 sm:h-24 items-center">
                    {communityCards.length > 0 ? (
                        <>
                            {communityCards.map((card, index) => (
                                <motion.div
                                    key={`${card.rank}-${card.suit}-${index}`}
                                    initial={{ y: -20, opacity: 0, scale: 0.8 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                                >
                                    <PlayingCard card={card} size="sm" className="shadow-md scale-90 sm:scale-100" />
                                </motion.div>
                            ))}
                            {/* Placeholders for remaining cards */}
                            {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    className="w-8 h-12 sm:w-12 sm:h-16 rounded bg-black/5 border-2 border-black/10 border-dashed"
                                />
                            ))}
                        </>
                    ) : (
                        <div className="flex gap-1 sm:gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={`preflop-${i}`}
                                    className="w-8 h-12 sm:w-12 sm:h-16 rounded bg-black/5 border-2 border-black/10 border-dashed"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pot Info Pill */}
                <div className="bg-black/5 backdrop-blur-sm px-4 sm:px-6 py-1 sm:py-2 rounded-full flex flex-col items-center gap-0.5 border border-black/5">
                    <span className="text-black/60 text-[8px] sm:text-[10px] font-bold tracking-widest uppercase">Total Pot</span>
                    <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl">🪙</span>
                        <span className="text-black font-black text-lg sm:text-xl">${potSize}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

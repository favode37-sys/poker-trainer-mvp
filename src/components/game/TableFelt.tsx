import { motion } from 'framer-motion';
import { type Card } from '@/lib/types';
import { PlayingCard } from '@/components/ui/PlayingCard';

interface TableFeltProps {
    communityCards: Card[];
    themeClass?: string;
}

export function TableFelt({ communityCards, themeClass }: TableFeltProps) {
    return (
        <div className={`relative w-full h-full max-w-md mx-auto rounded-[60px] sm:rounded-[80px] flex flex-col items-center justify-center overflow-hidden transition-colors duration-500
            ${themeClass || 'bg-emerald-500'} 
            border-[12px] border-white/20 
            shadow-[inset_0_10px_20px_rgba(0,0,0,0.2),0_20px_40px_-10px_rgba(0,0,0,0.1)]`}>

            {/* Texture Overlay (Optional noise/pattern) */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] mix-blend-overlay pointer-events-none" />

            {/* Logo / Branding */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                <span className="text-6xl font-black text-white tracking-widest rotate-0">POKER</span>
            </div>

            {/* Center Content Group */}
            <div className="relative z-10 flex flex-col items-center gap-6 -mt-12">

                {/* Community Cards Slots */}
                <div className="flex gap-2 justify-center h-20 sm:h-24 items-center px-4 py-2 bg-black/10 rounded-2xl backdrop-blur-[2px]">
                    {communityCards.length > 0 ? (
                        <>
                            {communityCards.map((card, index) => (
                                <motion.div
                                    key={`${card.rank}-${card.suit}-${index}`}
                                    initial={{ y: -50, opacity: 0, scale: 0.5 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    transition={{
                                        delay: index * 0.1,
                                        type: 'spring',
                                        damping: 12,
                                        stiffness: 200
                                    }}
                                >
                                    <PlayingCard card={card} size="sm" className="shadow-lg" />
                                </motion.div>
                            ))}
                            {/* Empty Slots */}
                            {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg bg-black/10 border-2 border-white/10 border-dashed shadow-inner"
                                />
                            ))}
                        </>
                    ) : (
                        // Preflop Empty State
                        <div className="flex gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={`preflop-${i}`}
                                    className="w-10 h-14 sm:w-12 sm:h-16 rounded-lg bg-black/10 border-2 border-white/10 border-dashed shadow-inner"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface LivesIndicatorProps {
    lives: number;
    maxLives: number;
    timer?: string;
}

export function LivesIndicator({ lives, maxLives, timer }: LivesIndicatorProps) {
    return (
        <div className="flex items-center gap-1 bg-slate-900/50 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700">
            <div className="flex">
                {[...Array(maxLives)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={false}
                        animate={{ scale: i < lives ? 1 : 0.8, opacity: i < lives ? 1 : 0.3 }}
                    >
                        <Heart
                            className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-current' : 'text-slate-500'}`}
                        />
                    </motion.div>
                ))}
            </div>
            {lives < maxLives && (
                <span className="text-xs text-slate-300 font-mono ml-2 w-10 text-right">
                    {timer}
                </span>
            )}
        </div>
    );
}

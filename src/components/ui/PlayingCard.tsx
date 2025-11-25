import { motion } from 'framer-motion';
import { Heart, Diamond, Club, Spade } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Card } from '@/lib/types';

interface PlayingCardProps {
    card: Card;
    size?: 'sm' | 'md' | 'lg';
    hidden?: boolean;
    className?: string;
}

const suitIcons = {
    hearts: Heart,
    diamonds: Diamond,
    clubs: Club,
    spades: Spade,
};

const suitColors = {
    hearts: 'text-red-500 fill-current',
    diamonds: 'text-red-500 fill-current',
    clubs: 'text-slate-900 fill-current',
    spades: 'text-slate-900 fill-current',
};

const sizeClasses = {
    sm: 'w-12 h-16 text-xs rounded-md border-b-2',
    md: 'w-20 h-28 text-lg rounded-lg border-b-[3px]',
    lg: 'w-24 h-36 text-2xl rounded-xl border-b-4',
};

const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
};

export function PlayingCard({ card, size = 'md', hidden = false, className }: PlayingCardProps) {
    const Icon = suitIcons[card.suit];

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
                "relative flex flex-col items-center justify-center select-none transition-transform hover:-translate-y-1",
                "bg-white border-2 border-slate-200 shadow-sm",
                sizeClasses[size],
                hidden && "bg-brand-blue border-brand-blue overflow-hidden",
                className
            )}
        >
            {hidden ? (
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />
            ) : (
                <>
                    <div className={cn("absolute top-1 left-1 font-bold", suitColors[card.suit])}>
                        {card.rank}
                    </div>
                    <Icon className={cn(iconSizes[size], suitColors[card.suit])} />
                    <div className={cn("absolute bottom-1 right-1 font-bold rotate-180", suitColors[card.suit])}>
                        {card.rank}
                    </div>
                </>
            )}
        </motion.div>
    );
}

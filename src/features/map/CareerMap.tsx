import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Star, Flame, ArrowLeft } from 'lucide-react';
import { type Level } from '@/features/map/levels';
import { cn } from '@/lib/utils';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { useState } from 'react';
import { PokerChip } from '@/components/ui/PokerChip';

interface CareerMapProps {
    levels: Level[];
    onLevelSelect: (levelId: string) => void;
    onBack: () => void;
    onResetProgress: () => void;
    bankroll: number;
    streak: number;
}

export function CareerMap({ levels, onLevelSelect, onBack, onResetProgress, bankroll, streak }: CareerMapProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-neutral-bg pb-20">
            {/* Header */}
            <div className="glass-panel border-b border-white/50 px-6 py-6 sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-neutral-600" />
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Bankroll Display */}
                        <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
                            <PokerChip size="sm" color="blue" />
                            <span className="font-black text-neutral-800">{bankroll}</span>
                        </div>

                        {/* Streak Display */}
                        <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 shadow-sm">
                            <Flame className="w-4 h-4 text-orange-500 fill-current" />
                            <span className="font-black text-orange-600">{streak}</span>
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl font-black text-neutral-800 tracking-tight">Your Journey</h1>
                <p className="text-neutral-500 text-sm font-medium">Master the micro-stakes</p>
            </div>

            {/* The Path */}
            <div className="max-w-md mx-auto px-6 py-12 relative">
                <svg className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-full pointer-events-none" style={{ zIndex: 0 }}>
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#E5E7EB" strokeWidth="4" strokeDasharray="10,10" />
                </svg>

                <div className="relative space-y-24" style={{ zIndex: 1 }}>
                    {levels.map((level, index) => (
                        <LevelNode
                            key={level.id}
                            level={level}
                            index={index}
                            onSelect={() => {
                                if (level.status === 'active') {
                                    onLevelSelect(level.id);
                                }
                            }}
                        />
                    ))}
                </div>

                <div className="h-32" />
            </div>

            {/* Settings Modal (Hidden trigger for now, or maybe add icon back if needed) */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onReset={onResetProgress}
            />
        </div>
    );
}

interface LevelNodeProps {
    level: Level;
    index: number;
    onSelect: () => void;
}

function LevelNode({ level, index, onSelect }: LevelNodeProps) {
    const isLocked = level.status === 'locked';
    const isCompleted = level.status === 'completed';
    const isActive = level.status === 'active';
    const isLeft = index % 2 === 0;

    return (
        <div className={cn('flex items-center gap-6', isLeft ? 'flex-row' : 'flex-row-reverse')}>
            <motion.div
                initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn('flex-1 text-right', !isLeft && 'text-left')}
            >
                <h3 className="font-bold text-lg text-neutral-700">{level.title}</h3>
                <p className="text-sm text-neutral-500">{level.subtitle}</p>
                {isCompleted && (
                    <div className="flex items-center gap-1 text-functional-success font-bold text-sm mt-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span>+{level.xpReward} XP</span>
                    </div>
                )}
            </motion.div>

            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
                whileHover={isActive ? { scale: 1.1 } : {}}
                whileTap={isActive ? { scale: 0.95 } : {}}
                onClick={onSelect}
                disabled={isLocked || isCompleted}
                className={cn(
                    'relative w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg transition-all border-4',
                    isActive && 'bg-brand-primary border-brand-primary/50 cursor-pointer shadow-brand-primary/30',
                    isCompleted && 'bg-functional-success border-functional-success/50 cursor-default',
                    isLocked && 'bg-neutral-100 border-neutral-200 cursor-not-allowed grayscale text-neutral-300'
                )}
            >
                {isLocked && <Lock className="w-8 h-8 text-neutral-300" />}
                {isCompleted && <CheckCircle2 className="w-10 h-10 text-white" />}
                {isActive && <span>{level.icon}</span>}

                {isActive && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-white opacity-30"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </motion.button>

            <div className="flex-1" />
        </div>
    );
}

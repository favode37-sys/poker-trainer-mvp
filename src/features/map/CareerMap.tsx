import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Star, Settings } from 'lucide-react';
import { useState } from 'react';
import { type Level } from './levels';
import { cn } from '@/lib/utils';
import { SettingsModal } from '@/components/ui/SettingsModal';

interface CareerMapProps {
    levels: Level[];
    onLevelSelect: (levelId: string) => void;
    onResetProgress: () => void;
}

export function CareerMap({ levels, onLevelSelect, onResetProgress }: CareerMapProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-8 sticky top-0 z-10 shadow-sm">
                <div className="max-w-md mx-auto relative">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                        Your Journey
                    </h1>
                    <p className="text-slate-500 mt-1">Master poker one level at a time</p>

                    <button
                        onClick={() => onLevelSelect('TEST_HAND')}
                        className="mt-4 w-full py-2 border-2 border-slate-200 border-dashed rounded-xl text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                    >
                        <span>🛠️</span>
                        <span>Test Full Hand (Dev)</span>
                    </button>

                    {/* Settings Button */}
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="absolute top-0 right-0 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <Settings className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* The Path */}
            <div className="max-w-md mx-auto px-6 py-12 relative">
                <svg className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-full pointer-events-none" style={{ zIndex: 0 }}>
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="10,10" />
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

            {/* Settings Modal */}
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
                <h3 className="font-bold text-lg text-slate-700">{level.title}</h3>
                <p className="text-sm text-slate-500">{level.subtitle}</p>
                {isCompleted && (
                    <div className="flex items-center gap-1 text-brand-green font-bold text-sm mt-1">
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
                    'relative w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg border-4 transition-all',
                    isActive && 'bg-yellow-400 border-yellow-500 border-b-[6px] cursor-pointer animate-bounce',
                    isCompleted && 'bg-brand-green border-green-600 border-b-[6px] cursor-default',
                    isLocked && 'bg-slate-200 border-slate-300 border-b-[4px] cursor-not-allowed grayscale'
                )}
            >
                {isLocked && <Lock className="w-8 h-8 text-slate-400" />}
                {isCompleted && <CheckCircle2 className="w-10 h-10 text-white" />}
                {isActive && <span>{level.icon}</span>}

                {isActive && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-yellow-400 opacity-50"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </motion.button>

            <div className="flex-1" />
        </div>
    );
}

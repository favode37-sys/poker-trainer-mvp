import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Star, Settings, Zap, Flame, Check, Target, Search } from 'lucide-react';
import { useState } from 'react';
import { type Level } from '@/features/map/levels';
import { cn } from '@/lib/utils';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { type Quest } from '@/hooks/useQuests';

interface CareerMapProps {
    levels: Level[];
    onLevelSelect: (levelId: string) => void;
    onResetProgress: () => void;
    onBlitzClick?: () => void;
    onAnalyzerClick?: () => void;
    bankroll: number;
    streak: number;
    quests?: Quest[];
}

export function CareerMap({ levels, onLevelSelect, onResetProgress, onBlitzClick, onAnalyzerClick, bankroll, streak, quests = [] }: CareerMapProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-10 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    {/* Bankroll Display */}
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                        <div className="w-5 h-5 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center text-[10px] font-bold text-yellow-900 shadow-sm">
                            $
                        </div>
                        <span className="font-black text-slate-700">{bankroll}</span>
                    </div>

                    {/* Streak Display */}
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border ${streak > 0 ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                            <Flame className={`w-5 h-5 ${streak > 0 ? 'fill-orange-500 text-orange-600' : 'text-slate-400'}`} />
                            <span className="font-black">{streak}</span>
                        </div>

                        {/* Settings Btn */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                            <Settings className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Your Journey</h1>
                <p className="text-slate-500 text-sm font-medium">Master the micro-stakes</p>
            </div>

            {/* Blitz Mode Banner */}
            <div className="px-6 pt-6 max-w-md mx-auto">
                <button
                    onClick={onBlitzClick}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-lg border-b-4 border-indigo-800 flex items-center justify-between group hover:scale-[1.02] transition-transform active:scale-95"
                >
                    <div className="flex flex-col items-start text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-5 h-5 text-yellow-300 fill-current animate-pulse" />
                            <span className="font-black uppercase tracking-wider text-sm text-indigo-200">Equity Rush</span>
                        </div>
                        <span className="font-bold text-lg">Blitz Mode ⚡</span>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <span className="text-xl">⏱️</span>
                    </div>
                </button>
            </div>

            {/* Daily Quests Widget */}
            <div className="px-6 mt-6 max-w-md mx-auto">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-slate-400" />
                        <h3 className="font-bold text-slate-700">Daily Goals</h3>
                    </div>

                    <div className="space-y-3">
                        {quests.map(quest => (
                            <div key={quest.id} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${quest.isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {quest.isCompleted ? <Check className="w-5 h-5" /> : <span className="text-xs font-bold">{quest.progress}/{quest.target}</span>}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm">
                                        <span className={`font-medium ${quest.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{quest.title}</span>
                                        {quest.isCompleted ? (
                                            <span className="text-green-600 font-bold text-xs">Done</span>
                                        ) : (
                                            <span className="text-yellow-600 font-bold text-xs">+{quest.reward} $</span>
                                        )}
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${quest.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hand Detective Button */}
            <div className="px-6 mt-6 mb-8 max-w-md mx-auto">
                <button
                    onClick={onAnalyzerClick}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left group"
                >
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Search className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Hand Detective</h3>
                        <p className="text-xs text-slate-500 font-medium">Analyze your own hands with AI</p>
                    </div>
                </button>
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

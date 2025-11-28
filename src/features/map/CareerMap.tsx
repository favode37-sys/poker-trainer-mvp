import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Star, Settings, Zap, Flame, Check, Target, Search, User } from 'lucide-react';
import { useState } from 'react';
import { type Level } from '@/features/map/levels';
import { cn } from '@/lib/utils';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { ProfileModal } from '@/components/ui/ProfileModal';
import { type Quest } from '@/hooks/useQuests';

interface CareerMapProps {
    levels: Level[];
    onLevelSelect: (levelId: string) => void;
    onResetProgress: () => void;
    onBlitzClick?: () => void;
    onAnalyzerClick?: () => void;
    onAdminClick?: () => void;
    onStatsClick?: () => void;
    onPreflopClick?: () => void;
    bankroll: number;
    streak: number;
    quests?: Quest[];
}

export function CareerMap({ levels, onLevelSelect, onResetProgress, onBlitzClick, onAnalyzerClick, onAdminClick, onStatsClick, onPreflopClick, bankroll, streak, quests = [] }: CareerMapProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [titleClicks, setTitleClicks] = useState(0);

    const handleTitleClick = () => {
        setTitleClicks(prev => prev + 1);
        if (titleClicks + 1 >= 5) {
            if (onAdminClick) onAdminClick();
            setTitleClicks(0);
        }
        // Reset after 2 seconds
        setTimeout(() => setTitleClicks(0), 2000);
    };

    return (
        <div className="min-h-screen bg-neutral-bg pb-20">
            {/* Header */}
            <div className="glass-panel border-b border-white/50 px-6 py-6 sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4">
                    {/* Bankroll Display */}
                    <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
                        <div className="w-5 h-5 bg-brand-accent rounded-full flex items-center justify-center text-[10px] font-bold text-brand-dark shadow-sm">
                            $
                        </div>
                        <span className="font-black text-neutral-800">{bankroll}</span>
                    </div>

                    {/* Streak Display */}
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border shadow-sm ${streak > 0 ? 'bg-orange-50 border-orange-100 text-orange-500' : 'bg-neutral-100 border-neutral-200 text-neutral-400'}`}>
                            <Flame className={`w-5 h-5 ${streak > 0 ? 'fill-orange-500 text-orange-500' : 'text-neutral-400'}`} />
                            <span className="font-black">{streak}</span>
                        </div>

                        {/* Profile Btn */}
                        <button
                            onClick={() => setIsProfileOpen(true)}
                            className="w-10 h-10 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 shadow-sm flex items-center justify-center transition-colors"
                        >
                            <User className="w-5 h-5 text-neutral-600" />
                        </button>

                        {/* Settings Btn */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="w-10 h-10 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 shadow-sm flex items-center justify-center transition-colors"
                        >
                            <Settings className="w-5 h-5 text-neutral-600" />
                        </button>
                    </div>
                </div>

                <h1 className="text-3xl font-black text-neutral-800 tracking-tight cursor-pointer select-none" onClick={handleTitleClick}>Your Journey</h1>
                <p className="text-neutral-500 text-sm font-medium">Master the micro-stakes</p>
            </div>

            {/* Blitz Mode Banner */}
            <div className="px-6 pt-6 max-w-md mx-auto">
                <button
                    onClick={onBlitzClick}
                    className="w-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-2xl p-4 shadow-lg border border-white/20 flex items-center justify-between group hover:scale-[1.02] transition-transform active:scale-95"
                >
                    <div className="flex flex-col items-start text-brand-dark">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-5 h-5 text-white fill-current animate-pulse" />
                            <span className="font-black uppercase tracking-wider text-sm text-brand-dark/70">Equity Rush</span>
                        </div>
                        <span className="font-bold text-lg">Blitz Mode ⚡</span>
                    </div>
                    <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform backdrop-blur-sm">
                        <span className="text-xl">⏱️</span>
                    </div>
                </button>
            </div>

            {/* Daily Quests Widget */}
            <div className="px-6 mt-6 max-w-md mx-auto">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-neutral-400" />
                        <h3 className="font-bold text-neutral-700">Daily Goals</h3>
                    </div>

                    <div className="space-y-3">
                        {quests.map(quest => (
                            <div key={quest.id} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${quest.isCompleted ? 'bg-functional-success/20 text-functional-success' : 'bg-neutral-100 text-neutral-400'}`}>
                                    {quest.isCompleted ? <Check className="w-5 h-5" /> : <span className="text-xs font-bold">{quest.progress}/{quest.target}</span>}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm">
                                        <span className={`font-medium ${quest.isCompleted ? 'text-neutral-400 line-through' : 'text-neutral-700'}`}>{quest.title}</span>
                                        {quest.isCompleted ? (
                                            <span className="text-functional-success font-bold text-xs">Done</span>
                                        ) : (
                                            <span className="text-brand-accent font-bold text-xs">+{quest.reward} $</span>
                                        )}
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-1.5 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${quest.isCompleted ? 'bg-functional-success' : 'bg-brand-primary'}`}
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
            {/* Tools Grid */}
            <div className="px-6 mt-6 mb-8 max-w-md mx-auto grid grid-cols-2 gap-3">
                <button
                    onClick={onAnalyzerClick}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 flex flex-col items-center gap-2 hover:bg-neutral-50 transition-colors text-center group"
                >
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Search className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-800 text-sm">Hand Detective</h3>
                        <p className="text-[10px] text-neutral-500 font-medium">AI Analysis</p>
                    </div>
                </button>

                <button
                    onClick={onPreflopClick}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 flex flex-col items-center gap-2 hover:bg-neutral-50 transition-colors text-center group"
                >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-800 text-sm">Preflop Drill</h3>
                        <p className="text-[10px] text-neutral-500 font-medium">Master Ranges</p>
                    </div>
                </button>
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

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onReset={onResetProgress}
            />

            {/* Profile Modal */}
            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                onOpenStats={onStatsClick}
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

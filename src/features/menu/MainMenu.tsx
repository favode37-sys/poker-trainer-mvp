import { motion } from 'framer-motion';
import { useState } from 'react';
import { Play, Zap, LayoutDashboard, User, Trophy, Flame, Map, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PokerChip } from '@/components/ui/PokerChip';
import { type Quest } from '@/hooks/useQuests';
import { useLives } from '@/hooks/useLives';
import { useStreak } from '@/hooks/useStreak';
import { LivesIndicator } from '@/components/ui/LivesIndicator';

interface MainMenuProps {
    bankroll: number;
    streak: number;
    quests: Quest[];
    onNavigate: (screen: 'map' | 'blitz' | 'analyzer' | 'preflop' | 'stats' | 'admin' | 'settings') => void;
    onProfileClick: () => void;
}

export function MainMenu({ bankroll, streak: propStreak, quests, onNavigate, onProfileClick }: MainMenuProps) {
    const activeQuests = quests.filter(q => !q.isCompleted).length;
    const [secretClicks, setSecretClicks] = useState(0);
    const { lives, maxLives, timeToNextLife } = useLives();
    const { streak } = useStreak();

    const handleSecretClick = () => {
        setSecretClicks(prev => prev + 1);
        if (secretClicks + 1 >= 5) {
            onNavigate('admin');
            setSecretClicks(0);
        }
        setTimeout(() => setSecretClicks(0), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 overflow-y-auto">
            {/* 1. Top Bar */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-full border border-slate-200 cursor-pointer" onClick={onProfileClick}>
                        <User className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex flex-col" onClick={handleSecretClick}>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Player</span>
                        <span className="font-black text-slate-800 leading-none select-none cursor-pointer active:scale-95 transition-transform">Hero</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <LivesIndicator lives={lives} maxLives={maxLives} timer={timeToNextLife} />

                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                        <PokerChip size="sm" color="blue" />
                        <span className="font-black text-slate-700 text-sm">{bankroll}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                        <Flame className="w-4 h-4 text-orange-500 fill-current" />
                        <span className="font-black text-orange-600 text-sm">{streak}</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('settings');
                        }}
                        className="bg-slate-100 p-2 rounded-full border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer relative z-50"
                    >
                        <Settings className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-8">

                {/* 2. Hero Section: Campaign */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate('map')}
                    className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-xl shadow-indigo-500/30 cursor-pointer group"
                >
                    <div className="relative z-10 text-white">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <Map className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Story Mode</span>
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tight">Continue<br />Journey</h2>
                        <Button variant="secondary" className="px-6 shadow-lg border-none">
                            <Play className="w-5 h-5 mr-2 fill-current" /> PLAY
                        </Button>
                    </div>

                    {/* Decor */}
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-20 group-hover:scale-110 transition-transform duration-500">
                        <Trophy className="w-48 h-48 text-white" />
                    </div>
                </motion.div>

                {/* 3. Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Blitz */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => onNavigate('blitz')}
                        className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-yellow-400 hover:shadow-md transition-all text-left group"
                    >
                        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6 text-yellow-600 fill-current" />
                        </div>
                        <div className="font-black text-slate-800 text-lg">Blitz</div>
                        <div className="text-xs text-slate-400 font-medium">Fast paced drill</div>
                    </motion.button>

                    {/* Stats */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => onNavigate('stats')}
                        className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all text-left group"
                    >
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <LayoutDashboard className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="font-black text-slate-800 text-lg">Stats</div>
                        <div className="text-xs text-slate-400 font-medium">Check progress</div>
                    </motion.button>
                </div>

                {/* 4. Training Tools */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider ml-1">Training Center</h3>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                        <button onClick={() => onNavigate('preflop')} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-2xl">⚡</div>
                            <div className="flex-1">
                                <div className="font-bold text-slate-700">Preflop Trainer</div>
                                <div className="text-xs text-slate-400">Master opening ranges</div>
                            </div>
                            <div className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-500">OPEN</div>
                        </button>

                        <button onClick={() => onNavigate('analyzer')} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left">
                            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-2xl">🕵️‍♂️</div>
                            <div className="flex-1">
                                <div className="font-bold text-slate-700">Hand Detective</div>
                                <div className="text-xs text-slate-400">AI Analysis tool</div>
                            </div>
                            <div className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-500">OPEN</div>
                        </button>
                    </div>
                </div>

                {/* 5. Daily Quests Widget (Compact) */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <span className="font-bold">Daily Goals</span>
                        </div>
                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">{activeQuests} active</span>
                    </div>
                    {quests.slice(0, 3).map(q => (
                        <div key={q.id} className="flex items-center gap-3 py-2 border-b border-white/10 last:border-0">
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${q.isCompleted ? 'bg-green-500 border-green-500' : 'border-slate-500'}`} />
                            <span className={`text-sm ${q.isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{q.title}</span>
                        </div>
                    ))}
                </div>

                {/* Admin Link */}
                <div className="text-center pt-4">
                    <button onClick={() => onNavigate('admin')} className="text-xs font-bold text-slate-300 hover:text-slate-500 transition-colors">
                        SECRET ADMIN DASHBOARD
                    </button>
                </div>
            </div>
        </div>
    );
}

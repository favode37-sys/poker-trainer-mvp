import { motion } from 'framer-motion';
import { useState } from 'react';
import { Play, Zap, LayoutDashboard, Trophy, Flame, Map, Search, Check } from 'lucide-react';
import { PokerChip } from '@/components/ui/PokerChip';
import { type Quest } from '@/hooks/useQuests';
import { useStreak } from '@/hooks/useStreak';


interface MainMenuProps {
    bankroll: number;
    streak: number;
    quests: Quest[];
    onNavigate: (screen: 'map' | 'blitz' | 'analyzer' | 'preflop' | 'stats' | 'admin' | 'settings' | 'menu' | 'profile') => void;
}

export function MainMenu({ bankroll, quests, onNavigate }: MainMenuProps) {
    const activeQuests = quests.filter(q => !q.isCompleted).length;
    const [secretClicks, setSecretClicks] = useState(0);
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
        <div className="h-[100dvh] w-full bg-[#f0f4f8] font-sans overflow-hidden flex flex-col relative">

            {/* 1. TOP STATS BAR (Centered) */}
            <div className="flex-none pt-4 pb-2 px-6 flex justify-center items-center z-20">
                <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-1.5 rounded-full border border-white shadow-sm">
                    <div className="clay-pill-blue px-3 py-1 text-xs gap-1.5 shadow-none border-none bg-blue-100/50 text-blue-800">
                        <PokerChip size="sm" color="blue" className="w-4 h-4 border-none shadow-none" />
                        <span className="font-black text-sm">${bankroll}</span>
                    </div>
                    <div className="w-px h-4 bg-slate-300" />
                    <div className="clay-pill-orange px-3 py-1 text-xs gap-1.5 shadow-none border-none bg-orange-100/50 text-orange-800">
                        <Flame className="w-4 h-4 text-orange-500 fill-current" />
                        <span className="font-black text-sm">{streak}</span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col p-4 gap-3 min-h-0 pb-24"> {/* Added padding-bottom for dock */}

                {/* HERO CARD */}
                <div className="flex-[1.2] min-h-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => onNavigate('map')}
                        className="card-clay-story group w-full h-full flex flex-col justify-between p-5"
                    >
                        <div className="flex justify-between items-start">
                            <div className="bg-green-700/30 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 flex items-center gap-1">
                                <Map className="w-3 h-3 text-green-100" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-green-50">Campaign</span>
                            </div>
                            <div className="bg-white/20 p-2 rounded-full border-2 border-white/30 shadow-inner">
                                <Play className="w-6 h-6 text-white fill-current" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black leading-none mb-1 tracking-tight text-white drop-shadow-sm">
                                Continue<br />Journey
                            </h2>
                            <div className="flex items-center gap-2 text-green-100 font-bold text-xs mt-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-200 animate-pulse" />
                                <span>Next Boss: Uncle Ted</span>
                            </div>
                        </div>
                        <svg className="absolute bottom-0 right-0 h-32 w-32 opacity-10 pointer-events-none" viewBox="0 0 100 100">
                            <circle cx="100" cy="100" r="80" fill="white" />
                        </svg>
                    </motion.div>
                </div>

                {/* TOOLS GRID */}
                <div className="flex-[1.5] grid grid-cols-2 grid-rows-2 gap-3 min-h-0">
                    <button onClick={() => onNavigate('blitz')} className="btn-clay-blitz flex flex-col justify-center items-center gap-1 p-2 h-full">
                        <Zap className="w-8 h-8 text-yellow-900 fill-current mb-1" />
                        <div className="font-black text-lg text-yellow-950 leading-none">Blitz</div>
                        <div className="text-[9px] font-bold text-yellow-800/60 uppercase">Quick Play</div>
                    </button>

                    <button onClick={() => onNavigate('stats')} className="btn-clay-stats flex flex-col justify-center items-center gap-1 p-2 h-full">
                        <LayoutDashboard className="w-8 h-8 text-white fill-white/20 mb-1" />
                        <div className="font-black text-lg text-white leading-none">Stats</div>
                        <div className="text-[9px] font-bold text-purple-200 uppercase">Profile</div>
                    </button>

                    <button onClick={() => onNavigate('preflop')} className="btn-clay-blue flex flex-col justify-center items-center gap-1 p-2 h-full">
                        <span className="text-3xl mb-1">⚡</span>
                        <div className="font-black text-base text-white leading-none">Preflop</div>
                        <div className="text-[9px] font-bold text-blue-200 uppercase">Trainer</div>
                    </button>

                    <button onClick={() => onNavigate('analyzer')} className="btn-clay-pink flex flex-col justify-center items-center gap-1 p-2 h-full">
                        <Search className="w-7 h-7 text-white mb-1" strokeWidth={3} />
                        <div className="font-black text-base text-white leading-none">Solver</div>
                        <div className="text-[9px] font-bold text-pink-200 uppercase">Analyzer</div>
                    </button>
                </div>

                {/* DAILY GOALS */}
                <div className="flex-[0.8] bg-slate-800 rounded-[1.5rem] p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_4px_0_#1e293b] border-2 border-slate-700 relative overflow-hidden min-h-0 flex flex-col">
                    <div className="flex justify-between items-center mb-2 flex-none" onClick={handleSecretClick}>
                        <div className="flex items-center gap-1.5">
                            <Trophy className="w-3 h-3 text-yellow-400" />
                            <span className="font-black text-white text-xs tracking-wide">Daily Goals</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded-full">
                            {activeQuests} left
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-hide">
                        {quests.map(q => (
                            <div key={q.id} className={q.isCompleted ? "flex items-center justify-between p-2 rounded-lg bg-green-900/30 border border-green-800/50 opacity-60" : "flex items-center justify-between p-2 rounded-lg bg-white shadow-[0_2px_0_#cbd5e1] border border-white"}>
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border ${q.isCompleted ? 'bg-green-500 border-green-500' : 'bg-slate-100 border-slate-300'}`}>
                                        {q.isCompleted && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                    </div>
                                    <span className={`text-[10px] font-bold truncate ${q.isCompleted ? 'text-green-200 line-through' : 'text-slate-700'}`}>{q.title}</span>
                                </div>
                                {!q.isCompleted && <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">{q.progress}/{q.target}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>




        </div>
    );
}

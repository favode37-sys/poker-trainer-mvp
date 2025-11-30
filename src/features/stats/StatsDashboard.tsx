import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, AlertTriangle, Shield, Activity } from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    AreaChart, Area, Tooltip
} from 'recharts';
import { statsStore, type PlayerStats } from '@/lib/stats-store';
import { usePlayerState } from '@/hooks/usePlayerState';

interface StatsDashboardProps {
    onBack: () => void;
}

// Custom "Peg" Dot for the Radar Chart
const CustomizedDot = (props: any) => {
    const { cx, cy, value } = props;
    if (!value) return null;
    return (
        <svg x={cx - 6} y={cy - 6} width={12} height={12} className="overflow-visible">
            {/* Shadow */}
            <circle cx="6" cy="8" r="6" fill="rgba(0,0,0,0.2)" />
            {/* Peg Body */}
            <circle cx="6" cy="6" r="6" fill="#6366f1" stroke="white" strokeWidth="2" />
            {/* Highlight */}
            <circle cx="4" cy="4" r="2" fill="white" fillOpacity="0.5" />
        </svg>
    );
};

export function StatsDashboard({ onBack }: StatsDashboardProps) {
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const { bankroll } = usePlayerState();

    useEffect(() => {
        setStats(statsStore.get());
    }, []);

    if (!stats) return null;

    // --- DATA PREP ---
    const getRate = (correct: number, total: number) => total === 0 ? 50 : Math.round((correct / total) * 100);
    const getRatio = (good: number, bad: number) => {
        const total = good + bad;
        return total === 0 ? 50 : Math.round((good / total) * 100);
    };

    const radarData = [
        { subject: 'Preflop', A: getRate(stats.metrics.preflop.correct, stats.metrics.preflop.total), fullMark: 100 },
        { subject: 'Aggression', A: getRatio(stats.metrics.aggression.correctRaises, stats.metrics.aggression.missedRaises), fullMark: 100 },
        { subject: 'River', A: getRate(stats.metrics.river.correct, stats.metrics.river.total), fullMark: 100 },
        { subject: 'Discipline', A: getRatio(stats.metrics.discipline.correctFolds, stats.metrics.discipline.missedFolds), fullMark: 100 },
        { subject: 'Win Rate', A: getRate(stats.correctHands, stats.totalHands), fullMark: 100 },
    ];

    const leaks = [
        { name: 'Calling Station', count: stats.leaks.callingStation, msg: "You call too much! Fold more." },
        { name: 'Passive Play', count: stats.leaks.passive, msg: "Don't just call. RAISE!" },
        { name: 'Scared Money', count: stats.leaks.nit, msg: "You fold too often. Be brave!" },
    ].sort((a, b) => b.count - a.count);

    const mainLeak = leaks[0].count > 0 ? leaks[0] : null;

    return (
        <div className="min-h-screen bg-[#f0f4f8] pb-20 font-sans selection:bg-brand-primary/30">
            {/* Header */}
            <div className="p-6 flex items-center gap-4 sticky top-0 z-30 bg-[#f0f4f8]/90 backdrop-blur-md">
                <button
                    onClick={onBack}
                    className="w-12 h-12 bg-white rounded-2xl shadow-[inset_0_-4px_0_rgba(0,0,0,0.1),0_4px_10px_rgba(0,0,0,0.1)] flex items-center justify-center border-2 border-white hover:-translate-y-0.5 active:translate-y-0 active:shadow-inner transition-all"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-500 font-bold" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Analytics</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Poker DNA</p>
                </div>
            </div>

            <div className="px-6 space-y-6 max-w-lg mx-auto">

                {/* 1. HERO STATS */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-3xl p-5 border-2 border-white shadow-clay-card flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Activity className="w-16 h-16 text-blue-500" />
                        </div>
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Hands</span>
                        <span className="text-4xl font-black text-slate-700">{stats.totalHands}</span>
                    </div>
                    <div className="bg-white rounded-3xl p-5 border-2 border-white shadow-clay-card flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendingUp className="w-16 h-16 text-green-500" />
                        </div>
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Bankroll</span>
                        <span className="text-4xl font-black text-emerald-500">${bankroll}</span>
                    </div>
                </div>

                {/* 2. SKILL MATRIX (RECESSED TRAY DESIGN) */}
                <div className="clay-card !p-0 overflow-hidden bg-slate-50 border-4 border-white shadow-clay-card">
                    <div className="p-4 flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600 shadow-sm border border-white">
                            <Shield className="w-5 h-5 fill-current" />
                        </div>
                        <span className="font-black text-indigo-900 text-sm uppercase tracking-wide">Skill Matrix</span>
                    </div>

                    {/* The Recessed Tray */}
                    <div className="mx-4 mb-6 aspect-square rounded-[2.5rem] bg-slate-200 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1),inset_0_-2px_5px_rgba(255,255,255,0.7)] border border-slate-300/50 relative flex items-center justify-center overflow-hidden">

                        {/* Background Grid Lines (CSS Pattern for texture) */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />

                        <div className="w-full h-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="#cbd5e1" strokeWidth={2} />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900, fontFamily: 'Nunito' }}
                                    />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Skill"
                                        dataKey="A"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fill="#818cf8"
                                        fillOpacity={0.6}
                                        dot={<CustomizedDot />} // Use custom pegs
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. LEAK DETECTOR */}
                <div className="clay-card !p-0 overflow-hidden relative">
                    <div className="bg-orange-50/50 p-4 flex items-center gap-3 border-b border-orange-50">
                        <div className="bg-orange-100 p-2 rounded-xl text-orange-600 shadow-sm border border-white">
                            <AlertTriangle className="w-5 h-5 fill-current" />
                        </div>
                        <span className="font-black text-orange-900 text-sm uppercase tracking-wide">Biggest Leak</span>
                    </div>
                    <div className="p-6 text-center">
                        {mainLeak ? (
                            <>
                                <div className="text-2xl font-black text-slate-800 mb-2">{mainLeak.name}</div>
                                <div className="inline-block bg-red-100 text-red-600 px-4 py-1 rounded-full text-xs font-bold mb-4 border border-red-200 shadow-sm">
                                    {mainLeak.count} Mistakes
                                </div>
                                <p className="text-slate-500 font-bold text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    " {mainLeak.msg} "
                                </p>
                            </>
                        ) : (
                            <div className="py-4">
                                <div className="text-lg font-bold text-emerald-500 mb-1">Clean Game! ✨</div>
                                <p className="text-slate-400 text-xs font-bold">Play more hands to analyze.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. BANKROLL CHART */}
                <div className="clay-card !p-0 overflow-hidden">
                    <div className="bg-emerald-50/50 p-4 flex items-center gap-3 border-b border-emerald-50">
                        <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 shadow-sm border border-white">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="font-black text-emerald-900 text-sm uppercase tracking-wide">Growth Trend</span>
                    </div>
                    <div className="h-48 w-full pt-4 pr-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.bankrollHistory}>
                                <defs>
                                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorPv)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}

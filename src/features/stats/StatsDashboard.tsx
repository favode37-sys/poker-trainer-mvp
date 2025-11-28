import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    AreaChart, Area, Tooltip
} from 'recharts';
import { statsStore, type PlayerStats } from '@/lib/stats-store';
import { usePlayerState } from '@/hooks/usePlayerState';

interface StatsDashboardProps {
    onBack: () => void;
}

export function StatsDashboard({ onBack }: StatsDashboardProps) {
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const { bankroll } = usePlayerState();

    useEffect(() => {
        setStats(statsStore.get());
    }, []);

    if (!stats) return null;

    // --- DATA PREP FOR CHARTS ---

    // 1. Radar Data (Normalized to 100)
    const getRate = (correct: number, total: number) => total === 0 ? 50 : Math.round((correct / total) * 100);
    const getRatio = (good: number, bad: number) => {
        const total = good + bad;
        return total === 0 ? 50 : Math.round((good / total) * 100);
    };

    const radarData = [
        { subject: 'Preflop', A: getRate(stats.metrics.preflop.correct, stats.metrics.preflop.total), fullMark: 100 },
        { subject: 'Aggression', A: getRatio(stats.metrics.aggression.correctRaises, stats.metrics.aggression.missedRaises), fullMark: 100 },
        { subject: 'River Play', A: getRate(stats.metrics.river.correct, stats.metrics.river.total), fullMark: 100 },
        { subject: 'Discipline', A: getRatio(stats.metrics.discipline.correctFolds, stats.metrics.discipline.missedFolds), fullMark: 100 },
        { subject: 'Win Rate', A: getRate(stats.correctHands, stats.totalHands), fullMark: 100 },
    ];

    // 2. Identify Top Leak
    const leaks = [
        { name: 'Calling Station', count: stats.leaks.callingStation, msg: "You call too much. Learn to fold!" },
        { name: 'Passive Play', count: stats.leaks.passive, msg: "You're too passive. Raise your strong hands!" },
        { name: 'Scared Money (Nit)', count: stats.leaks.nit, msg: "You fold too often. Trust the math!" },
    ].sort((a, b) => b.count - a.count);

    const mainLeak = leaks[0].count > 0 ? leaks[0] : null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white p-4 border-b border-slate-200 sticky top-0 z-10 flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="text-xl font-black text-slate-800">Performance DNA 🧬</h1>
            </div>

            <div className="p-6 space-y-8 max-w-lg mx-auto">

                {/* 1. KEY STATS CARDS */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                        <div className="text-slate-400 text-xs font-bold uppercase mb-1">Total Hands</div>
                        <div className="text-3xl font-black text-slate-800">{stats.totalHands}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                        <div className="text-slate-400 text-xs font-bold uppercase mb-1">Current Bankroll</div>
                        <div className="text-3xl font-black text-emerald-600">${bankroll}</div>
                    </div>
                </div>

                {/* 2. RADAR CHART */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <h2 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-500" /> SKILL MATRIX
                    </h2>
                    <div className="h-64 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Mike" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. LEAK ANALYSIS */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <h2 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" /> BIGGEST LEAK
                    </h2>
                    {mainLeak ? (
                        <div>
                            <div className="text-2xl font-black text-red-500 mb-1">{mainLeak.name}</div>
                            <p className="text-slate-600 font-medium leading-relaxed">{mainLeak.msg}</p>
                            <div className="mt-4 bg-red-50 text-red-800 text-xs font-bold px-3 py-1 rounded-full inline-block">
                                {mainLeak.count} mistakes detected
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <div className="text-lg font-bold text-emerald-600">No leaks detected yet!</div>
                            <p className="text-slate-400 text-sm">Play more hands to analyze.</p>
                        </div>
                    )}
                </div>

                {/* 4. BANKROLL GRAPH */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                    <h2 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" /> BANKROLL TREND
                    </h2>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.bankrollHistory}>
                                <defs>
                                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#059669', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}

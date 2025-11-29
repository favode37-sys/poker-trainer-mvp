import { motion } from 'framer-motion';
import { ShieldAlert, Sword, Target, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type BossProfile } from '@/features/game/boss-profiles';

interface BossBriefingProps {
    boss: BossProfile;
    onStart: () => void;
}

export function BossBriefing({ boss, onStart }: BossBriefingProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10"
            >
                {/* Header / Avatar */}
                <div className={`bg-gradient-to-br ${boss.colorTheme} p-8 flex flex-col items-center text-center relative`}>
                    <div className="text-6xl mb-4 shadow-xl rounded-full bg-white/50 w-24 h-24 flex items-center justify-center border-4 border-white/50">
                        {boss.avatar}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{boss.name}</h2>
                    <p className="text-slate-700 font-bold opacity-75">{boss.title}</p>

                    <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 border border-white/20">
                        BOSS FIGHT
                    </div>
                </div>

                {/* Scouting Report */}
                <div className="p-6 space-y-6 bg-white">

                    {/* Bio */}
                    <p className="text-slate-600 text-sm italic text-center">
                        "{boss.description}"
                    </p>

                    <div className="space-y-4">
                        {/* Weakness */}
                        <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                            <Target className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider">Target Weakness</h4>
                                <p className="text-sm font-bold text-red-600">{boss.strategy.weakness}</p>
                            </div>
                        </div>

                        {/* Strategy Tips */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Strategy Adjustments</h4>
                            {boss.strategy.tips.map((tip, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    {i === 0 && <ShieldAlert className="w-4 h-4 text-orange-500" />}
                                    {i === 1 && <Sword className="w-4 h-4 text-green-500" />}
                                    {i === 2 && <ShieldAlert className="w-4 h-4 text-blue-500" />}
                                    <span>{tip}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button size="lg" fullWidth onClick={onStart} className="h-14 text-lg shadow-xl">
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        FIGHT!
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

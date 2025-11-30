import { Settings, Lock, Trophy } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';



interface ProfileScreenProps {
    onNavigate: (screen: any) => void;
    onOpenSettings: () => void;
}

export function ProfileScreen({ onOpenSettings }: ProfileScreenProps) {
    const { allAchievements, unlockedIds } = useAchievements();

    return (
        <div className="h-[100dvh] w-full bg-[#f0f4f8] font-sans overflow-hidden flex flex-col relative">

            {/* Header */}
            <div className="flex-none p-6 pb-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Profile</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-2 pb-32 space-y-6 scrollbar-hide">

                {/* User Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-clay-card border-2 border-white flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-inner border-4 border-white">
                        <span className="text-3xl">😎</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Hero</h2>
                        <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold inline-block mt-1">
                            Level 5 Grinder
                        </div>
                    </div>
                </div>

                {/* Settings Button */}
                <button
                    onClick={onOpenSettings}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Settings className="w-5 h-5" />
                    Open Settings
                </button>

                {/* Achievements Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500 fill-current" />
                            <h3 className="font-black text-slate-700 text-lg">Achievements</h3>
                        </div>
                        <span className="text-xs font-bold text-slate-400">{unlockedIds.length}/{allAchievements.length}</span>
                    </div>

                    <div className="space-y-3">
                        {allAchievements.map((ach) => {
                            const isUnlocked = unlockedIds.includes(ach.id);
                            return (
                                <div
                                    key={ach.id}
                                    className={`
                                        flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                                        ${isUnlocked
                                            ? 'bg-white border-white shadow-sm'
                                            : 'bg-slate-100 border-transparent opacity-60 grayscale'
                                        }
                                    `}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner ${isUnlocked ? 'bg-yellow-100' : 'bg-slate-200'}`}>
                                        {isUnlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-400" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800">{ach.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium">{ach.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>


        </div>
    );
}


import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAchievements } from '@/hooks/useAchievements';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenStats?: () => void;
    onOpenSettings?: () => void;
    username?: string;
}

export function ProfileModal({ isOpen, onClose, onOpenStats, onOpenSettings, username = "Player 1" }: ProfileModalProps) {
    const { allAchievements, unlockedIds } = useAchievements();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:w-[480px] md:left-1/2 md:-translate-x-1/2 z-50 bg-slate-50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-white p-6 border-b border-slate-200 flex flex-col items-center relative">
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>

                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-3 border-4 border-white">
                                <User className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800">{username}</h2>
                            <p className="text-slate-500 text-sm font-medium">Poker Enthusiast</p>
                        </div>

                        {/* Achievements Grid (Flex-1) */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Achievements</span>
                                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{unlockedIds.length}/{allAchievements.length}</span>
                            </div>
                            {allAchievements.map((ach) => {
                                const isUnlocked = unlockedIds.includes(ach.id);
                                return (
                                    <div key={ach.id} className={`flex items - center gap - 4 p - 3 rounded - 2xl border - 2 transition - all ${isUnlocked ? 'bg-white border-indigo-100 shadow-sm' : 'bg-slate-100/50 border-transparent opacity-60 grayscale'} `}>
                                        <div className={`w - 12 h - 12 rounded - xl flex items - center justify - center text - 2xl shadow - inner ${isUnlocked ? 'bg-indigo-50' : 'bg-slate-200'} `}>
                                            {isUnlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font - bold text - sm ${isUnlocked ? 'text-slate-800' : 'text-slate-500'} `}>{ach.title}</h3>
                                            <p className="text-xs text-slate-500 leading-tight">{ach.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 gap-3">
                            {onOpenStats && (
                                <Button fullWidth variant="primary" onClick={() => { onOpenStats(); onClose(); }}>
                                    Stats 📊
                                </Button>
                            )}
                            {onOpenSettings && (
                                <Button fullWidth variant="outline" onClick={() => { onOpenSettings(); onClose(); }}>
                                    <Settings className="w-4 h-4 mr-2" /> Settings
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

import { Home, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BottomNavProps {
    activeTab: 'menu' | 'profile';
    onNavigate: (screen: 'menu' | 'profile') => void;
}

export function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
    const tabs = [
        { id: 'menu', icon: Home, label: 'Home' },
        { id: 'profile', icon: User, label: 'Profile' },
    ] as const;

    return (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[80%] max-w-[280px] z-50">
            <div className="bg-white/90 backdrop-blur-2xl rounded-full p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/50 flex justify-between items-center relative overflow-hidden">

                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onNavigate(tab.id)}
                            className="relative flex-1 flex flex-col items-center justify-center py-2 z-10"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-active-pill"
                                    className="absolute inset-0 bg-slate-100 rounded-full shadow-inner border border-slate-200/50"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <tab.icon
                                className={cn(
                                    "relative w-6 h-6 transition-colors duration-200",
                                    isActive ? "text-slate-800 stroke-[3]" : "text-slate-400 stroke-[2.5]"
                                )}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

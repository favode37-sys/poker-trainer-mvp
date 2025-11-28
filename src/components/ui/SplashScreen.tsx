import { useState } from 'react';
import { motion } from 'framer-motion';
import { soundEngine } from '@/lib/sound';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
    onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const [isExiting, setIsExiting] = useState(false);

    const handleStart = () => {
        soundEngine.init(); // Critical: Unlock AudioContext on user gesture
        // soundEngine.playClick(); // Optional confirmation sound
        setIsExiting(true);
        setTimeout(onComplete, 800); // Wait for exit animation
    };

    if (isExiting) {
        return (
            <motion.div
                className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-white font-black text-4xl"
                >
                    POKER TRAINER
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-6 text-center cursor-pointer" onClick={handleStart}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
            >
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                    <span className="text-5xl">♠️</span>
                </div>

                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        Poker Trainer
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Master the game. One hand at a time.
                    </p>
                </div>

                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="pt-12"
                >
                    <span className="text-white/80 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Tap to Start
                        <Sparkles className="w-4 h-4" />
                    </span>
                </motion.div>
            </motion.div>
        </div>
    );
}

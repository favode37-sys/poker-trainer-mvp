import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTypewriter } from '@/hooks/useTypewriter';

interface CoachModalProps {
    isOpen: boolean;
    onClose: () => void;
    explanation: string;
}

export function CoachModal({ isOpen, onClose, explanation }: CoachModalProps) {
    const [isThinking, setIsThinking] = useState(true);
    const { displayedText, isComplete } = useTypewriter(
        isThinking ? '' : explanation,
        25, // Fast typing speed
        0
    );

    useEffect(() => {
        if (isOpen) {
            setIsThinking(true);
            // Simulate "thinking" for 1.5 seconds
            const timer = setTimeout(() => {
                setIsThinking(false);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-50 max-w-2xl mx-auto"
                    >
                        <div className="bg-white/95 backdrop-blur-md rounded-t-3xl shadow-2xl border-t-4 border-brand-blue">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-200">
                                <div className="flex items-center gap-3">
                                    {/* Coach Avatar - Pulsing Brain Icon */}
                                    <motion.div
                                        animate={isThinking ? {
                                            scale: [1, 1.1, 1],
                                        } : {}}
                                        transition={{
                                            duration: 1.5,
                                            repeat: isThinking ? Infinity : 0,
                                            ease: 'easeInOut'
                                        }}
                                        className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-blue-600 flex items-center justify-center border-4 border-blue-200 shadow-lg"
                                    >
                                        <Brain className="w-6 h-6 text-white" />
                                    </motion.div>

                                    <div>
                                        <h3 className="font-black text-lg text-slate-800">AI Coach</h3>
                                        <p className="text-xs text-slate-500">Strategic Analysis</p>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                {isThinking ? (
                                    /* Thinking Animation */
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="flex gap-2 mb-4">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{
                                                        y: [0, -12, 0],
                                                    }}
                                                    transition={{
                                                        duration: 0.6,
                                                        repeat: Infinity,
                                                        delay: i * 0.15,
                                                        ease: 'easeInOut'
                                                    }}
                                                    className="w-3 h-3 rounded-full bg-brand-blue"
                                                />
                                            ))}
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium">Analyzing the situation...</p>
                                    </div>
                                ) : (
                                    /* AI Response with Typewriter Effect */
                                    <div className="prose prose-slate max-w-none">
                                        <p className="text-slate-700 leading-relaxed text-base">
                                            {displayedText}
                                            {!isComplete && (
                                                <motion.span
                                                    animate={{ opacity: [1, 0, 1] }}
                                                    transition={{ duration: 0.8, repeat: Infinity }}
                                                    className="inline-block w-0.5 h-5 bg-brand-blue ml-0.5 align-middle"
                                                />
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {!isThinking && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="p-6 border-t border-slate-200 bg-slate-50/50"
                                >
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        onClick={onClose}
                                        disabled={!isComplete}
                                    >
                                        Got it, thanks!
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

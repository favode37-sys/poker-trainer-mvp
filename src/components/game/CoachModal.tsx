import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTypewriter } from '@/hooks/useTypewriter';

interface CoachModalProps {
    isOpen: boolean;
    isLoading: boolean; // Controlled externally
    onClose: () => void;
    explanation: string;
}

export function CoachModal({ isOpen, isLoading, onClose, explanation }: CoachModalProps) {
    // We pass the explanation to typewriter ONLY when not loading
    const { displayedText, isComplete } = useTypewriter(
        isLoading ? '' : explanation,
        25, // Speed
        0
    );

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
                        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-50 max-w-2xl mx-auto"
                    >
                        <div className="glass-panel rounded-t-3xl shadow-2xl border-t border-white/50">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-neutral-200/50">
                                <div className="flex items-center gap-3">
                                    {/* Avatar Animation */}
                                    <motion.div
                                        animate={isLoading ? {
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 5, -5, 0]
                                        } : {}}
                                        transition={{
                                            duration: 1.5,
                                            repeat: isLoading ? Infinity : 0,
                                            ease: 'easeInOut'
                                        }}
                                        className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center border-4 border-white shadow-lg"
                                    >
                                        <Brain className="w-6 h-6 text-brand-dark" />
                                    </motion.div>

                                    <div>
                                        <h3 className="font-black text-lg text-neutral-800">AI Coach</h3>
                                        <p className="text-xs text-neutral-500">Powered by Gemini</p>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5 text-neutral-400" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 min-h-[150px] max-h-[60vh] overflow-y-auto">
                                {isLoading ? (
                                    /* Thinking Animation */
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="flex gap-2 mb-4">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ y: [0, -12, 0] }}
                                                    transition={{
                                                        duration: 0.6,
                                                        repeat: Infinity,
                                                        delay: i * 0.15,
                                                        ease: 'easeInOut'
                                                    }}
                                                    className="w-3 h-3 rounded-full bg-brand-primary"
                                                />
                                            ))}
                                        </div>
                                        <p className="text-neutral-500 text-sm font-medium animate-pulse">Analyzing the hand...</p>
                                    </div>
                                ) : (
                                    /* AI Response */
                                    <div className="prose prose-neutral max-w-none">
                                        <p className="text-neutral-700 leading-relaxed text-lg font-medium">
                                            {displayedText}
                                            {!isComplete && (
                                                <motion.span
                                                    animate={{ opacity: [1, 0, 1] }}
                                                    transition={{ duration: 0.8, repeat: Infinity }}
                                                    className="inline-block w-0.5 h-5 bg-brand-primary ml-0.5 align-middle"
                                                />
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {!isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="p-6 border-t border-neutral-200/50 bg-white/30"
                                >
                                    <Button variant="primary" size="lg" fullWidth onClick={onClose}>
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

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react'; // Added Sparkles
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FeedbackSheetProps {
    state: 'success' | 'error' | null;
    message: string | null;
    explanation?: string | null;
    onNext: () => void;
    onExpand?: () => void;
}

export function FeedbackSheet({ state, message, explanation, onNext, onExpand }: FeedbackSheetProps) {
    if (!state || !message) return null;

    const isSuccess = state === 'success';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className={cn(
                    'fixed inset-x-0 bottom-0 z-50 rounded-t-3xl p-6 pb-8 shadow-2xl border-t glass-panel',
                    isSuccess
                        ? 'bg-functional-success/20 border-functional-success'
                        : 'bg-functional-error/20 border-functional-error'
                )}
            >
                <div className="max-w-md mx-auto space-y-4">
                    {/* Icon and Header */}
                    <div className="flex items-center gap-3">
                        {isSuccess ? (
                            <div className="flex-shrink-0 w-12 h-12 bg-functional-success rounded-full flex items-center justify-center shadow-sm">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                            </div>
                        ) : (
                            <div className="flex-shrink-0 w-12 h-12 bg-functional-error rounded-full flex items-center justify-center shadow-sm">
                                <XCircle className="w-8 h-8 text-white" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className={cn(
                                'text-2xl font-black uppercase tracking-tight',
                                isSuccess ? 'text-green-800' : 'text-red-800'
                            )}>
                                {isSuccess ? 'Correct!' : 'Not Quite'}
                            </h3>
                        </div>
                    </div>

                    {/* Message (Simple) */}
                    <div className={cn(
                        'p-4 rounded-xl border',
                        isSuccess
                            ? 'bg-white/80 border-functional-success/30 text-green-900'
                            : 'bg-white/80 border-functional-error/30 text-red-900'
                    )}>
                        <p className="text-sm leading-relaxed font-bold">{message}</p>
                    </div>

                    {/* AI Coach Trigger Button */}
                    {!explanation && onExpand && (
                        <button
                            onClick={onExpand}
                            className="w-full py-3 bg-white/80 hover:bg-white border border-brand-primary/50 rounded-xl flex items-center justify-center gap-2 text-brand-dark font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                            <Sparkles className="w-5 h-5 text-brand-primary" />
                            {isSuccess ? 'Why is this correct?' : 'Ask AI Coach why I lost'}
                        </button>
                    )}

                    {/* Inline Explanation (Fallback) */}
                    {explanation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 mt-2 bg-white/50 rounded-lg text-sm text-neutral-800 leading-relaxed font-medium border border-neutral-200"
                        >
                            {explanation}
                        </motion.div>
                    )}

                    {/* Action Button */}
                    <Button
                        variant={isSuccess ? 'primary' : 'danger'}
                        size="lg"
                        fullWidth
                        onClick={onNext}
                        className="shadow-lg"
                    >
                        {isSuccess ? 'CONTINUE' : 'GOT IT'}
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

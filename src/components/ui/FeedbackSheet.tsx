import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
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
                    'fixed inset-x-0 bottom-0 z-50 rounded-t-3xl p-6 pb-8 shadow-2xl border-t-4',
                    isSuccess
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                )}
            >
                <div className="max-w-md mx-auto space-y-4">
                    {/* Icon and Header */}
                    <div className="flex items-center gap-3">
                        {isSuccess ? (
                            <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                            </div>
                        ) : (
                            <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
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

                    {/* Message */}
                    <div className={cn(
                        'p-4 rounded-xl border-2',
                        isSuccess
                            ? 'bg-white border-green-200 text-green-900'
                            : 'bg-white border-red-200 text-red-900'
                    )}>
                        <p className="text-sm leading-relaxed font-bold">{message}</p>
                    </div>

                    {/* Explanation Logic */}
                    {explanation ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 mt-2 bg-white/50 rounded-lg text-sm text-slate-800 leading-relaxed font-medium border border-slate-200/50"
                        >
                            {explanation}
                        </motion.div>
                    ) : (
                        isSuccess && onExpand && (
                            <button
                                onClick={onExpand}
                                className="text-sm text-slate-500 hover:text-slate-700 underline decoration-dotted mt-2 flex items-center gap-1 font-medium transition-colors"
                            >
                                💡 Why was this right?
                            </button>
                        )
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

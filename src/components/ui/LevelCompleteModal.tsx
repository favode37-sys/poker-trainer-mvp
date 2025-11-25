import { motion } from 'framer-motion';
import { Trophy, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Confetti from 'react-confetti';

interface LevelCompleteModalProps {
    levelTitle: string;
    xpEarned: number;
    correctAnswers: number;
    totalQuestions: number;
    onContinue: () => void;
}

export function LevelCompleteModal({
    levelTitle,
    xpEarned,
    correctAnswers,
    totalQuestions,
    onContinue
}: LevelCompleteModalProps) {
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

    return (
        <>
            <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
                numberOfPieces={500}
                gravity={0.3}
            />
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                >
                    {/* Trophy Animation */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="flex justify-center mb-6"
                    >
                        <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center border-8 border-yellow-500 shadow-lg">
                            <Trophy className="w-12 h-12 text-white" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-center mb-8"
                    >
                        <h2 className="text-3xl font-black text-slate-800 mb-2">
                            Level Cleared!
                        </h2>
                        <p className="text-slate-600">
                            {levelTitle}
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-4 mb-8"
                    >
                        {/* XP Earned */}
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                            <div className="flex items-center gap-2">
                                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                                <span className="font-bold text-slate-700">XP Earned</span>
                            </div>
                            <span className="text-2xl font-black text-yellow-600">+{xpEarned}</span>
                        </div>

                        {/* Accuracy */}
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border-2 border-green-200">
                            <span className="font-bold text-slate-700">Accuracy</span>
                            <span className="text-2xl font-black text-green-600">{accuracy}%</span>
                        </div>

                        {/* Questions Answered */}
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                            <span className="font-bold text-slate-700">Questions</span>
                            <span className="text-2xl font-black text-blue-600">
                                {correctAnswers}/{totalQuestions}
                            </span>
                        </div>
                    </motion.div>

                    {/* Continue Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={onContinue}
                            className="shadow-lg"
                        >
                            <span className="flex items-center justify-center gap-2">
                                CONTINUE JOURNEY
                                <ArrowRight className="w-5 h-5" />
                            </span>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}

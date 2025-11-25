import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { soundEngine } from '@/lib/sound';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReset: () => void;
}

export function SettingsModal({ isOpen, onClose, onReset }: SettingsModalProps) {
    const [soundEnabled, setSoundEnabled] = useState(!soundEngine.isMuted());

    const handleToggleSound = () => {
        const newMuted = soundEngine.toggleMute();
        setSoundEnabled(!newMuted);
        // Play click to demonstrate the new setting
        if (!newMuted) {
            soundEngine.playClick();
        }
    };

    const handleReset = () => {
        const confirmed = window.confirm(
            '⚠️ Are you sure you want to reset ALL progress?\n\nThis will:\n• Reset all levels to locked\n• Clear your XP and achievements\n• Erase all saved data\n\nThis action cannot be undone!'
        );

        if (confirmed) {
            onReset();
            onClose();
        }
    };

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
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full pointer-events-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Settings className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800">Settings</h2>
                                        <p className="text-xs text-slate-500">Manage your app preferences</p>
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
                            <div className="p-6 space-y-6">
                                {/* App Version */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-600">App Version</span>
                                        <span className="text-sm font-bold text-slate-800">1.0 MVP</span>
                                    </div>
                                </div>

                                {/* Sound Toggle */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {soundEnabled ? (
                                                <Volume2 className="w-5 h-5 text-slate-600" />
                                            ) : (
                                                <VolumeX className="w-5 h-5 text-slate-400" />
                                            )}
                                            <span className="text-sm font-medium text-slate-700">Sound Effects</span>
                                        </div>
                                        <button
                                            onClick={handleToggleSound}
                                            className="relative"
                                        >
                                            <div className={`w-12 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-brand-green' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-0.5 transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0.5'} w-5 h-5 bg-white rounded-full shadow-md`} />
                                            </div>
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        {soundEnabled ? '🔊 Sound enabled' : '🔇 Sound muted'}
                                    </p>
                                </div>

                                {/* Danger Zone */}
                                <div className="border-2 border-red-200 rounded-xl p-4 bg-red-50/50">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Trash2 className="w-5 h-5 text-red-600" />
                                        <h3 className="font-bold text-red-900">Danger Zone</h3>
                                    </div>

                                    <p className="text-sm text-red-800 mb-4">
                                        Resetting your progress will erase all saved data and return the app to its initial state.
                                    </p>

                                    <Button
                                        variant="danger"
                                        size="lg"
                                        fullWidth
                                        onClick={handleReset}
                                        className="shadow-md"
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <Trash2 className="w-5 h-5" />
                                            Reset All Progress
                                        </span>
                                    </Button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-200 bg-slate-50/50 rounded-b-3xl">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    fullWidth
                                    onClick={onClose}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

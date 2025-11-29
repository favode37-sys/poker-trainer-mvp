import confetti from 'canvas-confetti';

export const playSuccessEffect = () => {
    // "Heroic" confetti burst from bottom center - Gold/Green theme
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#58CC02', '#FFD700', '#ffffff']
    });
};

export const playFoldEffect = () => {
    // Subtle "Blue/White" confetti for disciplined folds (Strategic Reward)
    confetti({
        particleCount: 40,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#1CB0F6', '#ffffff'],
        scalar: 0.8
    });
};

// Helper to trigger CSS shake class
export const triggerShake = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
        // Reset animation to allow re-triggering
        el.classList.remove('animate-shake');
        void el.offsetWidth; // trigger reflow
        el.classList.add('animate-shake');
    }
};

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error';

export const triggerHaptic = (type: HapticType) => {
    // Check if API is available
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    try {
        switch (type) {
            case 'light':
                navigator.vibrate(10); // Soft tick (UI clicks)
                break;
            case 'medium':
                navigator.vibrate(25); // Standard action (Call/Check)
                break;
            case 'heavy':
                navigator.vibrate(50); // impactful action (Raise)
                break;
            case 'success':
                navigator.vibrate([10, 30, 10, 30]); // Double tap (Win/Correct)
                break;
            case 'error':
                navigator.vibrate([50, 50, 50]); // Heavy buzz (Lose/Wrong)
                break;
        }
    } catch (e) {
        // Ignore haptic errors on unsupported devices
    }
};

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

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'rise') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        switch (type) {
            case 'light':
                navigator.vibrate(10); // Click (Soft tick)
                break;
            case 'medium':
                navigator.vibrate(25); // Regular action (Call)
                break;
            case 'heavy':
                navigator.vibrate(50); // Heavy action (Raise, All-in)
                break;
            case 'success':
                navigator.vibrate([10, 30, 10, 30]); // Double tap (Win/Correct)
                break;
            case 'error':
                navigator.vibrate([50, 50, 50]); // Heavy buzz (Lose/Wrong)
                break;
            case 'rise':
                // Rising sensation (Streak/Level Up)
                navigator.vibrate([10, 20, 10, 20, 30, 40]);
                break;
        }
    }
};

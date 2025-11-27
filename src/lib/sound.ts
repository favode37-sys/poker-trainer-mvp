// Sound engine using Web Audio API
class SoundEngine {
    private audioContext: AudioContext | null = null;
    private muted: boolean = false;

    constructor() {
        // Load mute preference from localStorage
        const saved = localStorage.getItem('poker-sound-muted');
        this.muted = saved === 'true';
    }

    private getContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
        if (this.muted) return;

        try {
            const ctx = this.getContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e: unknown) {
            console.warn('Failed to play sound:', e);
        }
    }

    // Click sound - crisp tick
    playClick() {
        this.playTone(800, 0.05, 'sine', 0.2);
    }

    // Success sound - major chord arpeggio (C-E-G)
    playSuccess() {
        if (this.muted) return;

        try {
            const ctx = this.getContext();
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

            notes.forEach((freq, index) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

                const startTime = ctx.currentTime + (index * 0.08);
                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.3);
            });
        } catch (e: unknown) {
            console.warn('Failed to play success sound:', e);
        }
    }

    // Error sound - low buzzy thud
    playError() {
        if (this.muted) return;

        try {
            const ctx = this.getContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.2);
        } catch (e: unknown) {
            console.warn('Failed to play error sound:', e);
        }
    }

    // Level complete - celebratory ascending scale
    playLevelComplete() {
        if (this.muted) return;

        try {
            const ctx = this.getContext();
            // C major scale ascending: C-D-E-G-C
            const notes = [523.25, 587.33, 659.25, 783.99, 1046.50];

            notes.forEach((freq, index) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

                const startTime = ctx.currentTime + (index * 0.12);
                gainNode.gain.setValueAtTime(0.35, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.4);
            });
        } catch (e: unknown) {
            console.warn('Failed to play level complete sound:', e);
        }
    }

    // Ticking sound for timer
    playTick() {
        this.playTone(1000, 0.03, 'sine', 0.1);
    }

    // Fire/Streak sound - rising swoosh
    playFire() {
        if (this.muted) return;
        try {
            const ctx = this.getContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(200, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);

            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        } catch (e) {
            console.warn(e);
        }
    }

    // Badge/Milestone sound - bright chime
    playBadge() {
        if (this.muted) return;
        try {
            const ctx = this.getContext();
            const notes = [880, 1108, 1318]; // A5, C#6, E6
            notes.forEach((freq, i) => {
                this.playTone(freq, 0.4, 'sine', 0.2);
            });
        } catch (e) {
            console.warn(e);
        }
    }

    toggleMute(): boolean {
        this.muted = !this.muted;
        localStorage.setItem('poker-sound-muted', String(this.muted));
        return this.muted;
    }

    isMuted(): boolean {
        return this.muted;
    }

    setMuted(muted: boolean) {
        this.muted = muted;
        localStorage.setItem('poker-sound-muted', String(muted));
    }

    // Initialize audio context on first user interaction
    init() {
        try {
            this.getContext();
        } catch (e: unknown) {
            console.warn('Failed to initialize audio:', e);
        }
    }
}

// Export singleton instance
export const soundEngine = new SoundEngine();

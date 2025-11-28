import type { Action } from './types';

export interface PlayerStats {
    totalHands: number;
    correctHands: number;
    // Metrics for Radar Chart (0-100)
    metrics: {
        preflop: { correct: number; total: number };
        aggression: { correctRaises: number; missedRaises: number };
        discipline: { correctFolds: number; missedFolds: number };
        river: { correct: number; total: number };
    };
    // Leaks Analysis
    leaks: {
        callingStation: number; // Called when should Fold
        passive: number;        // Called when should Raise
        nit: number;            // Folded when should Call/Raise
    };
    // Graph Data
    bankrollHistory: { session: number; amount: number }[];
}

const STORAGE_KEY = 'poker-trainer-stats-v1';

export const statsStore = {
    get: (): PlayerStats => {
        try {
            const defaultStats: PlayerStats = {
                totalHands: 0,
                correctHands: 0,
                metrics: {
                    preflop: { correct: 0, total: 0 },
                    aggression: { correctRaises: 0, missedRaises: 0 },
                    discipline: { correctFolds: 0, missedFolds: 0 },
                    river: { correct: 0, total: 0 },
                },
                leaks: { callingStation: 0, passive: 0, nit: 0 },
                bankrollHistory: []
            };
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
        } catch { return {} as any; }
    },

    recordHand: (
        isCorrect: boolean,
        userAction: Action,
        correctAction: Action,
        street: string,
        currentBankroll: number
    ) => {
        const s = statsStore.get();
        s.totalHands++;
        if (isCorrect) s.correctHands++;

        // 1. Update Metrics
        if (street === 'preflop') {
            s.metrics.preflop.total++;
            if (isCorrect) s.metrics.preflop.correct++;
        }
        if (street === 'river') {
            s.metrics.river.total++;
            if (isCorrect) s.metrics.river.correct++;
        }

        // Aggression Metric (Did we raise when needed?)
        if (correctAction === 'Raise') {
            if (userAction === 'Raise') s.metrics.aggression.correctRaises++;
            else s.metrics.aggression.missedRaises++;
        }

        // Discipline Metric (Did we fold when needed?)
        if (correctAction === 'Fold') {
            if (userAction === 'Fold') s.metrics.discipline.correctFolds++;
            else s.metrics.discipline.missedFolds++;
        }

        // 2. Analyze Leaks (Only on error)
        if (!isCorrect) {
            if (correctAction === 'Fold' && userAction === 'Call') s.leaks.callingStation++;
            if (correctAction === 'Raise' && userAction === 'Call') s.leaks.passive++;
            if ((correctAction === 'Call' || correctAction === 'Raise') && userAction === 'Fold') s.leaks.nit++;
        }

        // 3. Bankroll History (Limit to last 50 points for cleaner graph)
        s.bankrollHistory.push({ session: s.totalHands, amount: currentBankroll });
        if (s.bankrollHistory.length > 50) s.bankrollHistory.shift();

        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    },

    // Reset stats
    reset: () => localStorage.removeItem(STORAGE_KEY)
};

import { type Card, type Action } from './types';

interface EvaluationResult {
    action: Action;
    reason: string;
    strength: number; // 0-100
}

const RANKS = "23456789TJQKA";

export const pokerEvaluator = {
    evaluate: (
        hand: [Card, Card],
        community: Card[] = [],
        _potOdds: number = 0,
        _stackToPotRatio: number = 1
    ): EvaluationResult => {
        // Only Preflop implemented for now
        if (community.length === 0) {
            return evaluatePreflop(hand);
        }
        return { action: 'Check', reason: "Postflop not implemented", strength: 0 };
    }
};

function evaluatePreflop(hand: [Card, Card]): EvaluationResult {
    const c1 = hand[0];
    const c2 = hand[1];

    // Parse ranks
    const r1 = RANKS.indexOf(c1.rank);
    const r2 = RANKS.indexOf(c2.rank);

    const high = Math.max(r1, r2);
    const low = Math.min(r1, r2);
    const isPair = r1 === r2;
    const isSuited = c1.suit === c2.suit;

    // --- SIMPLIFIED OPEN RAISING STRATEGY (BTN) ---
    // Pairs
    if (isPair) {
        if (high >= RANKS.indexOf('2')) return { action: 'Raise', reason: "Any pair is a raise from BTN", strength: 80 };
    }

    // Suited
    if (isSuited) {
        // Ax suited
        if (high === 12) return { action: 'Raise', reason: "Axs is a strong open", strength: 90 };
        // Kx suited
        if (high === 11 && low >= 0) return { action: 'Raise', reason: "Kxs is a standard open", strength: 75 }; // K2s+
        // Qx suited
        if (high === 10 && low >= 2) return { action: 'Raise', reason: "Q4s+ is a raise", strength: 70 };
        // Jx suited
        if (high === 9 && low >= 5) return { action: 'Raise', reason: "J7s+ is a raise", strength: 65 };
        // Connectors/Gappers (54s+)
        if (high - low <= 2 && low >= 3) return { action: 'Raise', reason: "Suited connector/gapper", strength: 70 };
    }

    // Offsuit
    if (!isSuited) {
        // Ax
        if (high === 12 && low >= 0) return { action: 'Raise', reason: "Axo is a raise from BTN", strength: 75 }; // A2o+
        // Kx
        if (high === 11 && low >= 3) return { action: 'Raise', reason: "K5o+ is a raise", strength: 70 };
        // Qx
        if (high === 10 && low >= 7) return { action: 'Raise', reason: "Q9o+ is a raise", strength: 65 };
        // Jx
        if (high === 9 && low >= 8) return { action: 'Raise', reason: "JTo is a raise", strength: 60 };
        // Connectors (T9o, 98o)
        if (high - low === 1 && low >= 6) return { action: 'Raise', reason: "High connector", strength: 60 };
    }

    return { action: 'Fold', reason: "Too weak to open", strength: 20 };
}

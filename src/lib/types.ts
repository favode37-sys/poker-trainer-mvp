export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
    rank: Rank;
    suit: Suit;
}

export interface GameState {
    lives: number;
    streak: number;
}

export type Action = 'Fold' | 'Call' | 'Raise' | 'Check';

export interface Villain {
    id: string;
    position: string;
    stack: number;
    chipsInFront: number;
    action: string;
    cards: Card[]; // Array of 0 or 2 cards
}

// Decision point within a hand
export interface Decision {
    heroChipsInFront: number;
    villainChipsInFront: number;
    villainAction: string;
    amountToCall: number;
    correctAction: Action;
    defaultRaiseAmount: number;
    explanation_simple: string;
    explanation_deep: string;
    actionLabel: string; // e.g., "Hero Raise 3", "BB Raise 11"
}

export interface Scenario {
    id: string;
    title: string;
    levelId: string;
    blinds: { sb: number; bb: number };
    heroPosition: string;
    heroStack?: number;
    villainPosition?: string;
    heroChipsInFront?: number;
    villainChipsInFront?: number;
    villains?: Villain[];
    heroCards: [Card, Card];
    communityCards: Card[];
    potSize: number;
    actionHistory: string[];
    villainAction?: string;
    amountToCall: number;
    defaultRaiseAmount: number;
    correctAction: Action;
    explanation_simple: string;
    explanation_deep: string;
    nextStageId?: string;
    isFollowUp?: boolean;
    street?: 'preflop' | 'flop' | 'turn' | 'river';

    // NEW: Multi-decision support
    decisions?: Decision[];  // Array of sequential decision points
}

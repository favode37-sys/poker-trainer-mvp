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

export interface Scenario {
    id: string;
    title: string;
    levelId: string;
    blinds: { sb: number; bb: number };
    heroPosition: string;
    villainPosition: string;
    heroCards: [Card, Card];
    communityCards: Card[];
    potSize: number;
    actionHistory: string[];
    villainAction: string;
    amountToCall: number;
    defaultRaiseAmount: number;
    correctAction: Action;
    explanation_simple: string;
    explanation_deep: string;
    nextStageId?: string;
}

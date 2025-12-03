import { type Card, type Suit, type Rank } from './types';

export type Position = 'SB' | 'BB' | 'UTG' | 'MP' | 'CO' | 'BTN';

// Жесткий порядок позиций за 6-max столом (по часовой стрелке)
const POSITION_ORDER: Position[] = ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'];

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

export function createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ rank, suit });
        }
    }
    return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
}

export function drawCards(deck: Card[], count: number, exclude: Card[] = []): { drawn: Card[], remaining: Card[] } {
    // Filter out excluded cards
    const excludeStrings = new Set(exclude.map(c => `${c.rank}${c.suit}`));
    let available = deck.filter(c => !excludeStrings.has(`${c.rank}${c.suit}`));

    // Shuffle
    available = shuffleDeck(available);

    // Draw
    const drawn = available.slice(0, count);
    const remaining = available.slice(count);

    return { drawn, remaining };
}

interface SeatConfig {
    id: number;           // 1-6 (1 всегда Hero)
    positionLabel: Position;
    isHero: boolean;
    isVillain: boolean;
    isDealer: boolean;
}

/**
 * Рассчитывает конфигурацию всех 6 мест за столом относительно позиции Героя.
 * Гарантирует, что кнопка дилера (BTN) всегда одна и на правильном месте.
 */
export function calculateTableSeats(heroPos: Position, villainPos: Position): SeatConfig[] {
    // 1. Находим индекс героя в круге позиций
    const heroIndex = POSITION_ORDER.indexOf(heroPos);

    // 2. Создаем "повернутый" массив, где позиция Героя всегда первая (индекс 0)
    // Если Hero = BTN, массив будет: [BTN, SB, BB, UTG, MP, CO]
    // Это соответствует визуальным местам: Seat 1 (Hero), Seat 2, Seat 3...

    // Если Hero на BTN, то порядок мест (1-6) будет:
    // Seat 1: BTN (Hero) -> isDealer: true
    // Seat 2: SB
    // Seat 3: BB
    // Seat 4: UTG
    // ...

    // Однако, в массиве POSITION_ORDER порядок идет: SB -> BB -> ... -> BTN.
    // Если мы сидим на Seat 1 (Hero), то игрок слева от нас (Seat 2) - это следующая позиция.
    // В покере порядок действий: SB -> BB... Но физическая рассадка: BTN -> SB (слева).
    // Массив выше некорректен для физической рассадки, так как после BTN идет SB.
    // Исправим логику сдвига.

    // Правильный порядок мест по часовой стрелке:
    // Если я BTN, слева от меня SB.
    // Индекс в массиве ORDER: BTN=5. Следующий (5+1)%6 = 0 (SB).

    const seats: SeatConfig[] = [];

    for (let i = 0; i < 6; i++) {
        // Индекс позиции для текущего места (i - смещение от места Героя)
        // Пример: HeroIndex (BTN) = 5.
        // Seat 1 (i=0): (5 + 0) % 6 = 5 (BTN)
        // Seat 2 (i=1): (5 + 1) % 6 = 0 (SB)
        const currentPosIndex = (heroIndex + i) % 6;
        const label = POSITION_ORDER[currentPosIndex];

        seats.push({
            id: i + 1, // Seat 1..6
            positionLabel: label,
            isHero: i === 0,
            isVillain: label === villainPos,
            isDealer: label === 'BTN'
        });
    }

    return seats;
}

// Standard acting order for 6-max
export const PREFLOP_ORDER: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

/**
 * Centralized algorithm to determine the state of "Filler" (background) players.
 * Implements the "Traffic Light" logic based on Hero's position and betting round.
 */
export function getFillerSeatStatus(
    seatPos: Position,
    heroPos: Position,
    street: string = 'preflop',
    actionHistory: string[] = []
): { isFolded: boolean; betAmount: number } {
    // 1. Postflop: In standard drills, background players are usually out
    if (street !== 'preflop') {
        return { isFolded: true, betAmount: 0 };
    }

    // 2. Preflop Logic
    const heroIdx = PREFLOP_ORDER.indexOf(heroPos);
    const thisIdx = PREFLOP_ORDER.indexOf(seatPos);
    const hasActionStarted = actionHistory.length > 0;

    let isFolded = true;
    let betAmount = 0;

    // Blinds always post chips initially
    if (seatPos === 'SB') betAmount = 0.5;
    if (seatPos === 'BB') betAmount = 1.0;

    if (!hasActionStarted) {
        // SCENARIO START (Hero to Act):
        // Players BEFORE Hero have acted. If they are not the Villain, they folded.
        if (thisIdx < heroIdx) {
            isFolded = true;
            betAmount = 0; // Chips swept
        }
        // Players AFTER Hero are waiting to act (Active)
        else {
            isFolded = false;
        }
    } else {
        // ACTION HAPPENED (Hero acted):
        // In isolation drills, we assume everyone else folds
        isFolded = true;
        betAmount = 0;
    }

    return { isFolded, betAmount };
}

export type Position = 'SB' | 'BB' | 'UTG' | 'MP' | 'CO' | 'BTN';

// Жесткий порядок позиций за 6-max столом (по часовой стрелке)
const POSITION_ORDER: Position[] = ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'];

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

import type { Scenario } from '@/lib/types';

export const LEVEL_1_TED_SCENARIOS: Scenario[] = [
    // =================================================================
    // BOSS LEVEL: UNCLE TED (The Calling Station)
    // =================================================================

    // ------------------------------------------------------------------
    // HAND 1: The "Fat Value" (Isolate Limper)
    // ------------------------------------------------------------------
    {
        id: 'boss_ted_1_iso',
        title: 'Punishing the Limper',
        levelId: 'boss-ted',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'BTN',
        villainPosition: 'CO', // Ted limps
        heroCards: [{ rank: 'A', suit: 'diamonds' }, { rank: 'Q', suit: 'clubs' }],
        communityCards: [],
        potSize: 2.5, // SB(0.5) + BB(1) + Limp(1)
        heroChipsInFront: 0,
        villainChipsInFront: 1, // Limp
        actionHistory: ['Uncle Ted limps'],
        villainAction: 'Call 1 BB',
        amountToCall: 1,
        defaultRaiseAmount: 4, // 3bb + 1 per limper
        correctAction: 'Raise',
        explanation_simple: 'Дядя Тед зашел лимпом (просто уравнял). Это признак слабости! Атакуй его с сильной рукой.',
        explanation_deep: 'Тед — "телефон". Он любит смотреть флопы дешево. С AQo мы обязаны рейзить (изолировать), чтобы остаться с ним 1-на-1 в позиции и забрать его стек на постфлопе. Никогда не лимпи вслед!',
    },

    // ------------------------------------------------------------------
    // HAND 2: The "Never Bluff" Rule (Failed Bluff)
    // ------------------------------------------------------------------
    {
        id: 'boss_ted_2_nobluff',
        title: 'Do NOT Bluff Ted',
        levelId: 'boss-ted',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'BTN',
        villainPosition: 'BB',
        heroCards: [{ rank: 'J', suit: 'hearts' }, { rank: 'T', suit: 'hearts' }], // Missed Draw
        communityCards: [
            { rank: 'A', suit: 'clubs' },
            { rank: '9', suit: 'spades' },
            { rank: '4', suit: 'diamonds' },
            { rank: '2', suit: 'clubs' },
            { rank: '2', suit: 'hearts' } // Board paired, bricks
        ],
        potSize: 18,
        heroChipsInFront: 0,
        villainChipsInFront: 0,
        actionHistory: ['River: Uncle Ted checks'],
        villainAction: 'Check',
        amountToCall: 0,
        defaultRaiseAmount: 12,
        correctAction: 'Check',
        explanation_simple: 'Ты не доехал. У тебя только Валет-хай. Но ставить нельзя! Тед вскроет тебя с любой парой.',
        explanation_deep: 'Золотое правило против "Телефонов": НИКОГДА НЕ БЛЕФУЙ. Тед смотрит на свои карты: "О, у меня пара двоек, колл". Ему плевать на твою историю ставок. Просто чекни и сдайся — это сохранит деньги.',
    },

    // ------------------------------------------------------------------
    // HAND 3: The "Painful Fold" (Fold to River Raise)
    // ------------------------------------------------------------------
    {
        id: 'boss_ted_3_fold',
        title: 'Respect the Passive Raise',
        levelId: 'boss-ted',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'UTG',
        villainPosition: 'BB',
        heroCards: [{ rank: 'A', suit: 'spades' }, { rank: 'K', suit: 'clubs' }], // Top Pair Top Kicker
        communityCards: [
            { rank: 'A', suit: 'hearts' },
            { rank: '8', suit: 'diamonds' },
            { rank: '3', suit: 'clubs' },
            { rank: 'J', suit: 'spades' },
            { rank: '8', suit: 'hearts' } // River pairs board
        ],
        potSize: 45,
        heroChipsInFront: 20, // We bet
        villainChipsInFront: 60, // Ted Raises!
        actionHistory: ['River: You bet 20bb. Uncle Ted RAISES to 60bb!'],
        villainAction: 'Raise to 60 BB',
        amountToCall: 40,
        defaultRaiseAmount: 0,
        correctAction: 'Fold',
        explanation_simple: 'Внимание! Пассивный Дядя Тед сделал РЕЙЗ на ривере. У него монстр (Трипс 888).',
        explanation_deep: 'Когда игрок типа "Calling Station" вдруг просыпается агрессией на ривере — там никогда нет блефа. Абсолютно никогда. У него 100% есть трипс восьмерок или фулл-хаус. Твой Туз-Король здесь мертв. Выкидывай не думая.',
    },

    // ------------------------------------------------------------------
    // HAND 4: Thin Value (Bet with Second Pair)
    // ------------------------------------------------------------------
    {
        id: 'boss_ted_4_thinvalue',
        title: 'Thin Value Town',
        levelId: 'boss-ted',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'CO',
        villainPosition: 'BB',
        heroCards: [{ rank: 'K', suit: 'diamonds' }, { rank: 'J', suit: 'diamonds' }], // Second pair
        communityCards: [
            { rank: 'A', suit: 'clubs' },
            { rank: 'K', suit: 'hearts' },
            { rank: '5', suit: 'spades' },
            { rank: '2', suit: 'diamonds' },
            { rank: '9', suit: 'hearts' }
        ],
        potSize: 22,
        heroChipsInFront: 0,
        villainChipsInFront: 0,
        actionHistory: ['River: Uncle Ted checks'],
        villainAction: 'Check',
        amountToCall: 0,
        defaultRaiseAmount: 10, // Small bet
        correctAction: 'Raise', // In UI this is Bet/Raise
        explanation_simple: 'У тебя вторая пара (Короли). Тед чекнул. Ставь немного! Он заколлирует с 99, 55 или карманными 77.',
        explanation_deep: 'Против регуляра здесь часто чек-бек. Но Тед — "телефон". Он не любит выкидывать красивые пары. Сделай небольшую ставку (40-50% банка), и он радостно отдаст тебе деньги с рукой хуже твоей. Это называется "Тонкое вэлью".',
    },

    // ------------------------------------------------------------------
    // HAND 5: Max Value (Overbet with Nuts)
    // ------------------------------------------------------------------
    {
        id: 'boss_ted_5_fatvalue',
        title: 'Greedy Value Bet',
        levelId: 'boss-ted',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'SB',
        villainPosition: 'BB',
        heroCards: [{ rank: '7', suit: 'spades' }, { rank: '6', suit: 'spades' }], // Low straight
        communityCards: [
            { rank: '4', suit: 'hearts' },
            { rank: '5', suit: 'hearts' },
            { rank: '8', suit: 'clubs' }, // Straight!
            { rank: 'K', suit: 'diamonds' },
            { rank: 'A', suit: 'spades' }
        ],
        potSize: 60,
        heroChipsInFront: 0,
        villainChipsInFront: 0,
        actionHistory: ['River: You hit the Straight! Ted checks.'],
        villainAction: 'Check',
        amountToCall: 0,
        defaultRaiseAmount: 50, // Big bet (almost pot)
        correctAction: 'Raise',
        explanation_simple: 'У тебя Стрит! Не скромничай. Ставь много. Тед ненавидит фолдить Тузов.',
        explanation_deep: 'Никаких ловушек или мелких ставок "для провокации". Тед видит у себя Туза или Короля и нажимает Колл. Твоя задача — назвать максимальную цену, которую он заплатит. Ставь 80-90% банка. Он поворчит, но заплатит.',
    }
];

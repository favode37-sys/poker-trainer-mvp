import type { Scenario } from '@/lib/types';

// Массив реальных обучающих сценариев, основанных на MDA-стратегии
export const REAL_SCENARIOS: Scenario[] = [
    // =================================================================
    // ПРАВИЛО 1: Чек-рейз на Терне/Ривере = НАТС
    // =================================================================
    {
        id: 'mda_rule1_turn_xr',
        title: 'Facing Turn Check-Raise',
        levelId: 'level_2_bar', // Постфлоп уровень
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'BTN',
        villainPosition: 'BB',
        heroCards: [{ rank: 'A', suit: 'hearts' }, { rank: 'K', suit: 'clubs' }], // Топ-пара, Топ-кикер
        communityCards: [
            { rank: 'K', suit: 'spades' },
            { rank: '7', suit: 'diamonds' },
            { rank: '2', suit: 'hearts' },
            { rank: '4', suit: 'clubs' }, // Терн бланк
        ],
        potSize: 18, // Банк к терну
        actionHistory: ['Hero raises Preflop', 'Villain calls', 'Flop: Villain checks, Hero bets, Villain calls', 'Turn: Villain checks, Hero bets 12bb'],
        villainAction: 'Raise to 40 BB', // Чек-рейз
        amountToCall: 28, // Нужно доставить
        defaultRaiseAmount: 0, // Рейзить тут не стоит
        correctAction: 'Fold',
        explanation_simple: 'На низких лимитах чек-рейз на терне — это почти всегда монстр (сет или две пары). Твоя топ-пара здесь бита.',
        explanation_deep: 'Это классическая MDA-эксплуатация. Пассивные оппоненты на микролимитах никогда не блефуют чек-рейзом на терне. Даже с сильной топ-парой (AK) мы обязаны дисциплинированно фолдить. У него здесь сет семерок, двоек или четверток. Не плати ему.',
    },

    // =================================================================
    // ПРАВИЛО 2: Три барреля от оппонента = НАТС
    // =================================================================
    {
        id: 'mda_rule2_triple_barrel',
        title: 'Facing River Triple Barrel',
        levelId: 'level_3_club', // Сложные решения
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'BB',
        villainPosition: 'UTG', // Ранняя позиция = сильный диапазон
        heroCards: [{ rank: 'K', suit: 'hearts' }, { rank: 'Q', suit: 'spades' }], // Топ-пара
        communityCards: [
            { rank: 'K', suit: 'diamonds' },
            { rank: '8', suit: 'clubs' },
            { rank: '4', suit: 'hearts' },
            { rank: 'J', suit: 'diamonds' },
            { rank: '2', suit: 'spades' }, // Ривер бланк
        ],
        potSize: 60,
        actionHistory: ['Villain raises UTG, Hero calls BB', 'Villain bets Flop, Hero calls', 'Villain bets Turn, Hero calls'],
        villainAction: 'Bet 45 BB', // Третий баррель на ривере (75% пота)
        amountToCall: 45,
        defaultRaiseAmount: 0,
        correctAction: 'Fold',
        explanation_simple: 'Оппонент ставил три улицы подряд из ранней позиции. Там нет блефов. Твоя топ-пара недостаточно сильна.',
        explanation_deep: 'Когда оппонент на низких лимитах ставит флоп, терн И ривер (особенно крупно), его диапазон экстремально смещен в сторону велью. Там нет промазавших дро. Твой Король-Дама здесь проигрывает AK, сетам или доехавшим двум парам. Это тяжелый, но необходимый фолд.',
    },

    // =================================================================
    // ПРАВИЛО 3: Не блефуем 3 улицы в "Телефона" (Сдаемся на ривере)
    // =================================================================
    {
        id: 'mda_rule3_give_up_river',
        title: 'Missed Draw vs Calling Station',
        levelId: 'level_2_bar',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'BTN',
        villainPosition: 'BB', // Оппонент - известный "телефон"
        heroCards: [{ rank: 'Q', suit: 'spades' }, { rank: 'J', suit: 'spades' }], // Промазавшее флеш-дро
        communityCards: [
            { rank: 'A', suit: 'spades' },
            { rank: '8', suit: 'hearts' },
            { rank: '3', suit: 'spades' },
            { rank: 'K', suit: 'diamonds' },
            { rank: '2', suit: 'clubs' }, // Ривер кирпич, дро не закрылось
        ],
        potSize: 40,
        actionHistory: ['Hero raises Preflop, Villain calls', 'Flop: Hero bets (semi-bluff), Villain calls', 'Turn: Hero bets (semi-bluff), Villain calls'],
        villainAction: 'Check', // Оппонент чекает к нам на ривере
        amountToCall: 0,
        defaultRaiseAmount: 30, // Кнопка Bet будет активна, но это ловушка
        correctAction: 'Check', // Сдаемся (Чек-бихайнд)
        explanation_simple: 'Твое дро не закрылось. Оппонент коллировал две улицы — он "телефон". Он не выкинет даже слабую пару на твою ставку.',
        explanation_deep: 'Против автоответчиков (Calling Stations) мы никогда не блефуем на ривере, если предыдущие баррели не сработали. Они уже решили, что идут до конца со своей парой восьмерок или слабым тузом. Ставка здесь — это просто сжигание денег. Смирись с проигрышем банка и чекай.',
    },

    // =================================================================
    // ПРАВИЛО 4: 3-бет не олл-ин на префлопе = Сила
    // =================================================================
    {
        id: 'mda_rule4_preflop_3bet',
        title: 'Facing Preflop 3-Bet with Dominated Hand',
        levelId: 'level_1_kitchen', // Префлоп основы
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'CO', // Поздняя позиция
        villainPosition: 'BTN', // Позиция еще позднее
        heroCards: [{ rank: 'A', suit: 'clubs' }, { rank: 'J', suit: 'hearts' }], // AJo - проблемная рука
        communityCards: [], // Префлоп
        potSize: 13.5,
        actionHistory: ['Hero raises to 3 BB'],
        villainAction: 'Raise to 9 BB', // Стандартный 3-бет (не олл-ин)
        amountToCall: 6,
        defaultRaiseAmount: 25, // 4-бет
        correctAction: 'Fold',
        explanation_simple: 'На микролимитах 3-бет не олл-ин означает очень сильную руку (QQ+, AK). Твои AJo здесь сильно доминированы.',
        explanation_deep: 'AJo выглядит красиво, но это ловушка против 3-бета. Диапазон оппонента здесь: JJ, QQ, KK, AA, AK, иногда AQ. Против этого спектра ты стоишь ужасно. Ты будешь часто попадать под доминацию (у него Туз с лучшим кикером) и проигрывать большие банки. Самая плюсовая игра — дисциплинированный фолд.',
    },

    // =================================================================
    // БОНУС: Вэлью-бет против "Телефона" (Обратная сторона правила 3)
    // =================================================================
    {
        id: 'mda_bonus_value_bet',
        title: 'Value Betting River vs Station',
        levelId: 'level_2_bar',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'UTG',
        villainPosition: 'BB', // Оппонент - "телефон"
        heroCards: [{ rank: 'A', suit: 'diamonds' }, { rank: 'K', suit: 'clubs' }], // Топ-пара, Топ-кикер
        communityCards: [
            { rank: 'A', suit: 'hearts' },
            { rank: '9', suit: 'spades' },
            { rank: '4', suit: 'diamonds' },
            { rank: '7', suit: 'clubs' },
            { rank: 'Q', suit: 'hearts' },
        ],
        potSize: 50,
        actionHistory: ['Hero bets Flop, Villain calls', 'Hero bets Turn, Villain calls'],
        villainAction: 'Check', // Ривер, оппонент чекает
        amountToCall: 0,
        defaultRaiseAmount: 40, // Крупная ставка (80% пота)
        correctAction: 'Raise', // В данном контексте это кнопка BET
        explanation_simple: 'У тебя сильная топ-пара против "телефона". Он коллировал дважды, значит, у него что-то есть, и он не выкинет. Ставь много!',
        explanation_deep: 'Против пассивных телефонов мы никогда не чекаем сильные руки на ривере "для контроля банка". Мы обязаны добирать вэлью. Он влюблен в свою пару девяток или слабую даму и заплатит большую ставку. Не стесняйся, ставь 75-80% банка и забирай его фишки.',
    },
];

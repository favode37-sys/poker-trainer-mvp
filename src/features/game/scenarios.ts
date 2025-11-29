import type { Scenario } from '@/lib/types';
import { LEVEL_1_TED_SCENARIOS } from './level1_ted';

export const scenarios: Scenario[] = [
    // =================================================================
    // LEVEL 1: THE KITCHEN (Preflop Fundamentals)
    // =================================================================

    // 1.1 Premium Hand vs Limper
    {
        id: 'kitchen_aks_utg',
        title: 'Premium Hand Strategy',
        levelId: 'level-1',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'UTG',
        villainPosition: 'MP', // Limper
        heroCards: [{ rank: 'A', suit: 'hearts' }, { rank: 'K', suit: 'hearts' }],
        communityCards: [],
        potSize: 2.5, // SB + BB + Limp
        heroChipsInFront: 0,
        villainChipsInFront: 1, // Limp
        actionHistory: ['Villain limps'],
        villainAction: 'Call 1 BB',
        amountToCall: 1,
        defaultRaiseAmount: 4, // 3bb + 1bb per limper
        correctAction: 'Raise',
        explanation_simple: 'С такой сильной рукой нужно играть агрессивно. Рейз увеличивает банк и изолирует лимпера.',
        explanation_deep: 'AKs — премиум рука. Лимп от оппонента — признак слабости. Не позволяй ему смотреть флоп дешево. Рейз 4бб (стандарт 3бб + 1бб за лимпера) — идеальный размер, чтобы захватить инициативу.',
    },

    // 1.2 Trash Hand Early Position
    {
        id: 'kitchen_kjo_utg',
        title: 'Early Position Discipline',
        levelId: 'level-1',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'UTG',
        villainPosition: 'BB',
        heroCards: [{ rank: 'K', suit: 'diamonds' }, { rank: 'J', suit: 'clubs' }],
        communityCards: [],
        potSize: 1.5,
        heroChipsInFront: 0,
        villainChipsInFront: 0,
        actionHistory: [],
        villainAction: 'Post BB',
        amountToCall: 1,
        defaultRaiseAmount: 3,
        correctAction: 'Fold',
        explanation_simple: 'KJo выглядит красиво, но это "мусор" для ранней позиции. Слишком часто ты попадешь под доминацию (AK, KQ).',
        explanation_deep: 'УТГ (Under The Gun) — самая сложная позиция. Здесь нужно разыгрывать только топ-диапазон. KJo — классическая ловушка для новичков: она часто выигрывает мелкие банки, но проигрывает огромные против AK или KQ. Дисциплинированный фолд сэкономит тебе кучу денег.',
    },

    // 1.3 Small Pair on Button
    {
        id: 'kitchen_22_btn',
        title: 'Set Mining in Position',
        levelId: 'level-1',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'BTN',
        villainPosition: 'CO', // Limper
        heroCards: [{ rank: '2', suit: 'spades' }, { rank: '2', suit: 'hearts' }],
        communityCards: [],
        potSize: 2.5,
        heroChipsInFront: 0,
        villainChipsInFront: 1,
        actionHistory: ['Villain limps'],
        villainAction: 'Call 1 BB',
        amountToCall: 1,
        defaultRaiseAmount: 4,
        correctAction: 'Raise',
        explanation_simple: 'Ты в лучшей позиции (BTN) против слабого игрока. Рейз позволяет забрать банк сразу или выиграть постфлоп.',
        explanation_deep: 'Лимп от CO — это слабость. Твои 22 уязвимы, но позиция дает огромное преимущество. Изолируй лимпера рейзом! Если он заколлирует, ты сможешь попытаться поймать сет или забрать банк контбетом на флопе, используя позицию.',
    },

    // 1.4 Dominated Hand vs Raise
    {
        id: 'kitchen_ajo_mp',
        title: 'Facing Early Aggression',
        levelId: 'level-1',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'MP',
        villainPosition: 'UTG', // Raiser
        heroCards: [{ rank: 'A', suit: 'clubs' }, { rank: 'J', suit: 'spades' }],
        communityCards: [],
        potSize: 4.5,
        heroChipsInFront: 0,
        villainChipsInFront: 3,
        actionHistory: ['Villain raises to 3bb'],
        villainAction: 'Raise to 3 BB',
        amountToCall: 3,
        defaultRaiseAmount: 9,
        correctAction: 'Fold',
        explanation_simple: 'Рейз из ранней позиции означает силу (AK, AQ, пары). Твои AJo здесь почти всегда позади.',
        explanation_deep: 'Против открытия из UTG (самая тайтовая позиция) AJo — это "сжигание денег". Даже если ты поймаешь Туза, у него часто будет кикер лучше (AK, AQ). Колл здесь — одна из самых дорогих ошибок на дистанции. Просто выкидывай.',
    },

    // 1.5 Premium Pair
    {
        id: 'kitchen_qq_utg',
        title: 'Opening Premium Pairs',
        levelId: 'level-1',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'UTG',
        villainPosition: 'BB',
        heroCards: [{ rank: 'Q', suit: 'diamonds' }, { rank: 'Q', suit: 'clubs' }],
        communityCards: [],
        potSize: 1.5,
        heroChipsInFront: 0,
        villainChipsInFront: 0,
        actionHistory: [],
        villainAction: 'Post BB',
        amountToCall: 1,
        defaultRaiseAmount: 3,
        correctAction: 'Raise',
        explanation_simple: 'Третья лучшая рука в игре. Всегда открывай рейзом!',
        explanation_deep: 'С Дамами (QQ) мы всегда хотим играть на стек. Никогда не лимпь премиум пары! Твоя цель — построить большой банк с самого начала.',
    },

    // =================================================================
    // LEVEL 2: LOCAL BAR (Postflop Value Betting)
    // =================================================================

    // 2.1 TPTK Value
    {
        id: 'bar_flop_tptk_value',
        title: 'Value Betting TPTK',
        levelId: 'level-2',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'BTN',
        villainPosition: 'BB',
        heroCards: [{ rank: 'A', suit: 'spades' }, { rank: 'Q', suit: 'hearts' }],
        communityCards: [
            { rank: 'A', suit: 'diamonds' },
            { rank: '7', suit: 'clubs' },
            { rank: '3', suit: 'spades' }
        ],
        potSize: 6.5,
        heroChipsInFront: 0,
        villainChipsInFront: 0,
        actionHistory: ['Hero raises Pre, Villain calls', 'Flop: Villain checks'],
        villainAction: 'Check',
        amountToCall: 0,
        defaultRaiseAmount: 4.5,
        correctAction: 'Raise',
        explanation_simple: 'Топ-пара с отличным кикером. Не слоуплей! Ставь, чтобы добрать с Ax слабее.',
        explanation_deep: 'На микролимитах главное правило: "Есть рука — ставь". Не пытайся хитрить. Оппонент на BB часто заколлирует с A2-AT или любой парой (88, 99). Забирай их деньги сейчас.',
    },

    // 2.2 Overpair vs Donk
    {
        id: 'bar_turn_overpair_call',
        title: 'Navigating Donk Bets',
        levelId: 'level-2',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'MP',
        villainPosition: 'CO', // LAG
        heroCards: [{ rank: 'J', suit: 'spades' }, { rank: 'J', suit: 'hearts' }],
        communityCards: [
            { rank: '9', suit: 'clubs' },
            { rank: '6', suit: 'diamonds' },
            { rank: '2', suit: 'spades' },
            { rank: '5', suit: 'hearts' }
        ],
        potSize: 20,
        heroChipsInFront: 0,
        villainChipsInFront: 12,
        actionHistory: ['Flop: Hero bets, Villain calls', 'Turn: Villain leads (Donk)'],
        villainAction: 'Bet 12 BB',
        amountToCall: 12,
        defaultRaiseAmount: 30,
        correctAction: 'Call',
        explanation_simple: 'Агрессивный оппонент ставит сам. У тебя сильная пара, но рейз выбьет его блефы. Колл лучше.',
        explanation_deep: 'Когда агрессивный игрок "донкает" (ставит первым без инициативы), это часто блеф или средняя рука. Рейзом ты заставишь его выкинуть 87 или T8, но он продолжит с сетами (99, 66). Колл держит его блефы в банке.',
    },

    // 2.3 River Thin Value
    {
        id: 'bar_river_twopair_value',
        title: 'Thin Value Betting',
        levelId: 'level-2',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'SB',
        villainPosition: 'BB',
        heroCards: [{ rank: 'K', suit: 'clubs' }, { rank: 'T', suit: 'clubs' }],
        communityCards: [
            { rank: 'K', suit: 'hearts' },
            { rank: 'T', suit: 'diamonds' },
            { rank: '4', suit: 'spades' },
            { rank: '2', suit: 'clubs' },
            { rank: '7', suit: 'hearts' }
        ],
        potSize: 35,
        heroChipsInFront: 0,
        villainChipsInFront: 0,
        actionHistory: ['River: Villain checks'],
        villainAction: 'Check',
        amountToCall: 0,
        defaultRaiseAmount: 18, // ~50% pot
        correctAction: 'Raise',
        explanation_simple: 'Две пары — сильная рука. Ставь немного (полбанка), чтобы получить колл от Короля слабее.',
        explanation_deep: 'Это "тонкое вэлью". Чек — ошибка, ты теряешь деньги. Оппонент часто вскроет ставку в 50% банка с K9, KJ или даже QQ. Не бойся ставить!',
    },

    // 2.4 Folding to Strength
    {
        id: 'bar_flop_middlepair_fold',
        title: 'Respecting Big Bets',
        levelId: 'level-2',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'BTN',
        villainPosition: 'UTG', // Tight
        heroCards: [{ rank: '9', suit: 'diamonds' }, { rank: '9', suit: 'hearts' }],
        communityCards: [
            { rank: 'K', suit: 'spades' },
            { rank: 'J', suit: 'clubs' },
            { rank: '8', suit: 'hearts' }
        ],
        potSize: 15,
        heroChipsInFront: 0,
        villainChipsInFront: 12, // Big bet
        actionHistory: ['Flop: Villain bets big'],
        villainAction: 'Bet 12 BB',
        amountToCall: 12,
        defaultRaiseAmount: 0,
        correctAction: 'Fold',
        explanation_simple: 'Доска опасная (K, J). Тайтовый оппонент ставит много. Твои 99 здесь биты.',
        explanation_deep: 'Диапазон тайтового игрока из UTG — это AK, KQ, KJ, JJ+. Все эти руки бьют твои девятки. Крупная ставка подтверждает силу. Не будь "телефоном", фолд — единственное верное решение.',
    },

    // 2.5 Flush Draw Value
    {
        id: 'bar_turn_flushdraw_raise',
        title: 'Playing the Nut Flush',
        levelId: 'level-2',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'CO',
        villainPosition: 'BTN',
        heroCards: [{ rank: 'Q', suit: 'hearts' }, { rank: 'J', suit: 'hearts' }],
        communityCards: [
            { rank: 'A', suit: 'hearts' },
            { rank: '9', suit: 'hearts' },
            { rank: '4', suit: 'clubs' },
            { rank: '2', suit: 'hearts' }
        ],
        potSize: 22,
        heroChipsInFront: 0,
        villainChipsInFront: 8,
        actionHistory: ['Turn: 2h hits (Flush completes). Villain bets small'],
        villainAction: 'Bet 8 BB',
        amountToCall: 8,
        defaultRaiseAmount: 25,
        correctAction: 'Raise',
        explanation_simple: 'У тебя закрылся Флеш! Оппонент ставит мало. Рейзи, чтобы собрать больше денег.',
        explanation_deep: 'С натсовым (или почти натсовым) флешем слоуплей опасен — может выйти 4-я черва и убить экшен. Оппонент ставит, значит у него что-то есть (сет, две пары). Он заплатит твой рейз. Разгоняй банк!',
    },

    // =================================================================
    // LEVEL 3: UNDERGROUND CLUB (Discipline & Hero Folds)
    // =================================================================

    // 3.1 River Raise Fold (The Classic)
    {
        id: 'club_river_raise_fold_tptk',
        title: 'The Golden Rule: River Raises',
        levelId: 'level-3',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'BTN',
        villainPosition: 'BB',
        heroCards: [{ rank: 'A', suit: 'clubs' }, { rank: 'K', suit: 'diamonds' }], // TPTK
        communityCards: [
            { rank: 'A', suit: 'hearts' },
            { rank: 'J', suit: 'spades' },
            { rank: '8', suit: 'diamonds' },
            { rank: '4', suit: 'clubs' },
            { rank: '2', suit: 'hearts' }
        ],
        potSize: 40,
        heroChipsInFront: 25,    // Hero Bet
        villainChipsInFront: 80, // Villain Raise All-in (or big)
        actionHistory: ['Hero bets River, Villain raises'],
        villainAction: 'Raise to 80 BB',
        amountToCall: 55,
        defaultRaiseAmount: 0,
        correctAction: 'Fold',
        explanation_simple: 'ЗАПОМНИ: Рейз на ривере на низких лимитах — это ВСЕГДА натс. Топ-пара здесь мусор.',
        explanation_deep: 'Это главное правило эксплуатации (MDA). Популяция блефует рейзом ривера менее 1% случаев. Там всегда две пары (A8, A4, A2) или сет (88, 44, 22). Твой красивый AK сейчас проигрывает всему. Сделай "Hero Fold" и гордись собой.',
    },

    // 3.2 Turn Check-Raise Fold
    {
        id: 'club_turn_checkraise_fold_overpair',
        title: 'Respecting Turn Check-Raises',
        levelId: 'level-3',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'BTN',
        villainPosition: 'SB',
        heroCards: [{ rank: 'Q', suit: 'hearts' }, { rank: 'Q', suit: 'diamonds' }], // Overpair
        communityCards: [
            { rank: 'J', suit: 'spades' },
            { rank: 'T', suit: 'hearts' },
            { rank: '4', suit: 'clubs' },
            { rank: '8', suit: 'spades' } // Straight completes (97, Q9)
        ],
        potSize: 30,
        heroChipsInFront: 20,    // Hero Bet
        villainChipsInFront: 60, // Villain Check-Raises
        actionHistory: ['Turn: Hero bets, Villain check-raises'],
        villainAction: 'Raise to 60 BB',
        amountToCall: 40,
        defaultRaiseAmount: 0,
        correctAction: 'Fold',
        explanation_simple: 'Чек-рейз терна — это огромная сила. Доска опасная (стриты, две пары). Твои Дамы биты.',
        explanation_deep: 'Пассивные игроки (SB) не делают чек-рейз терна с одной парой. У него минимум две пары (JT, J8), сет (88, 44) или стрит (97). У тебя почти ноль шансов на победу. Фолди не думая.',
    },

    // 3.3 Triple Barrel Fold
    {
        id: 'club_river_triple_barrel_fold',
        title: 'Facing Three Barrels',
        levelId: 'level-3',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'BB',
        villainPosition: 'UTG',
        heroCards: [{ rank: 'K', suit: 'hearts' }, { rank: 'J', suit: 'hearts' }], // Top Pair
        communityCards: [
            { rank: 'K', suit: 'clubs' },
            { rank: '9', suit: 'spades' },
            { rank: '4', suit: 'diamonds' },
            { rank: '2', suit: 'clubs' },
            { rank: 'A', suit: 'diamonds' } // Ace on river!
        ],
        potSize: 80,
        heroChipsInFront: 0,
        villainChipsInFront: 60, // 3rd Barrel
        actionHistory: ['Villain bet Flop, Turn, and River'],
        villainAction: 'Bet 60 BB',
        amountToCall: 60,
        defaultRaiseAmount: 0,
        correctAction: 'Fold',
        explanation_simple: 'Он ставил три улицы. Вышел Туз. У тебя всего лишь вторая пара. Сдавайся.',
        explanation_deep: 'Три барреля (ставка на всех улицах) от UTG — это линия максимальной силы. Блефы обычно сдаются на терне или ривере. А выход Туза убивает твою пару Королей, так как он часто ставил с Ax. Тут нечего ловить.',
    },

    // 3.4 Folding Set on Wet Board
    {
        id: 'club_river_allin_fold_topset',
        title: 'Folding Top Set',
        levelId: 'level-3',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'MP',
        villainPosition: 'BTN',
        heroCards: [{ rank: 'Q', suit: 'spades' }, { rank: 'Q', suit: 'clubs' }],
        communityCards: [
            { rank: 'Q', suit: 'hearts' },
            { rank: 'J', suit: 'diamonds' },
            { rank: 'T', suit: 'clubs' },
            { rank: 'K', suit: 'spades' },
            { rank: '9', suit: 'hearts' }
        ],
        potSize: 50,
        heroChipsInFront: 0,
        villainChipsInFront: 100, // Shove
        actionHistory: ['River: 4-straight completes. Villain shoves'],
        villainAction: 'All-in 100 BB',
        amountToCall: 100,
        defaultRaiseAmount: 0,
        correctAction: 'Fold',
        explanation_simple: 'На доске 4 карты к стриту. Оппонент идет ва-банк. Твой сет здесь ничего не стоит.',
        explanation_deep: 'На доске 9-T-J-Q любой Король или 8-ка имеют стрит. Олл-ин на такой страшной доске никогда не бывает блефом. Люди боятся таких досок. Если он пихает, у него стрит (Kx). Выкидывай топ-сет.',
    },

    // 3.5 Folding Flush to Overbet
    {
        id: 'club_river_overbet_fold_flush',
        title: 'Folding Flush to Overbet',
        levelId: 'level-3',
        blinds: { sb: 0.5, bb: 1 },
        heroPosition: 'SB',
        villainPosition: 'BB',
        heroCards: [{ rank: '9', suit: 'hearts' }, { rank: '8', suit: 'hearts' }], // Low Flush
        communityCards: [
            { rank: 'A', suit: 'hearts' },
            { rank: '7', suit: 'hearts' },
            { rank: '2', suit: 'clubs' },
            { rank: '4', suit: 'hearts' }, // 4th heart!
            { rank: 'Q', suit: 'hearts' }  // 5th heart?? No, let's say 3 flush board.
        ],
        potSize: 40,
        heroChipsInFront: 0,
        villainChipsInFront: 60, // 150% pot overbet
        actionHistory: ['River: Villain overbets huge'],
        villainAction: 'Bet 60 BB',
        amountToCall: 60,
        defaultRaiseAmount: 0,
        correctAction: 'Fold',
        explanation_simple: 'Овербет (ставка больше банка) на ривере — признак натса. У тебя слабый флеш, а там часто Натс-флеш (Kh).',
        explanation_deep: 'Овербеты на микролимитах поляризованы: либо воздух, либо натс. Но когда лежит флеш, в блеф так не играют. Он хочет добрать максимум с твоего мелкого флеша. У него здесь Kh или Ah (если он не на столе). Сэкономь стек.',
    },

    // =================================================================
    // BOSS LEVEL: UNCLE TED (The Calling Station)
    // =================================================================
    ...LEVEL_1_TED_SCENARIOS
];

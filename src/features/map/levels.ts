import type { BossId } from '../game/boss-profiles';

export type LevelStatus = 'locked' | 'active' | 'completed';

export interface Level {
    id: string;
    title: string;
    subtitle: string;
    status: LevelStatus;
    scenarioIds: string[]; // Renamed from scenarios to match App.tsx usage
    icon: string;
    xpReward: number;
    bossId?: BossId; // For boss battle levels
}

export const levels: Level[] = [
    {
        id: 'level-1',
        title: 'The Kitchen',
        subtitle: 'Preflop Fundamentals',
        status: 'active',
        scenarioIds: [
            'kitchen_aks_utg',
            'kitchen_kjo_utg',
            'kitchen_22_btn',
            'kitchen_ajo_mp',
            'kitchen_qq_utg'
        ],
        icon: '🏠',
        xpReward: 100
    },
    {
        id: 'boss-ted',
        title: 'Boss Fight: Uncle Ted',
        subtitle: 'Defeat the Calling Station',
        status: 'locked',
        scenarioIds: ['kitchen_aks_utg', 'kitchen_22_btn', 'kitchen_kjo_utg'],
        icon: '🍺',
        xpReward: 500,
        bossId: 'ted_station'
    },
    {
        id: 'level-2',
        title: 'Local Bar',
        subtitle: 'Postflop Value Betting',
        status: 'locked',
        scenarioIds: [
            'bar_flop_tptk_value',
            'bar_turn_overpair_call',
            'bar_river_twopair_value',
            'bar_flop_middlepair_fold',
            'bar_turn_flushdraw_raise'
        ],
        icon: '🍺',
        xpReward: 200
    },
    {
        id: 'level-3',
        title: 'Underground Club',
        subtitle: 'Discipline & Hero Folds',
        status: 'locked',
        scenarioIds: [
            'club_river_raise_fold_tptk',
            'club_turn_checkraise_fold_overpair',
            'club_river_triple_barrel_fold',
            'club_river_allin_fold_topset',
            'club_river_overbet_fold_flush'
        ],
        icon: '💎',
        xpReward: 300
    }
];

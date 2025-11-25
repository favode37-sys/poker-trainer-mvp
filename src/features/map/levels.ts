export type LevelStatus = 'locked' | 'active' | 'completed';

export interface Level {
    id: string;
    title: string;
    subtitle: string;
    status: LevelStatus;
    scenarios: string[]; // Array of scenario IDs
    icon: string;
    xpReward: number;
}

export const MOCK_LEVELS: Level[] = [
    {
        id: 'level-1',
        title: 'The Kitchen',
        subtitle: 'Master Starting Hands',
        status: 'active',
        scenarios: [
            'mda_rule4_preflop_3bet'
        ],
        icon: '🏠',
        xpReward: 100
    },
    {
        id: 'level-2',
        title: 'Local Bar',
        subtitle: 'Postflop Value Betting',
        status: 'locked',
        scenarios: [
            'mda_rule1_turn_xr',
            'mda_rule3_give_up_river',
            'mda_bonus_value_bet'
        ],
        icon: '🍺',
        xpReward: 200
    },
    {
        id: 'level-3',
        title: 'Underground Club',
        subtitle: 'Discipline & Hero Folds',
        status: 'locked',
        scenarios: [
            'mda_rule2_triple_barrel'
        ],
        icon: '💎',
        xpReward: 300
    }
];

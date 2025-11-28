
export type BossId = 'ted_station';

export interface BossProfile {
    id: BossId;
    name: string;
    title: string;
    avatar: string; // Emoji
    style: 'passive' | 'aggressive';
    colorTheme: string; // Tailwind classes for the table background/border
    phrases: {
        greeting: string;
        win: string[];
        lose: string[];
        fold: string[];
    };
}

export const BOSSES: Record<BossId, BossProfile> = {
    'ted_station': {
        id: 'ted_station',
        name: 'Uncle Ted',
        title: 'The Calling Station',
        avatar: '🍺',
        style: 'passive',
        // Amber/Beer theme
        colorTheme: 'from-amber-200 to-orange-100 border-amber-400',
        phrases: {
            greeting: "Hey kiddo! Any two cards can win, right? 🍻",
            win: ["Haha! Pot odds? I just felt lucky!", "Read 'em and weep!", "Beginner's luck!"],
            lose: ["Oof... nice hand.", "You got lucky this time!", "I'll get it back."],
            fold: ["Boring! I wanted to see the river!", "Why fold? It was only a few bucks!"]
        }
    }
};


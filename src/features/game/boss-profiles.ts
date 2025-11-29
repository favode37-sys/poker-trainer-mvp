export type BossId = 'ted_station';

export interface BossProfile {
    id: BossId;
    name: string;
    title: string;
    avatar: string;
    style: 'passive' | 'aggressive';
    colorTheme: string;
    phrases: {
        greeting: string;
        win: string[];
        lose: string[];
        fold: string[];
    };
    // NEW FIELDS
    description: string; // Lore/Personality
    strategy: {
        weakness: string; // The main leak
        tips: string[];   // 3 bullet points of advice
    };
}

export const BOSSES: Record<BossId, BossProfile> = {
    'ted_station': {
        id: 'ted_station',
        name: 'Uncle Ted',
        title: 'The Calling Station',
        avatar: '🍺',
        style: 'passive',
        colorTheme: 'from-amber-200 to-orange-100 border-amber-400',
        phrases: {
            greeting: "Hey kiddo! Any two cards can win, right? 🍻",
            win: ["Haha! Pot odds? I just felt lucky!", "Read 'em and weep!", "Beginner's luck!"],
            lose: ["Oof... nice hand.", "You got lucky this time!", "I'll get it back."],
            fold: ["Boring! I wanted to see the river!", "Why fold? It was only a few bucks!"]
        },
        description: "Uncle Ted plays poker for fun. He hates folding and loves to 'see a flop'. He thinks you are trying to bluff him every time.",
        strategy: {
            weakness: "Curiosity & Over-calling",
            tips: [
                "🚫 NEVER BLUFF: He will call you down with bottom pair.",
                "💰 BET BIG: When you have a hand, bet pot. He will pay.",
                "🛡️ FOLD TO AGGRESSION: If he raises, run away. He has the nuts."
            ]
        }
    }
};

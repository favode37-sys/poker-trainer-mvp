import { type BossProfile } from '@/features/game/boss-profiles';
import { type Action } from '@/lib/types';

export interface GameContext {
    potSize: number;
    // In the future we can add street, equity, etc.
}

export const bossLogic = {
    /**
     * Generates boss reaction to player action
     */
    getReaction: (boss: BossProfile, playerAction: Action, context: GameContext): string => {
        const rng = Math.random();

        // 1. Chance to stay silent (60%) to avoid spamming
        // Exception: "Calling Station" bosses like to talk when player folds
        const talkChance = boss.style === 'passive' ? 0.5 : 0.4;
        if (rng > talkChance) return "";

        // 2. Reaction to Player FOLD (Boss Wins)
        if (playerAction === 'Fold') {
            // Pick random phrase from profile
            if (boss.phrases.fold && boss.phrases.fold.length > 0) {
                return boss.phrases.fold[Math.floor(Math.random() * boss.phrases.fold.length)];
            }
            return "Ha! Easy money!"; // Fallback
        }

        // 3. Reaction to Player AGGRESSION (Raise)
        if (playerAction === 'Raise') {
            if (boss.style === 'passive') {
                return "Oh my, why so much?..."; // Scared "Calling Station"
            }
            if (boss.style === 'aggressive') {
                return "Think you can scare me? Let's see!"; // "Maniac" Challenge
            }
        }

        // 4. Reaction to BIG POT (> 30bb)
        if (context.potSize > 30) {
            return "Stakes are getting high! 😅";
        }

        return "";
    },

    /**
     * Style Validator (useful for Scenario Builder in future)
     * Checks if action fits the boss's character
     */
    validateStyle: (boss: BossProfile, action: Action): boolean => {
        // Passive boss rarely Raises
        if (boss.style === 'passive' && action === 'Raise') {
            return false; // Warning: OOC (Out Of Character)
        }
        return true;
    }
};

import type { Scenario } from './types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export const scenarioValidator = {
    validate: (s: Scenario): ValidationResult => {
        const errors: string[] = [];

        // 1. Check Street vs Community Cards
        if (s.street === 'preflop' && s.communityCards.length !== 0) {
            errors.push(`Street is Preflop but has ${s.communityCards.length} cards`);
        }
        if (s.street === 'flop' && s.communityCards.length !== 3) {
            errors.push(`Street is Flop but has ${s.communityCards.length} cards`);
        }
        if (s.street === 'turn' && s.communityCards.length !== 4) {
            errors.push(`Street is Turn but has ${s.communityCards.length} cards`);
        }
        if (s.street === 'river' && s.communityCards.length !== 5) {
            errors.push(`Street is River but has ${s.communityCards.length} cards`);
        }

        // 2. Check Cards Integrity
        if (!s.heroCards || s.heroCards.length !== 2) {
            errors.push('Hero must have exactly 2 cards');
        }

        // 3. Check Pot Logic
        if (s.potSize <= 0) {
            errors.push('Pot size must be positive');
        }

        // 4. Check IDs
        if (!s.id) {
            errors.push('Missing ID');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

/**
 * Action Engine - Universal action timeline generator for poker scenarios
 * Handles action order on all streets and generates timeline for animations
 */

// --- TYPES ---

export type TimelineEventType = 'fold' | 'villain_action' | 'hero_turn' | 'deal_cards' | 'post_blind';

export interface TimelineEvent {
    type: TimelineEventType;
    position: string;
    action?: string;
    amount?: number;
    delay: number;
}

export interface ActionEngineConfig {
    heroPosition: string;
    villainPositions: string[];
    villainActions: Record<string, { action: string; amount?: number }>;
    street: 'preflop' | 'flop' | 'turn' | 'river';
    blinds?: { sb: number; bb: number };
}

// --- CONSTANTS ---

/** Preflop action order: UTG acts first, BB acts last */
const PREFLOP_ORDER = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

/** Postflop action order: SB acts first, BTN acts last */
const POSTFLOP_ORDER = ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'];

// --- HELPER FUNCTIONS ---

/**
 * Get action order for a given street
 */
function getActionOrder(street: 'preflop' | 'flop' | 'turn' | 'river'): string[] {
    return street === 'preflop' ? PREFLOP_ORDER : POSTFLOP_ORDER;
}

/**
 * Get positions that should be marked as folded at a given point in the action
 * @param heroPosition - Hero's position
 * @param villainPositions - Active villain positions
 * @param currentActorPosition - Position that is currently acting
 * @param street - Current street
 * @returns Set of positions that should be folded
 */
export function getFoldedPositions(
    heroPosition: string,
    villainPositions: string[],
    currentActorPosition: string,
    street: 'preflop' | 'flop' | 'turn' | 'river'
): Set<string> {
    const order = getActionOrder(street);
    const currentIndex = order.indexOf(currentActorPosition);
    const folded = new Set<string>();

    // All positions before current actor (excluding hero and villains) are folded
    for (let i = 0; i < currentIndex; i++) {
        const pos = order[i];
        if (pos !== heroPosition && !villainPositions.includes(pos)) {
            folded.add(pos);
        }
    }

    return folded;
}

/**
 * Generate complete action timeline for a scenario
 * Timeline includes all fold animations and villain actions up to Hero's turn
 */
export function generateActionTimeline(config: ActionEngineConfig): TimelineEvent[] {
    const { heroPosition, villainPositions, villainActions, street } = config;
    const order = getActionOrder(street);
    const timeline: TimelineEvent[] = [];

    let currentDelay = 0;
    const FOLD_DELAY = 200;
    const ACTION_DELAY = 400;
    const HERO_DELAY = 200;

    // Process each position in order until we reach Hero
    for (let i = 0; i < order.length; i++) {
        const position = order[i];

        if (position === heroPosition) {
            // Hero's turn - stop timeline, wait for input
            timeline.push({
                type: 'hero_turn',
                position,
                delay: currentDelay + HERO_DELAY
            });
            break; // Stop generating timeline, Hero needs to act
        }

        if (villainPositions.includes(position)) {
            // Villain acts
            const villainAction = villainActions[position] || { action: 'Check' };
            timeline.push({
                type: 'villain_action',
                position,
                action: villainAction.action,
                amount: villainAction.amount,
                delay: currentDelay
            });
            currentDelay += ACTION_DELAY;
        } else {
            // Filler folds
            timeline.push({
                type: 'fold',
                position,
                delay: currentDelay
            });
            currentDelay += FOLD_DELAY;
        }
    }

    return timeline;
}

/**
 * Generate timeline for what happens AFTER Hero acts
 * Used for multi-decision scenarios
 */
export function generatePostHeroTimeline(config: ActionEngineConfig): TimelineEvent[] {
    const { heroPosition, villainPositions, villainActions, street } = config;
    const order = getActionOrder(street);
    const timeline: TimelineEvent[] = [];

    let currentDelay = 0;
    const FOLD_DELAY = 200;
    const ACTION_DELAY = 400;

    const heroIndex = order.indexOf(heroPosition);

    // Process positions after Hero until we loop back to Hero or reach a villain
    for (let i = heroIndex + 1; i < order.length; i++) {
        const position = order[i];

        if (villainPositions.includes(position)) {
            // Villain responds
            const villainAction = villainActions[position] || { action: 'Check' };
            timeline.push({
                type: 'villain_action',
                position,
                action: villainAction.action,
                amount: villainAction.amount,
                delay: currentDelay
            });
            currentDelay += ACTION_DELAY;
        } else {
            // Remaining fillers fold
            timeline.push({
                type: 'fold',
                position,
                delay: currentDelay
            });
            currentDelay += FOLD_DELAY;
        }
    }

    return timeline;
}

/**
 * Get all positions that should be folded after full action completes
 * (Everyone except Hero and Villains)
 */
export function getAllFoldedPositions(
    heroPosition: string,
    villainPositions: string[]
): Set<string> {
    const allPositions = [...PREFLOP_ORDER];
    const folded = new Set<string>();

    for (const pos of allPositions) {
        if (pos !== heroPosition && !villainPositions.includes(pos)) {
            folded.add(pos);
        }
    }

    return folded;
}

/**
 * Calculate which positions should show as folded at current animation stage
 */
export function getAnimatedFoldState(
    timeline: TimelineEvent[],
    elapsedTime: number
): Set<string> {
    const folded = new Set<string>();

    for (const event of timeline) {
        if (event.delay <= elapsedTime && event.type === 'fold') {
            folded.add(event.position);
        }
    }

    return folded;
}

// --- EXPORTS for constants ---
export { PREFLOP_ORDER, POSTFLOP_ORDER };

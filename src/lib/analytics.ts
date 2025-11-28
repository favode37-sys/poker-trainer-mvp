import posthog from 'posthog-js';

const API_KEY = import.meta.env.VITE_POSTHOG_KEY;

export const analytics = {
    init: () => {
        if (API_KEY) {
            posthog.init(API_KEY, {
                api_host: 'https://app.posthog.com',
                autocapture: false, // Disable auto-clicks to keep data clean
                capture_pageview: false // We track screens manually
            });
        } else {
            console.log('📊 Analytics initialized (Console Mode)');
        }
    },

    identify: (userId: string) => {
        if (API_KEY) posthog.identify(userId);
        else console.log('👤 Identify:', userId);
    },

    // Generic track
    track: (event: string, props?: Record<string, any>) => {
        if (API_KEY) posthog.capture(event, props);
        else console.log(`📡 Track [${event}]:`, props);
    },

    // --- Specific Events (Type-safe) ---

    screenView: (screen: string) => {
        analytics.track('$pageview', { screen });
    },

    // Game Mode
    levelStart: (levelId: string) => {
        analytics.track('level_start', { level_id: levelId });
    },

    levelComplete: (levelId: string, xp: number, duration?: number) => {
        analytics.track('level_complete', { level_id: levelId, xp_earned: xp, duration_seconds: duration });
    },

    scenarioResult: (scenarioId: string, isCorrect: boolean, action: string) => {
        analytics.track('scenario_result', {
            scenario_id: scenarioId,
            is_correct: isCorrect,
            user_action: action
        });
    },

    // Blitz Mode
    blitzStart: () => {
        analytics.track('blitz_start');
    },

    blitzEnd: (score: number, maxStreak: number, reason: 'time_up' | 'quit') => {
        analytics.track('blitz_end', { score, max_streak: maxStreak, end_reason: reason });
    },

    // Education
    coachOpened: (scenarioId: string, context: string) => {
        analytics.track('coach_opened', { scenario_id: scenarioId, context });
    },

    // Builder
    scenarioCreated: (type: 'manual' | 'ai', street: string) => {
        analytics.track('builder_scenario_saved', { creation_type: type, street });
    }
};

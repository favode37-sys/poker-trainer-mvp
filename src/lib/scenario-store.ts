import { type Scenario } from './types';

const STORAGE_KEY_DYNAMIC_SCENARIOS = 'poker-trainer-dynamic-scenarios';

export const scenarioStore = {
    getAll: (): Scenario[] => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_DYNAMIC_SCENARIOS);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load dynamic scenarios', e);
            return [];
        }
    },

    addBatch: (newScenarios: Scenario[]) => {
        const current = scenarioStore.getAll();
        // Avoid duplicates by ID
        const uniqueNew = newScenarios.filter(n => !current.some(c => c.id === n.id));
        const updated = [...current, ...uniqueNew];
        localStorage.setItem(STORAGE_KEY_DYNAMIC_SCENARIOS, JSON.stringify(updated));
        console.log(`[Store] Added ${uniqueNew.length} new scenarios. Total: ${updated.length}`);
    },

    clear: () => {
        localStorage.removeItem(STORAGE_KEY_DYNAMIC_SCENARIOS);
    },

    getCount: () => {
        return scenarioStore.getAll().length;
    },

    overrideAll: (scenarios: Scenario[]) => {
        localStorage.setItem(STORAGE_KEY_DYNAMIC_SCENARIOS, JSON.stringify(scenarios));
        console.log(`[Store] Overridden database with ${scenarios.length} scenarios.`);
    }
};


export interface Chart {
    id: string;
    title: string;
    mode: 'cash' | 'mtt' | 'spin';
    position: string;
    stackDepth: number; // bb
    situation: string; // e.g. "Open Raise", "vs 3bet"
    range: string[]; // ["AA", "AKs", ...]
}

const STORAGE_KEY = 'poker-trainer-charts';

export const chartStore = {
    getAll: (): Chart[] => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch { return []; }
    },

    save: (chart: Chart) => {
        const charts = chartStore.getAll();
        const existingIdx = charts.findIndex(c => c.id === chart.id);
        if (existingIdx >= 0) charts[existingIdx] = chart;
        else charts.push(chart);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
    },

    delete: (id: string) => {
        const charts = chartStore.getAll().filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
    }
};



export interface LeaderboardEntry {
    id: string;
    name: string;
    score: number;
    streak: number;
    isPlayer: boolean;
    date: string;
}

const STORAGE_KEY = 'poker-trainer-blitz-best';

// Mock data to simulate a live community
const MOCK_PLAYERS: LeaderboardEntry[] = [
    { id: 'bot-1', name: 'GTO_Wizard', score: 42, streak: 15, isPlayer: false, date: new Date().toISOString() },
    { id: 'bot-2', name: 'Maniac Mike', score: 35, streak: 8, isPlayer: false, date: new Date().toISOString() },
    { id: 'bot-3', name: 'Nit Nancy', score: 28, streak: 12, isPlayer: false, date: new Date().toISOString() },
    { id: 'bot-4', name: 'Calling Ted', score: 15, streak: 2, isPlayer: false, date: new Date().toISOString() },
    { id: 'bot-5', name: 'Fish_2024', score: 8, streak: 0, isPlayer: false, date: new Date().toISOString() },
];

export const leaderboardService = {
    // Save player's score if it's a personal best (or just add to history)
    saveScore: (score: number, streak: number) => {
        const entry: LeaderboardEntry = {
            id: 'player-1', // Fixed ID for the user in MVP
            name: 'YOU',
            score,
            streak,
            isPlayer: true,
            date: new Date().toISOString()
        };

        // We only save the "Personal Best" to local storage to compare later
        const currentBest = leaderboardService.getPersonalBest();
        if (score > (currentBest?.score || 0)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
        }

        return entry;
    },

    getPersonalBest: (): LeaderboardEntry | null => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    },

    // Generate a combined leaderboard for the Game Over screen
    getLeaderboard: (currentRun?: LeaderboardEntry): LeaderboardEntry[] => {
        let allEntries = [...MOCK_PLAYERS];

        // Add Personal Best from storage
        const best = leaderboardService.getPersonalBest();
        if (best) {
            // Check if current run is better than saved best, if so, use current run as "YOU"
            if (currentRun && currentRun.score >= best.score) {
                // Current run is the new best, already passed in
            } else {
                allEntries.push(best);
            }
        }

        // Add Current Run (if provided)
        if (currentRun) {
            // Remove "Personal Best" entry if it exists to avoid duplicates of "YOU" 
            // (Simulate that "YOU" are climbing the ladder right now)
            allEntries = allEntries.filter(e => !e.isPlayer);
            allEntries.push(currentRun);
        } else if (!best) {
            // If no current run and no saved best, add a placeholder
            allEntries.push({ id: 'player-1', name: 'YOU', score: 0, streak: 0, isPlayer: true, date: new Date().toISOString() });
        }

        // Sort by Score DESC
        return allEntries.sort((a, b) => b.score - a.score).slice(0, 10);
    }
};


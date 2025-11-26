import { useState, useEffect } from 'react';
import { usePlayerState } from './usePlayerState';

export interface Quest {
    id: string;
    title: string;
    target: number;
    progress: number;
    reward: number;
    isCompleted: boolean;
    type: 'play_hands' | 'win_hands' | 'correct_folds' | 'blitz_score';
}

const QUEST_TEMPLATES: Omit<Quest, 'progress' | 'isCompleted'>[] = [
    { id: 'q1', title: 'Play 5 Hands', target: 5, reward: 50, type: 'play_hands' },
    { id: 'q2', title: 'Win 3 Hands', target: 3, reward: 100, type: 'win_hands' },
    { id: 'q3', title: 'Make 3 Correct Folds', target: 3, reward: 75, type: 'correct_folds' },
    { id: 'q4', title: 'Score 5 in Blitz', target: 5, reward: 150, type: 'blitz_score' },
];

const STORAGE_KEY_QUESTS = 'poker-trainer-quests';
const STORAGE_KEY_QUEST_DATE = 'poker-trainer-quest-date';

export function useQuests() {
    const { updateBankroll } = usePlayerState();
    const [quests, setQuests] = useState<Quest[]>([]);

    // Initialize or Reset Quests daily
    useEffect(() => {
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem(STORAGE_KEY_QUEST_DATE);
        const savedQuests = localStorage.getItem(STORAGE_KEY_QUESTS);

        if (lastDate !== today || !savedQuests) {
            // New day -> Generate 3 random quests
            const newQuests = QUEST_TEMPLATES
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(q => ({ ...q, progress: 0, isCompleted: false }));

            setQuests(newQuests);
            localStorage.setItem(STORAGE_KEY_QUEST_DATE, today);
            localStorage.setItem(STORAGE_KEY_QUESTS, JSON.stringify(newQuests));
        } else {
            // Load existing
            setQuests(JSON.parse(savedQuests));
        }
    }, []);

    // Save on change
    useEffect(() => {
        if (quests.length > 0) {
            localStorage.setItem(STORAGE_KEY_QUESTS, JSON.stringify(quests));
        }
    }, [quests]);

    const updateQuestProgress = (type: Quest['type'], amount: number = 1) => {
        setQuests(prev => prev.map(q => {
            if (q.isCompleted || q.type !== type) return q;

            const newProgress = Math.min(q.progress + amount, q.target);
            const isJustCompleted = newProgress >= q.target && !q.isCompleted;

            if (isJustCompleted) {
                // Auto-claim reward (simple version)
                // Ideally user clicks "Claim", but for MVP auto is fine
                updateBankroll(q.reward);
                // We could trigger a toast here
            }

            return {
                ...q,
                progress: newProgress,
                isCompleted: newProgress >= q.target
            };
        }));
    };

    return { quests, updateQuestProgress };
}

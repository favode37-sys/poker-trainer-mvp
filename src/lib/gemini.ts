import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Scenario } from "./types";
import { POKER_ENGINE_SYS_PROMPT } from "./poker-prompt";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiService = {
    async getCoachAdvice(scenario: Scenario, userAction: string, isCorrect: boolean): Promise<string> {
        if (!API_KEY) {
            return "⚠️ AI Brain Missing: Please add VITE_GEMINI_API_KEY to .env to unlock my full potential!";
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const board = scenario.communityCards.length > 0
            ? scenario.communityCards.map(c => `${c.rank}${c.suit.charAt(0)}`).join(' ')
            : 'Preflop';

        const heroHand = scenario.heroCards.map(c => `${c.rank}${c.suit.charAt(0)}`).join(' ');

        // SYSTEM PROMPT BASED ON STRATEGY DOCS (BlackRain79 / Exploitative)
        const prompt = `
        ROLE: You are an expert Poker Coach for MICRO-STAKES players.
        PHILOSOPHY: Exploitative Strategy (MDA). We DO NOT play GTO. We exploit leaks.
        
        CORE RULES:
        1. "Tight is Right": Play strong hands fast. Fold trash.
        2. "No Bluffing Calling Stations": If they don't fold, we don't bluff.
        3. "River Raise = Nuts": At low stakes, a river raise is always a monster. Fold Top Pair.
        4. "Bet for Value": People call too much. Bet big with good hands.

        SCENARIO CONTEXT:
        - Hero Hand: ${heroHand} (${scenario.heroPosition})
        - Villain: ${scenario.villainPosition} (Action: ${scenario.villainAction})
        - Board: ${board}
        - Pot: ${scenario.potSize} BB
        - Correct Move: ${scenario.correctAction}
        
        PLAYER ACTION: ${userAction} (${isCorrect ? 'CORRECT' : 'MISTAKE'})

        TASK:
        Explain WHY the correct move is best using simple language and metaphors (e.g. "don't pay off the nit", "value town").
        If the player made a mistake, explain the specific leak.
        Validating the "Hero Fold": If the player Folded correctly, praise their discipline highly!
        
        TONE: Encouraging, witty, concise (max 3 sentences). Use emojis.
        `;

        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Gemini Error:", error);
            return "Strategy engine offline. Remember: Tight is Right! (Check your API Key)";
        }
    },

    async analyzePlayerHand(
        heroHand: string,
        board: string,
        heroPosition: string,
        actionDescription: string
    ): Promise<string> {
        if (!API_KEY) return "I need my API Key to analyze your hand!";

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        ROLE: Elite Poker Coach analyzing a student's played hand.
        PHILOSOPHY: Exploitative (MDA). Focus on profit, not GTO purity.
        
        INPUT DATA:
        - Hero Position: ${heroPosition}
        - Hero Cards: ${heroHand}
        - Board Cards: ${board || "No board (Preflop)"}
        - Action History: ${actionDescription}

        TASK:
        1. Rate the play from 1 to 10.
        2. Identify the BIGGEST mistake (if any).
        3. What would a Pro do differently?
        
        OUTPUT FORMAT (Markdown):
        ## 🎯 Score: [X]/10
        **Verdict:** [Brief summary]
        
        **Analysis:**
        [2-3 sentences on strategy]
        
        **Pro Tip:** [One specific takeaway]
        `;

        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error(error);
            return "Analysis failed. Please try again.";
        }
    },

    async generateBlitzScenarios(count: number, street?: 'preflop' | 'flop' | 'turn' | 'river'): Promise<any[]> {
        if (!API_KEY) throw new Error("API Key missing");

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const taskPrompt = `
           ЗАДАЧА ПОЛЬЗОВАТЕЛЯ:
           Сгенерируй ${count} раздач.
           Ограничение: ${street ? "Все раздачи должны доходить строго до улицы '" + street + "'" : "Сбалансированный микс улиц"}.
           
           ТРЕБУЕМАЯ JSON СХЕМА (массив объектов Scenario):
           [
             {
               "id": "уникальный_id",
               "title": "Название сценария",
               "levelId": "blitz",
               "street": "preflop" | "flop" | "turn" | "river",
               "blinds": { "sb": 0.5, "bb": 1 },
               "heroPosition": "BTN", 
               "villainPosition": "BB",
               "heroCards": [{ "rank": "A", "suit": "hearts" }, ...],
               "communityCards": [], // 0, 3, 4 или 5 карт в зависимости от street
               "potSize": number, // Точная сумма
               "heroChipsInFront": number,
               "villainChipsInFront": number, // Если villainAction="Raise 10", то здесь 10
               "actionHistory": ["Hero raises 2", "Villain calls"],
               "villainAction": "Check" | "Bet X" | "Raise to X",
               "correctAction": "Fold" | "Call" | "Raise",
               "explanation_simple": "Короткое объяснение (RU)",
               "explanation_deep": "Подробное объяснение стратегии (RU)"
             }
           ]
         `;

        const prompt = POKER_ENGINE_SYS_PROMPT + "\n\n" + taskPrompt;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return JSON.parse(text);
        } catch (error) {
            console.error("Gemini Error:", error);
            throw error;
        }
    },

    async repairScenario(brokenJson: any, errors: string[]): Promise<any> {
        if (!API_KEY) throw new Error("API Key missing");

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const prompt = `The following Poker Scenario JSON has logical errors. FIX IT.
            
Errors found:
${errors.join('\n')}

Broken JSON:
${JSON.stringify(brokenJson)}

Requirements:
1. Fix the inconsistencies (e.g., if street is flop, ensure 3 community cards).
2. Return ONLY the corrected JSON object.
3. Ensure it matches the Scenario interface strictly.
4. Maintain the original ID.`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return JSON.parse(text);
        } catch (error) {
            console.error("Repair Error:", error);
            throw error;
        }
    }
};

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Scenario } from "./types";

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

    async generateBlitzScenarios(count: number): Promise<any[]> {
        if (!API_KEY) throw new Error("API Key missing");

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const prompt = `Generate ${count} poker scenarios for "Blitz Mode" training. Output as JSON array with this exact structure:
[{
  "id": "blitz_unique123",
  "title": "Scenario Title",
  "levelId": "blitz",
  "street": "preflop",
  "blinds": {"sb": 0.5, "bb": 1},
  "heroPosition": "BTN",
  "villainPosition": "BB",
  "heroCards": [{"rank": "A", "suit": "hearts"}, {"rank": "K", "suit": "hearts"}],
  "communityCards": [],
  "potSize": 1.5,
  "heroChipsInFront": 0,
  "villainChipsInFront": 0,
  "actionHistory": ["Villain posts BB"],
  "villainAction": "Post BB",
  "amountToCall": 1,
  "defaultRaiseAmount": 3,
  "correctAction": "Raise",
  "explanation_simple": "Short explanation",
  "explanation_deep": "Detailed coaching advice"
}]

Rules:
- Generate a balanced mix of Preflop, Flop, Turn, and River decisions.
- "street" must be "preflop", "flop", "turn", or "river".
- Ensure "street" matches communityCards count (0=preflop, 3=flop, 4=turn, 5=river).
- Vary positions, hand types, and scenarios.
- correctAction must be "Fold", "Call", or "Raise".
- suits must be "hearts", "diamonds", "clubs", or "spades".
- ranks: A, K, Q, J, T, 9, 8, 7, 6, 5, 4, 3, 2.
- Focus on exploitative micro-stakes strategy.`;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return JSON.parse(text);
        } catch (error) {
            console.error("Gemini Error:", error);
            throw error;
        }
    }
};

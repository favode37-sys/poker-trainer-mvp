import { useState } from 'react';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { CardMatrix } from '@/components/ui/CardMatrix';
import { type Card, type Scenario, type Action, type Villain } from '@/lib/types';
import { createDeck, drawCards } from '@/lib/poker-engine';
import { scenarioStore } from '@/lib/scenario-store';
import { cn } from '@/lib/utils';
import { ArrowRight, Save } from 'lucide-react';

interface ScenarioBuilderProps {
    onBack: () => void;
}

type CardSlot = { target: 'hero' | 'board' | 'villain', index: number, villainIndex?: number };

export function ScenarioBuilder({ onBack }: ScenarioBuilderProps) {
    // --- GLOBAL HAND STATE ---
    const [stages, setStages] = useState<Scenario[]>([]);

    // --- CURRENT STAGE STATE ---
    // Hero
    const [heroCards, setHeroCards] = useState<Card[]>([]);
    const [heroPos, setHeroPos] = useState('BTN');
    const [heroStack] = useState(100);
    const [heroStartChips, setHeroStartChips] = useState(0);

    // Villain
    const [villains, setVillains] = useState<Villain[]>([
        { id: 'v1', position: 'BB', stack: 100, chipsInFront: 0, action: 'Check', cards: [] }
    ]);

    // Board & Pot
    const [boardCards, setBoardCards] = useState<Card[]>([]);
    const [potSize, setPotSize] = useState(0);
    const [street, setStreet] = useState<'preflop' | 'flop' | 'turn' | 'river'>('preflop');
    // actionHistory reserved for future use

    // Solution
    const [correctAction, setCorrectAction] = useState<Action>('Fold');
    const [targetRaiseAmount, setTargetRaiseAmount] = useState(0);
    const [explanation, setExplanation] = useState('');

    // UI
    const [activeSlot, setActiveSlot] = useState<CardSlot | null>(null);
    const [statusMsg, setStatusMsg] = useState('');

    // --- HELPERS ---

    const getNextStreetName = (s: string) => s === 'preflop' ? 'flop' : s === 'flop' ? 'turn' : s === 'turn' ? 'river' : 'river';

    const handleRandomize = (target: 'hero' | 'board' | 'villain', _villainIndex?: number) => {
        let used: Card[] = [...heroCards, ...boardCards];
        stages.forEach(s => used.push(...s.communityCards, ...s.heroCards)); // Avoid repeats from prev stages
        villains.forEach(v => used.push(...v.cards));

        const deck = createDeck();
        // Remove used cards from deck is implied by drawCards logic if implemented, 
        // but here we rely on basic random. For MVP fine.

        if (target === 'hero') {
            const { drawn } = drawCards(deck, 2, used);
            setHeroCards(drawn);
        } else if (target === 'board') {
            // Calculate needed cards based on street
            // Note: In builder, we usually store ALL board cards in state.
            // If moving Preflop -> Flop, we need 3 cards.
            // If Flop -> Turn, we need +1 card.
            // Let's simplify: Randomize fills the board up to the current street requirement.
            const totalNeeded = street === 'preflop' ? 0 : street === 'flop' ? 3 : street === 'turn' ? 4 : 5;
            const currentBoard = [...boardCards];
            const needed = totalNeeded - currentBoard.length;

            if (needed > 0) {
                const { drawn } = drawCards(deck, needed, [...used, ...currentBoard]);
                setBoardCards([...currentBoard, ...drawn]);
            }
        }
    };

    const updateVillain = (index: number, field: keyof Villain, value: any) => {
        const newVillains = [...villains];
        newVillains[index] = { ...newVillains[index], [field]: value };
        setVillains(newVillains);
    };

    const handleCardSelect = (card: Card) => {
        if (!activeSlot) return;
        const { target, index, villainIndex } = activeSlot;
        if (target === 'hero') {
            const newCards = [...heroCards]; newCards[index] = card; setHeroCards(newCards);
        } else if (target === 'board') {
            const newCards = [...boardCards]; newCards[index] = card; setBoardCards(newCards);
        } else if (target === 'villain' && typeof villainIndex === 'number') {
            const v = villains[villainIndex]; const newCards = [...v.cards]; newCards[index] = card;
            updateVillain(villainIndex, 'cards', newCards);
        }
        setActiveSlot(null);
    };

    // --- CORE LOGIC: BUILD & TRANSITION ---

    const buildCurrentScenario = (): Scenario => {
        return {
            id: `manual_${Date.now()}_${stages.length}`,
            title: `Hand Stage ${stages.length + 1}`,
            levelId: 'custom',
            street,
            blinds: { sb: 0.5, bb: 1 },
            heroPosition: heroPos,
            villainPosition: villains[0]?.position || 'BB',
            heroCards: heroCards as [Card, Card],
            communityCards: [...boardCards], // Copy
            potSize,
            heroChipsInFront: heroStartChips,
            defaultRaiseAmount: targetRaiseAmount,
            villainChipsInFront: villains[0]?.chipsInFront || 0,
            heroStack,
            villains,
            actionHistory: [], // Simplified for MVP
            villainAction: villains[0]?.action || 'Check',
            amountToCall: 0,
            correctAction,
            explanation_simple: explanation,
            explanation_deep: explanation
        };
    };

    const handleNextStreet = () => {
        if (heroCards.length !== 2) { setStatusMsg("Hero cards missing!"); return; }
        if (street === 'river') { setStatusMsg("Already at River! Save the hand."); return; }

        // 1. Save current stage
        const currentStage = buildCurrentScenario();
        setStages([...stages, currentStage]);

        // 2. Calculate New Pot
        // Logic: Old Pot + Hero Bet + Villain Call (Simplified: We assume Villain calls to see next street)
        let heroContribution = heroStartChips;
        if (correctAction === 'Raise') heroContribution = targetRaiseAmount;
        if (correctAction === 'Call') heroContribution = villains[0].chipsInFront; // Match villain
        if (correctAction === 'Check') heroContribution = 0; // No chips added (if start was 0)

        // Assume Villain matches the highest bet to proceed
        const highestBet = Math.max(heroContribution, villains[0].chipsInFront);
        // Total added this round = Hero Part + Villain Part
        // Note: Pot Size in next stage = Old Pot + Hero's TOTAL put in + Villain's TOTAL put in
        // Simplified: NewPot = OldPot + (HighestBet * 2). 
        // (This assumes heads-up and simplified betting, good for MVP)
        const nextPotSize = potSize + (highestBet * 2);

        // 3. Setup Next Stage State
        const nextStreet = getNextStreetName(street) as any;
        setStreet(nextStreet);
        setPotSize(nextPotSize);
        setHeroStartChips(0); // Reset chips
        setVillains(prev => prev.map(v => ({ ...v, chipsInFront: 0, action: 'Check' }))); // Reset Villain
        setCorrectAction('Check'); // Default
        setTargetRaiseAmount(0);
        setExplanation('');

        // 4. Deal Cards
        const deck = createDeck();
        const used = [...heroCards, ...boardCards];
        const needed = nextStreet === 'flop' ? 3 : 1;
        const { drawn } = drawCards(deck, needed, used);
        setBoardCards([...boardCards, ...drawn]);

        setStatusMsg(`Moved to ${nextStreet.toUpperCase()}`);
    };

    const handleSaveFullHand = () => {
        // Save the final stage currently in editor
        const finalStage = buildCurrentScenario();
        const fullChain = [...stages, finalStage];

        // Link them
        const linkedScenarios = fullChain.map((s, i) => ({
            ...s,
            id: `hand_${Date.now()}_stage_${i}`,
            nextStageId: i < fullChain.length - 1 ? `hand_${Date.now()}_stage_${i + 1}` : undefined
        }));

        scenarioStore.addBatch(linkedScenarios);

        // Reset everything
        setStages([]);
        setStreet('preflop');
        setPotSize(0);
        setHeroStartChips(0);
        setBoardCards([]);
        setStatusMsg("✅ Full Hand Saved!");
    };

    // --- RENDER ---

    const renderCardSlot = (target: 'hero' | 'board' | 'villain', index: number, card: Card | undefined, vIndex?: number) => (
        <button
            onClick={() => setActiveSlot({ target, index, villainIndex: vIndex })}
            className={cn(
                "w-10 h-14 rounded border border-dashed flex items-center justify-center bg-white text-xs text-slate-400 hover:border-slate-600 transition-colors shadow-sm",
                activeSlot?.target === target && activeSlot?.index === index ? "border-blue-500 bg-blue-50" : "border-slate-300"
            )}
        >
            {card ? <PlayingCard card={card} size="sm" className="scale-75 origin-center" /> : "?"}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-mono text-sm text-slate-800 pb-32">

            {/* TOP BAR */}
            <div className="flex items-center justify-between mb-6 bg-white p-3 border border-slate-200 rounded-lg shadow-sm sticky top-0 z-20">
                <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 font-bold">
                    <ArrowRight className="w-4 h-4 rotate-180 mr-1" /> EXIT
                </button>

                {/* TIMELINE */}
                <div className="flex items-center gap-2">
                    {stages.map((s, i) => (
                        <div key={i} className="flex items-center">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold border border-green-200">
                                {(s.street || 'unknown').toUpperCase()}
                            </span>
                            <div className="w-4 h-0.5 bg-slate-300 mx-1"></div>
                        </div>
                    ))}
                    <span className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold shadow-md">
                        {street.toUpperCase()} (Editing)
                    </span>
                </div>

                <button onClick={handleSaveFullHand} className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 font-bold shadow-sm transition-all">
                    <Save className="w-4 h-4 mr-2" /> SAVE HAND
                </button>
            </div>

            {statusMsg && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl z-50 font-bold animate-in fade-in slide-in-from-top-4">{statusMsg}</div>}

            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* LEFT COLUMN: SETUP */}
                <div className="space-y-4">
                    {/* HERO */}
                    <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-black text-slate-700">HERO</span>
                            <button onClick={() => handleRandomize('hero')} className="text-xs text-blue-600 font-bold hover:underline">RND CARDS</button>
                        </div>
                        <div className="flex gap-3 mb-4">
                            {renderCardSlot('hero', 0, heroCards[0])}
                            {renderCardSlot('hero', 1, heroCards[1])}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="label-text">Position</label>
                                <select value={heroPos} onChange={e => setHeroPos(e.target.value)} className="input-field">
                                    {['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'].map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label-text">Start Chips</label>
                                <input type="number" value={heroStartChips} onChange={e => setHeroStartChips(+e.target.value)} className="input-field" placeholder="0" />
                            </div>
                        </div>
                    </section>

                    {/* VILLAIN */}
                    <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-black text-slate-700">VILLAIN</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="label-text">Position</label>
                                <select value={villains[0].position} onChange={e => updateVillain(0, 'position', e.target.value)} className="input-field">
                                    {['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'].map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label-text">Action Status</label>
                                <select value={villains[0].action} onChange={e => updateVillain(0, 'action', e.target.value)} className="input-field">
                                    <option>To Act</option>
                                    <option>Check</option>
                                    <option>Bet</option>
                                    <option>Raise</option>
                                    <option>Call</option>
                                    <option>Post BB</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="label-text">Chips In Front (Bet)</label>
                            <input type="number" value={villains[0].chipsInFront} onChange={e => updateVillain(0, 'chipsInFront', +e.target.value)} className="input-field" placeholder="0" />
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: BOARD & SOLUTION */}
                <div className="space-y-4">

                    {/* BOARD */}
                    <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <span className="font-black text-slate-700 block">BOARD & POT</span>
                                <span className="text-xs text-slate-400">{street.toUpperCase()}</span>
                            </div>
                            {street !== 'preflop' && (
                                <button onClick={() => handleRandomize('board')} className="text-xs text-blue-600 font-bold hover:underline">RND BOARD</button>
                            )}
                        </div>

                        <div className="flex gap-2 mb-4 bg-slate-100 p-2 rounded-lg justify-center min-h-[70px] items-center border border-slate-200">
                            {(() => {
                                const count = street === 'preflop' ? 0 : street === 'flop' ? 3 : street === 'turn' ? 4 : 5;
                                if (count === 0) return <span className="text-slate-400 text-xs italic">No Cards (Preflop)</span>;
                                return Array.from({ length: 5 }).map((_, i) => i < count ? renderCardSlot('board', i, boardCards[i]) : null);
                            })()}
                        </div>

                        <div>
                            <label className="label-text">Total Pot (Center)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <input type="number" value={potSize} onChange={e => setPotSize(+e.target.value)} className="input-field pl-6 font-bold text-lg" />
                            </div>
                        </div>
                    </section>

                    {/* SOLUTION */}
                    <section className="bg-slate-800 p-5 rounded-xl shadow-lg text-white border border-slate-700">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                            <h3 className="font-bold text-yellow-400 text-sm tracking-wider">CORRECT DECISION</h3>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {['Fold', 'Check', 'Call', 'Raise'].map(a => (
                                <button
                                    key={a}
                                    onClick={() => {
                                        setCorrectAction(a as Action);
                                        if (a !== 'Raise') setTargetRaiseAmount(0);
                                    }}
                                    className={cn(
                                        "py-2 rounded font-bold text-xs transition-all border",
                                        correctAction === a
                                            ? "bg-yellow-500 text-black border-yellow-500"
                                            : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                                    )}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>

                        {correctAction === 'Raise' && (
                            <div className="bg-slate-700/50 p-3 rounded mb-4 border border-slate-600">
                                <label className="block text-[10px] font-bold text-slate-400 mb-1">RAISE TO (TOTAL)</label>
                                <input
                                    type="number"
                                    value={targetRaiseAmount}
                                    onChange={e => setTargetRaiseAmount(+e.target.value)}
                                    className="bg-slate-900 border border-yellow-600/50 text-white p-2 rounded w-full font-bold focus:outline-none focus:border-yellow-500"
                                    placeholder="Amount"
                                />
                            </div>
                        )}

                        <textarea
                            value={explanation}
                            onChange={e => setExplanation(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-xs text-slate-300 focus:border-slate-400 outline-none h-20 resize-none mb-4"
                            placeholder="Explanation..."
                        />

                        {/* NEXT STREET BUTTON */}
                        {street !== 'river' ? (
                            <button
                                onClick={handleNextStreet}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                            >
                                Next Street (Auto-Calc) <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="text-center text-xs text-slate-400 italic py-2">
                                End of Hand (River)
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* CARD SELECTOR MODAL */}
            {activeSlot && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white p-4 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200">
                        <div className="flex justify-between mb-4 border-b pb-2">
                            <h3 className="font-bold text-lg text-slate-800">Select Card</h3>
                            <button onClick={() => setActiveSlot(null)} className="text-slate-400 hover:text-black font-bold">Close</button>
                        </div>
                        <CardMatrix
                            selectedCards={[...heroCards, ...boardCards, ...villains.flatMap(v => v.cards)]}
                            onSelectCard={handleCardSelect}
                            maxSelection={52}
                        />
                    </div>
                </div>
            )}

            <style>{`
                .label-text { display: block; font-size: 10px; font-weight: bold; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase; }
                .input-field { width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; background: #f8fafc; font-size: 12px; color: #334155; outline: none; }
                .input-field:focus { border-color: #3b82f6; background: #fff; }
            `}</style>
        </div>
    );
}

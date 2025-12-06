import { useState } from 'react';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { CardMatrix } from '@/components/ui/CardMatrix';
import { type Card, type Scenario, type Action, type Villain } from '@/lib/types';
import { createDeck, drawCards } from '@/lib/poker-engine';
import { scenarioStore } from '@/lib/scenario-store';
import { cn } from '@/lib/utils';

interface ScenarioBuilderProps {
    onBack: () => void;
}

type CardSlot = { target: 'hero' | 'board' | 'villain', index: number, villainIndex?: number };

export function ScenarioBuilder({ onBack }: ScenarioBuilderProps) {
    // --- STATE ---
    const [heroCards, setHeroCards] = useState<Card[]>([]);
    const [boardCards, setBoardCards] = useState<Card[]>([]);

    // Hero State
    const [heroPos, setHeroPos] = useState('BTN');
    const [heroStack] = useState(100);
    const [heroStartChips, setHeroStartChips] = useState(0);

    // Villains State
    const [villains, setVillains] = useState<Villain[]>([
        { id: 'v1', position: 'BB', stack: 100, chipsInFront: 0, action: 'Post BB', cards: [] }
    ]);

    // Game Context
    const [blinds] = useState({ sb: 0.5, bb: 1 });
    const [potSize, setPotSize] = useState(0); // [FIX] Default is 0 (Center pot empty at start)
    const [street, setStreet] = useState<'preflop' | 'flop' | 'turn' | 'river'>('preflop');
    const [actionHistory] = useState<string>('');

    // SOLUTION STATE
    const [correctAction, setCorrectAction] = useState<Action>('Fold');
    const [targetRaiseAmount, setTargetRaiseAmount] = useState(0);
    const [explanation, setExplanation] = useState('');

    // UI State
    const [activeSlot, setActiveSlot] = useState<CardSlot | null>(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [stages] = useState<Scenario[]>([]);

    // --- ACTIONS ---

    const handleRandomize = (target: 'hero' | 'board' | 'villain', villainIndex?: number) => {
        let used: Card[] = [...heroCards, ...boardCards];
        villains.forEach(v => used.push(...v.cards));
        const deck = createDeck();

        if (target === 'hero') {
            const { drawn } = drawCards(deck, 2, used);
            setHeroCards(drawn);
        } else if (target === 'board') {
            const count = street === 'flop' ? 3 : street === 'turn' ? 4 : street === 'river' ? 5 : 0;
            if (count > 0) {
                const { drawn } = drawCards(deck, count, used);
                setBoardCards(drawn);
            }
        } else if (target === 'villain' && typeof villainIndex === 'number') {
            const { drawn } = drawCards(deck, 2, used);
            updateVillain(villainIndex, 'cards', drawn);
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

    // --- BUILDER LOGIC ---

    const buildScenario = (): Scenario => {
        const prevHistory = stages.flatMap(s => s.actionHistory);
        const currentHistory = actionHistory.split('\n').filter(s => s.trim());

        return {
            id: `manual_${Date.now()}`,
            title: 'Manual Scenario',
            levelId: 'custom',
            street,
            blinds,
            heroPosition: heroPos,
            villainPosition: villains[0]?.position || 'BB',
            heroCards: heroCards as [Card, Card],
            communityCards: boardCards,
            potSize,
            heroChipsInFront: heroStartChips,
            defaultRaiseAmount: targetRaiseAmount,

            villainChipsInFront: villains[0]?.chipsInFront || 0,
            heroStack,
            villains,
            actionHistory: [...prevHistory, ...currentHistory],
            villainAction: villains[0]?.action || 'Check',
            amountToCall: 0,
            correctAction,
            explanation_simple: explanation,
            explanation_deep: explanation
        };
    };

    const handleSave = () => {
        if (heroCards.length !== 2) { setStatusMsg("Hero cards missing!"); return; }
        const finalStage = buildScenario();
        scenarioStore.addBatch([finalStage]);
        setStatusMsg("✅ Scenario Saved!");
        setTimeout(() => setStatusMsg(''), 2000);
    };

    const handleActionChange = (action: Action) => {
        setCorrectAction(action);
        if (action !== 'Raise') setTargetRaiseAmount(0);
    };

    const renderCardSlot = (target: 'hero' | 'board' | 'villain', index: number, card: Card | undefined, vIndex?: number) => (
        <button
            onClick={() => setActiveSlot({ target, index, villainIndex: vIndex })}
            className={cn(
                "w-10 h-14 rounded border border-dashed flex items-center justify-center bg-white text-xs text-slate-400 hover:border-slate-600 transition-colors",
                activeSlot?.target === target && activeSlot?.index === index ? "border-blue-500 bg-blue-50" : "border-slate-300"
            )}
        >
            {card ? <PlayingCard card={card} size="sm" className="scale-75 origin-center" /> : "?"}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-100 p-4 font-mono text-sm text-slate-800 pb-32">
            <div className="flex items-center justify-between mb-4 bg-white p-3 border border-slate-300 rounded shadow-sm sticky top-0 z-20">
                <button onClick={onBack} className="font-bold text-slate-600 hover:text-slate-900">← EXIT</button>
                <span className="font-black text-slate-700 tracking-widest">SCENARIO BUILDER 2.0</span>
                <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-1 rounded hover:bg-emerald-700 font-bold shadow-sm">SAVE</button>
            </div>

            {statusMsg && <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg z-50 font-bold">{statusMsg}</div>}

            <div className="max-w-2xl mx-auto space-y-4">

                {/* 1. SITUATION SETUP */}
                <section className="bg-white p-4 rounded border border-slate-300 shadow-sm">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3 border-b pb-1">1. The Situation (Start State)</h3>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Hero */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-blue-600">HERO</span>
                                <button onClick={() => handleRandomize('hero')} className="text-xs text-slate-400 hover:text-blue-600">[Random]</button>
                            </div>
                            <div className="flex gap-2 mb-2">
                                {renderCardSlot('hero', 0, heroCards[0])}
                                {renderCardSlot('hero', 1, heroCards[1])}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-bold">POSITION</label>
                                    <select value={heroPos} onChange={e => setHeroPos(e.target.value)} className="w-full border rounded p-1 bg-slate-50">
                                        {['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'].map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-bold">START CHIPS</label>
                                    <input
                                        type="number"
                                        value={heroStartChips}
                                        onChange={e => setHeroStartChips(+e.target.value)}
                                        className="w-full border rounded p-1 bg-slate-50"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 italic">* Chips currently on table (e.g. 0 or 1)</p>
                        </div>

                        {/* Villain */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-red-600">VILLAIN</span>
                            </div>
                            <div className="flex gap-2 mb-2">
                                {renderCardSlot('villain', 0, villains[0].cards[0], 0)}
                                {renderCardSlot('villain', 1, villains[0].cards[1], 0)}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-bold">POSITION</label>
                                    <select value={villains[0].position} onChange={e => updateVillain(0, 'position', e.target.value)} className="w-full border rounded p-1 bg-slate-50">
                                        {['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'].map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-bold">BET SIZE</label>
                                    <input
                                        type="number"
                                        value={villains[0].chipsInFront}
                                        onChange={e => updateVillain(0, 'chipsInFront', +e.target.value)}
                                        className="w-full border rounded p-1 bg-slate-50"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-400 font-bold">LAST ACTION</label>
                                {/* [FIX] Dropdown instead of input */}
                                <select
                                    value={villains[0].action}
                                    onChange={e => updateVillain(0, 'action', e.target.value)}
                                    className="w-full border rounded p-1 bg-slate-50 text-xs"
                                >
                                    <option>Post SB</option>
                                    <option>Post BB</option>
                                    <option>Check</option>
                                    <option>Bet</option>
                                    <option>Raise</option>
                                    <option>Call</option>
                                    <option>All-in</option>
                                    <option>Fold</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. BOARD & POT */}
                <section className="bg-white p-4 rounded border border-slate-300 shadow-sm">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3 border-b pb-1">2. The Board</h3>
                    <div className="flex items-end gap-4 mb-4">
                        <div>
                            <label className="block text-[10px] text-slate-400 font-bold">STREET</label>
                            <select value={street} onChange={e => setStreet(e.target.value as any)} className="border rounded p-1 bg-slate-50 w-32">
                                <option value="preflop">Preflop</option>
                                <option value="flop">Flop</option>
                                <option value="turn">Turn</option>
                                <option value="river">River</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-400 font-bold">POT SIZE (Center)</label>
                            <input
                                type="number"
                                value={potSize}
                                onChange={e => setPotSize(+e.target.value)}
                                className="border rounded p-1 bg-slate-50 w-24"
                                placeholder="0"
                            />
                        </div>
                        <div className="col-span-2 flex items-end">
                            {(street === 'preflop' ? 0 : street === 'flop' ? 3 : street === 'turn' ? 4 : 5) > 0 && (
                                <button onClick={() => handleRandomize('board')} className="text-blue-600 hover:underline text-[10px]">[RND BOARD]</button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 h-20 items-center justify-center bg-slate-50 rounded border border-slate-200">
                        {(() => {
                            const count = street === 'preflop' ? 0 : street === 'flop' ? 3 : street === 'turn' ? 4 : 5;
                            if (count === 0) return <span className="text-slate-400 italic">Preflop - No Cards</span>;
                            return Array.from({ length: 5 }).map((_, i) => i < count ? renderCardSlot('board', i, boardCards[i]) : null);
                        })()}
                    </div>
                </section>

                {/* 3. THE SOLUTION */}
                <section className="bg-slate-800 p-4 rounded shadow-lg text-white border border-slate-700">
                    <h3 className="font-bold text-yellow-500 text-xs uppercase tracking-wider mb-4 border-b border-slate-600 pb-1">3. The Correct Solution</h3>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {['Fold', 'Check', 'Call', 'Raise'].map(a => (
                            <button
                                key={a}
                                onClick={() => handleActionChange(a as Action)}
                                className={cn(
                                    "py-3 rounded font-bold text-sm transition-all border-2",
                                    correctAction === a
                                        ? "bg-yellow-500 text-black border-yellow-500"
                                        : "bg-slate-700 border-transparent text-slate-300 hover:bg-slate-600"
                                )}
                            >
                                {a}
                            </button>
                        ))}
                    </div>

                    {correctAction === 'Raise' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded mb-4 animate-in fade-in slide-in-from-top-2">
                            <label className="block text-xs font-bold text-yellow-400 mb-1">RAISE TO (TOTAL)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={targetRaiseAmount}
                                    onChange={e => setTargetRaiseAmount(+e.target.value)}
                                    className="bg-slate-900 border border-yellow-600 text-white p-2 rounded w-24 font-bold text-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                                />
                                <span className="text-slate-400 text-sm">BB</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                                * This is the final chip amount visible AFTER player clicks Raise. <br />
                                * Hero Start Chips: {heroStartChips} BB → Raise To: {targetRaiseAmount} BB.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-1">EXPLANATION</label>
                        <textarea
                            value={explanation}
                            onChange={e => setExplanation(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-slate-200 focus:border-slate-400 outline-none h-24 resize-none"
                            placeholder="Why is this the best move?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <button
                            onClick={handleSave}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-sm text-sm uppercase tracking-wide col-span-2"
                        >
                            💾 Save Scenario
                        </button>
                    </div>
                </section>

            </div>

            {activeSlot && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-4 rounded-lg shadow-2xl max-w-lg w-full">
                        <div className="flex justify-between mb-4">
                            <h3 className="font-bold text-lg">Select Card</h3>
                            <button onClick={() => setActiveSlot(null)} className="text-slate-400 hover:text-black">Close</button>
                        </div>
                        <CardMatrix
                            selectedCards={[...heroCards, ...boardCards, ...villains.flatMap(v => v.cards)]}
                            onSelectCard={handleCardSelect}
                            maxSelection={52}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState } from 'react';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { CardMatrix } from '@/components/ui/CardMatrix';
import { type Card, type Scenario, type Action, type Villain } from '@/lib/types';
import { createDeck, drawCards } from '@/lib/poker-engine';
import { scenarioStore } from '@/lib/scenario-store';
import { cn } from '@/lib/utils';
import { ArrowRight, Save, Plus, Trash2, History, CheckCircle } from 'lucide-react';

interface ScenarioBuilderProps {
    onBack: () => void;
}

type CardSlot = { target: 'hero' | 'board' | 'villain', index: number, villainIndex?: number };

export function ScenarioBuilder({ onBack }: ScenarioBuilderProps) {
    // --- GLOBAL HAND STATE ---
    const [stages, setStages] = useState<Scenario[]>([]);

    // --- SANDBOX STATE (Current Live State) ---
    // Hero
    const [heroCards, setHeroCards] = useState<Card[]>([]);
    const [heroPos, setHeroPos] = useState('BTN');
    const [heroStack] = useState(100);
    const [heroChips, setHeroChips] = useState(0); // Live chips on table

    // Villains (Array)
    const [villains, setVillains] = useState<Villain[]>([
        { id: 'v1', position: 'SB', stack: 100, chipsInFront: 0, action: 'Post SB', cards: [] },
        { id: 'v2', position: 'BB', stack: 100, chipsInFront: 0, action: 'Post BB', cards: [] }
    ]);

    // Board & Pot
    const [boardCards, setBoardCards] = useState<Card[]>([]);
    const [potSize, setPotSize] = useState(0);
    const [street, setStreet] = useState<'preflop' | 'flop' | 'turn' | 'river'>('preflop');
    const [actionHistory, setActionHistory] = useState<string[]>([]);

    // Simulation Inputs (For "Past Actions")
    const [simActorId, setSimActorId] = useState<string>('hero');
    const [simAction, setSimAction] = useState<string>('Call');
    const [simAmount, setSimAmount] = useState<number>(0);

    // Solution (The Question)
    const [correctAction, setCorrectAction] = useState<Action>('Fold');
    const [targetRaiseAmount, setTargetRaiseAmount] = useState(0);
    const [explanation, setExplanation] = useState('');

    // UI
    const [activeSlot, setActiveSlot] = useState<CardSlot | null>(null);
    const [statusMsg, setStatusMsg] = useState('');

    // --- MANAGE VILLAINS ---
    const handleAddVillain = () => {
        if (villains.length >= 5) return;
        const newId = `v${Date.now()}`;
        setVillains([...villains, {
            id: newId,
            position: 'UTG',
            stack: 100,
            chipsInFront: 0,
            action: 'Check',
            cards: []
        }]);
    };

    const handleRemoveVillain = (idx: number) => {
        setVillains(villains.filter((_, i) => i !== idx));
    };

    const updateVillain = (index: number, field: keyof Villain, value: any) => {
        const newVillains = [...villains];
        newVillains[index] = { ...newVillains[index], [field]: value };
        setVillains(newVillains);
    };

    // --- SIMULATOR: ADD PAST ACTION ---
    const handleApplySimAction = () => {
        // 1. Identify Actor
        const isHero = simActorId === 'hero';
        const actorName = isHero ? 'Hero' : villains.find(v => v.id === simActorId)?.position || 'Villain';

        // 2. Calculate Pot Impact
        // If it's a Raise/Bet/Call, we need to update chips in front
        // Note: For simplicity in Sandbox, we ADD to the pot immediately when creating history,
        // OR we update "Chips In Front" and let the user manually fix the pot if needed.
        // Let's go with: Update Chips In Front + Visual Log. User must click "Next Street" to sweep chips to pot.

        let logString = `${actorName} ${simAction}`;
        if (['Bet', 'Raise', 'Call'].includes(simAction)) {
            logString += ` ${simAmount}`;

            if (isHero) {
                setHeroChips(simAmount); // Set visual chips
            } else {
                setVillains(prev => prev.map(v => v.id === simActorId ? { ...v, chipsInFront: simAmount, action: simAction } : v));
            }
        } else {
            // Fold/Check
            if (!isHero) {
                setVillains(prev => prev.map(v => v.id === simActorId ? { ...v, action: simAction } : v));
            }
        }

        setActionHistory([...actionHistory, logString]);
        setStatusMsg(`Added: ${logString}`);
    };

    // --- TRANSITIONS ---

    const handleNextStreet = () => {
        // 1. Sweep Chips to Pot
        const heroBet = heroChips;
        const villainBets = villains.reduce((sum, v) => sum + v.chipsInFront, 0);
        const newPot = potSize + heroBet + villainBets;

        // 2. Reset Chips
        setPotSize(newPot);
        setHeroChips(0);
        setVillains(prev => prev.map(v => ({ ...v, chipsInFront: 0, action: 'Check' })));

        // 3. Move Street & Deal
        const nextStreet = street === 'preflop' ? 'flop' : street === 'flop' ? 'turn' : street === 'turn' ? 'river' : 'river';
        if (nextStreet === street && street === 'river') {
            setStatusMsg("Already River!");
            return;
        }

        setStreet(nextStreet);

        const deck = createDeck();
        // Simple random deal for next street
        // (In real usage, remove cards already in play)
        const needed = nextStreet === 'flop' ? 3 : 1;
        const { drawn } = drawCards(deck, needed, []);
        setBoardCards([...boardCards, ...drawn]);

        setStatusMsg(`Moved to ${nextStreet.toUpperCase()}`);
    };

    // --- CAPTURE & SAVE ---

    const buildStage = (): Scenario => {
        return {
            id: `manual_${Date.now()}_${stages.length}`,
            title: `Hand Stage ${stages.length + 1}`,
            levelId: 'custom',
            street,
            blinds: { sb: 0.5, bb: 1 },
            heroPosition: heroPos,
            villainPosition: villains[0]?.position || 'BB', // Primary villain for POV
            heroCards: heroCards as [Card, Card],
            communityCards: [...boardCards],
            potSize,
            heroChipsInFront: heroChips,
            defaultRaiseAmount: targetRaiseAmount,
            villainChipsInFront: villains[0]?.chipsInFront || 0, // Legacy support
            heroStack,
            villains: [...villains], // Save full array
            actionHistory: [...actionHistory],
            villainAction: 'To Act', // Derived from state usually
            amountToCall: 0,
            correctAction,
            explanation_simple: explanation,
            explanation_deep: explanation
        };
    };

    const handleCaptureStage = () => {
        if (heroCards.length !== 2) { setStatusMsg("Hero cards missing!"); return; }
        const stage = buildStage();
        setStages([...stages, stage]);

        // Clear immediate history for next logic block? 
        // No, keep history growing for the hand narrative.

        setStatusMsg(`Stage ${stages.length + 1} Captured!`);
        setTimeout(() => setStatusMsg(''), 1500);
    };

    const handleFinishAndSave = () => {
        // If we have unsaved changes in the editor that aren't captured, capture them?
        // Let's assume user clicked Capture first.

        if (stages.length === 0) {
            handleCaptureStage(); // Capture at least one
        }

        const finalChain = stages.length > 0 ? stages : [buildStage()];

        const linkedScenarios = finalChain.map((s, i) => ({
            ...s,
            id: `hand_${Date.now()}_stage_${i}`,
            nextStageId: i < finalChain.length - 1 ? `hand_${Date.now()}_stage_${i + 1}` : undefined
        }));

        scenarioStore.addBatch(linkedScenarios);
        setStatusMsg("✅ Full Hand Saved to Menu!");
        setTimeout(() => {
            setStages([]);
            setActionHistory([]);
            setHeroChips(0);
            setPotSize(0);
            setStreet('preflop');
        }, 2000);
    };

    // --- RENDER HELPERS ---
    const handleRandomize = (target: 'hero' | 'board') => {
        const deck = createDeck();
        if (target === 'hero') setHeroCards(drawCards(deck, 2, []).drawn);
        if (target === 'board') setBoardCards(drawCards(deck, street === 'preflop' ? 0 : 3, []).drawn); // Simplified
    };

    const handleCardSelect = (card: Card) => {
        if (!activeSlot) return;
        const { target, index, villainIndex } = activeSlot;
        if (target === 'hero') {
            const newCards = [...heroCards]; newCards[index] = card; setHeroCards(newCards);
        } else if (target === 'board') {
            const newCards = [...boardCards]; newCards[index] = card; setBoardCards(newCards);
        } else if (target === 'villain' && typeof villainIndex === 'number') {
            const v = villains[villainIndex];
            const newCards = [...v.cards];
            newCards[index] = card;
            updateVillain(villainIndex, 'cards', newCards);
        }
        setActiveSlot(null);
    };

    const renderCardSlot = (target: 'hero' | 'board' | 'villain', index: number, card: Card | undefined, vIndex?: number) => (
        <button
            onClick={() => setActiveSlot({ target, index, villainIndex: vIndex })}
            className={cn(
                "w-9 h-12 rounded border border-dashed flex items-center justify-center bg-white text-[10px] text-slate-400 hover:border-blue-500",
                activeSlot?.target === target && activeSlot?.index === index ? "border-blue-500 bg-blue-50" : "border-slate-300"
            )}
        >
            {card ? <PlayingCard card={card} size="sm" className="scale-[0.6] origin-center" /> : "?"}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-100 p-2 font-mono text-xs text-slate-800 pb-40">
            {/* TOP BAR */}
            <div className="flex items-center justify-between mb-4 bg-white p-2 border border-slate-300 rounded shadow-sm sticky top-0 z-30">
                <button onClick={onBack} className="font-bold text-slate-500 hover:text-black">← EXIT</button>
                <div className="flex gap-1">
                    {stages.map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-green-500"></div>)}
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                </div>
                <button onClick={handleFinishAndSave} className="bg-emerald-600 text-white px-3 py-1 rounded font-bold hover:bg-emerald-700 flex gap-1 items-center">
                    <Save className="w-3 h-3" /> FINISH & SAVE
                </button>
            </div>

            {statusMsg && <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg z-50">{statusMsg}</div>}

            <div className="grid grid-cols-12 gap-4 max-w-5xl mx-auto">

                {/* COL 1: TABLE SETUP (Left) */}
                <div className="col-span-12 md:col-span-4 space-y-4">

                    {/* HERO */}
                    <div className="bg-white p-3 rounded border border-slate-300">
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-blue-600">HERO</span>
                            <button onClick={() => handleRandomize('hero')} className="text-[10px] text-blue-500">[RND]</button>
                        </div>
                        <div className="flex gap-2 mb-2">
                            {renderCardSlot('hero', 0, heroCards[0])}
                            {renderCardSlot('hero', 1, heroCards[1])}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <select value={heroPos} onChange={e => setHeroPos(e.target.value)} className="border p-1 rounded"><option>BTN</option><option>SB</option><option>BB</option><option>UTG</option><option>MP</option><option>CO</option></select>
                            <input type="number" value={heroChips} onChange={e => setHeroChips(+e.target.value)} className="border p-1 rounded" placeholder="Chips" />
                        </div>
                    </div>

                    {/* VILLAINS LIST */}
                    <div className="space-y-2">
                        {villains.map((v, idx) => (
                            <div key={v.id} className="bg-white p-3 rounded border border-slate-300 relative">
                                <button onClick={() => handleRemoveVillain(idx)} className="absolute top-1 right-1 text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-red-600">VILLAIN {idx + 1}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <select value={v.position} onChange={e => updateVillain(idx, 'position', e.target.value)} className="border p-1 rounded">
                                        <option>SB</option><option>BB</option><option>UTG</option><option>MP</option><option>CO</option><option>BTN</option>
                                    </select>
                                    <input type="number" value={v.chipsInFront} onChange={e => updateVillain(idx, 'chipsInFront', +e.target.value)} className="border p-1 rounded" placeholder="Bet Size" />
                                </div>
                                <div className="mt-1 flex gap-1">
                                    <span className="text-[10px] text-slate-400 self-center">Status:</span>
                                    <input value={v.action} onChange={e => updateVillain(idx, 'action', e.target.value)} className="border p-1 rounded text-xs flex-1" />
                                </div>
                            </div>
                        ))}
                        <button onClick={handleAddVillain} className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 rounded flex justify-center items-center gap-1">
                            <Plus className="w-3 h-3" /> ADD VILLAIN
                        </button>
                    </div>
                </div>

                {/* COL 2: ACTION SIMULATOR (Center) */}
                <div className="col-span-12 md:col-span-4 space-y-4">

                    {/* BOARD */}
                    <div className="bg-white p-3 rounded border border-slate-300 text-center">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-600">{street.toUpperCase()}</span>
                            <div className="flex items-center gap-1">
                                <span className="text-slate-400 text-[10px]">POT:</span>
                                <input type="number" value={potSize} onChange={e => setPotSize(+e.target.value)} className="w-16 border p-1 text-center font-bold" />
                            </div>
                        </div>
                        <div className="flex justify-center gap-1 min-h-[50px] bg-slate-50 rounded border border-slate-100 p-2 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                (street === 'preflop' && i === 0) ? <span key={i} className="text-[10px] text-slate-300 pt-2">No Board</span> :
                                    (i < (street === 'flop' ? 3 : street === 'turn' ? 4 : street === 'river' ? 5 : 0)) ? renderCardSlot('board', i, boardCards[i]) : null
                            ))}
                        </div>
                        <button onClick={handleNextStreet} className="w-full bg-blue-100 text-blue-700 py-2 rounded font-bold text-[10px] hover:bg-blue-200 flex justify-center items-center gap-1">
                            DEAL NEXT STREET <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    {/* HISTORY BUILDER */}
                    <div className="bg-slate-200 p-3 rounded border border-slate-300">
                        <div className="flex items-center gap-1 mb-2 text-slate-500 font-bold text-[10px]">
                            <History className="w-3 h-3" /> BUILD HISTORY (Past Actions)
                        </div>

                        <div className="bg-white p-2 rounded h-32 overflow-y-auto mb-2 text-[10px] space-y-1 border border-slate-300">
                            {actionHistory.length === 0 && <span className="text-slate-300 italic">No history yet...</span>}
                            {actionHistory.map((h, i) => <div key={i} className="border-b border-slate-100 pb-0.5">{h}</div>)}
                        </div>

                        <div className="grid grid-cols-3 gap-1 mb-1">
                            <select value={simActorId} onChange={e => setSimActorId(e.target.value)} className="border p-1 rounded text-[10px]">
                                <option value="hero">Hero</option>
                                {villains.map(v => <option key={v.id} value={v.id}>{v.position} (V)</option>)}
                            </select>
                            <select value={simAction} onChange={e => setSimAction(e.target.value)} className="border p-1 rounded text-[10px]">
                                <option>Check</option><option>Bet</option><option>Raise</option><option>Call</option><option>Fold</option>
                            </select>
                            <input type="number" value={simAmount} onChange={e => setSimAmount(+e.target.value)} className="border p-1 rounded text-[10px]" placeholder="Amt" />
                        </div>
                        <button onClick={handleApplySimAction} className="w-full bg-slate-700 text-white py-1 rounded text-[10px] font-bold hover:bg-slate-600">
                            + ADD TO HISTORY
                        </button>
                        <p className="text-[9px] text-slate-500 mt-1 leading-tight">* Adds to history and sets chips/action, but DOES NOT save stage.</p>
                    </div>
                </div>

                {/* COL 3: SOLUTION (Right) */}
                <div className="col-span-12 md:col-span-4 bg-slate-800 p-4 rounded text-white border border-slate-700 h-fit">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-600 pb-2">
                        <CheckCircle className="w-4 h-4 text-yellow-400" />
                        <span className="font-bold text-yellow-400">DEFINE PUZZLE</span>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] text-slate-400 mb-1">CORRECT ACTION (HERO)</label>
                            <div className="grid grid-cols-4 gap-1">
                                {['Fold', 'Check', 'Call', 'Raise'].map(a => (
                                    <button
                                        key={a}
                                        onClick={() => setCorrectAction(a as Action)}
                                        className={cn(
                                            "py-1 rounded text-[10px] font-bold border",
                                            correctAction === a ? "bg-yellow-500 text-black border-yellow-500" : "bg-slate-700 border-slate-600 text-slate-400"
                                        )}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {correctAction === 'Raise' && (
                            <div>
                                <label className="block text-[10px] text-slate-400 mb-1">RAISE TO (TOTAL)</label>
                                <input type="number" value={targetRaiseAmount} onChange={e => setTargetRaiseAmount(+e.target.value)} className="w-full bg-slate-900 border border-slate-600 p-2 rounded font-bold text-white" />
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] text-slate-400 mb-1">EXPLANATION</label>
                            <textarea value={explanation} onChange={e => setExplanation(e.target.value)} className="w-full bg-slate-900 border border-slate-600 p-2 rounded text-xs h-20" placeholder="Why?" />
                        </div>

                        <button onClick={handleCaptureStage} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded shadow-lg text-xs flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> CAPTURE THIS STAGE
                        </button>
                        <p className="text-[9px] text-slate-400 text-center">Save this moment as a question, then continue editing.</p>
                    </div>
                </div>

            </div>

            {/* CARD SELECTOR MODAL */}
            {activeSlot && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-4 rounded shadow-xl max-w-lg w-full">
                        <div className="flex justify-between mb-2">
                            <span className="font-bold">Select Card</span>
                            <button onClick={() => setActiveSlot(null)}>Close</button>
                        </div>
                        <CardMatrix selectedCards={[...heroCards, ...boardCards, ...villains.flatMap(v => v.cards)]} onSelectCard={handleCardSelect} maxSelection={52} />
                    </div>
                </div>
            )}
        </div>
    );
}

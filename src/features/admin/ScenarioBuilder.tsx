
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
    const [heroCards, setHeroCards] = useState<Card[]>([]);
    const [boardCards, setBoardCards] = useState<Card[]>([]);

    const [villains, setVillains] = useState<Villain[]>([
        { id: 'v1', position: 'BB', stack: 100, chipsInFront: 0, action: 'Check', cards: [] }
    ]);

    const [blinds, setBlinds] = useState({ sb: 0.5, bb: 1 });
    const [potSize, setPotSize] = useState(2.5);
    const [heroStack, setHeroStack] = useState(100);
    const [heroChips, setHeroChips] = useState(0);

    const [street, setStreet] = useState<'preflop' | 'flop' | 'turn' | 'river'>('preflop');
    const [heroPos, setHeroPos] = useState('BTN');

    const [actionHistory, setActionHistory] = useState<string>('');
    const [correctAction, setCorrectAction] = useState<Action>('Fold');
    const [explanation, setExplanation] = useState('');

    const [activeSlot, setActiveSlot] = useState<CardSlot | null>(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [selectedActor, setSelectedActor] = useState<'hero' | number>('hero');
    const [currentActionType, setCurrentActionType] = useState('Check');

    // --- LOGIC ---

    const getNextStreet = (s: string) => s === 'preflop' ? 'flop' : s === 'flop' ? 'turn' : s === 'turn' ? 'river' : 'river';

    const handleAddAction = () => {
        const amt = selectedActor === 'hero' ? heroChips : villains[selectedActor as number]?.chipsInFront || 0;
        const actorName = selectedActor === 'hero' ? 'Hero' : `V${(selectedActor as number) + 1}`;

        let actionStr = '';
        if (currentActionType === 'Check' || currentActionType === 'Fold') {
            actionStr = `${actorName} ${currentActionType}`;
        } else {
            actionStr = `${actorName} ${currentActionType} ${amt}`;
        }

        setActionHistory(prev => prev ? `${prev}\n${actionStr}` : actionStr);

        // Update visual state for the table
        if (selectedActor === 'hero') {
            // Hero chips already updated via input
        } else {
            updateVillain(selectedActor as number, 'action', currentActionType === 'Check' || currentActionType === 'Fold' ? currentActionType : `${currentActionType} ${amt}`);
        }
    };

    const handleAddVillain = () => {
        if (villains.length >= 5) return;
        setVillains([...villains, {
            id: `v${Date.now()}`, position: 'UTG', stack: 100, chipsInFront: 0, action: 'Fold', cards: []
        }]);
    };

    const handleRemoveVillain = (index: number) => {
        setVillains(villains.filter((_, i) => i !== index));
    };

    const updateVillain = (index: number, field: keyof Villain, value: any) => {
        const newVillains = [...villains];
        newVillains[index] = { ...newVillains[index], [field]: value };
        setVillains(newVillains);
    };

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
                const { drawn } = drawCards(deck, count, [...heroCards, ...villains.flatMap(v => v.cards)]);
                setBoardCards(drawn);
            }
        } else if (target === 'villain' && typeof villainIndex === 'number') {
            const { drawn } = drawCards(deck, 2, used);
            updateVillain(villainIndex, 'cards', drawn);
        }
    };

    const handleCardSelect = (card: Card) => {
        if (!activeSlot) return;
        const { target, index, villainIndex } = activeSlot;

        if (target === 'hero') {
            const newCards = [...heroCards];
            newCards[index] = card;
            setHeroCards(newCards);
        } else if (target === 'board') {
            const newCards = [...boardCards];
            newCards[index] = card;
            setBoardCards(newCards);
        } else if (target === 'villain' && typeof villainIndex === 'number') {
            const v = villains[villainIndex];
            const newCards = [...v.cards];
            newCards[index] = card;
            updateVillain(villainIndex, 'cards', newCards);
        }
        setActiveSlot(null);
    };

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
            heroChipsInFront: heroChips,
            villainChipsInFront: villains[0]?.chipsInFront || 0,
            heroStack,
            villains,
            actionHistory: [...prevHistory, ...currentHistory],
            villainAction: villains[0]?.action || 'Check',
            amountToCall: 0,
            defaultRaiseAmount: 0,
            correctAction,
            explanation_simple: explanation,
            explanation_deep: explanation
        };
    };

    const [stages, setStages] = useState<Scenario[]>([]);

    const handleNextAction = () => {
        if (heroCards.length !== 2) {
            setStatusMsg("Hero cards missing!");
            return;
        }

        const currentScenario = buildScenario();
        setStages([...stages, currentScenario]);

        // Update history with previous outcome (but stay on same street)
        const transitionText = `--- ACTION ${stages.length + 1} ---`;
        setActionHistory(prev => prev ? `${prev}\n${transitionText}` : transitionText);

        // Reset form for next action (keep street, pot, and chips)
        setVillains(villains.map(v => ({ ...v, action: 'Reaction...' })));
        setExplanation('');
        setCorrectAction('Fold');

        setStatusMsg(`Action ${stages.length + 1} saved! Configure next action on ${street.toUpperCase()}...`);
        setTimeout(() => setStatusMsg(''), 2000);
    };

    const handleNextStage = () => {
        if (heroCards.length !== 2) {
            setStatusMsg("Hero cards missing!");
            return;
        }

        const next = getNextStreet(street);
        if (next === street) {
            setStatusMsg("Already at River!");
            return;
        }

        const currentScenario = buildScenario();
        setStages([...stages, currentScenario]);

        // Calculate pot accumulation (bets go into pot)
        const currentBets = heroChips + villains.reduce((sum, v) => sum + v.chipsInFront, 0);
        const newPot = potSize + currentBets;

        // Setup next street
        setStreet(next);
        setPotSize(newPot); // Pot grows
        setHeroChips(0); // Bets cleared
        setVillains(villains.map(v => ({ ...v, chipsInFront: 0, action: 'Check' }))); // Villains reset
        setActionHistory(''); // Clear text for new street
        setExplanation('');
        setCorrectAction('Check');

        setStatusMsg(`Stage ${stages.length + 1} added! Now configuring ${next.toUpperCase()}...`);
        setTimeout(() => setStatusMsg(''), 2000);
    };

    const handleSave = () => {
        if (heroCards.length !== 2) {
            setStatusMsg("Hero cards missing!");
            return;
        }

        const finalStage = buildScenario();
        const allStages = [...stages, finalStage];
        const baseId = `manual_${Date.now()}`;

        // Link stages
        const linkedScenarios = allStages.map((s, i) => ({
            ...s,
            id: `${baseId}_${i + 1}`,
            nextStageId: i < allStages.length - 1 ? `${baseId}_${i + 2}` : undefined,
            isFollowUp: i > 0 // Mark all but first as follow-ups
        }));

        scenarioStore.addBatch(linkedScenarios);
        setStatusMsg("Saved Chain!");
        setTimeout(() => setStatusMsg(''), 2000);
    };

    const renderCardSlot = (target: 'hero' | 'board' | 'villain', index: number, card: Card | undefined, vIndex?: number) => (
        <button
            onClick={() => setActiveSlot({ target, index, villainIndex: vIndex })}
            className={cn(
                "w-8 h-11 rounded border border-dashed flex items-center justify-center bg-white text-[10px] text-slate-400 hover:border-slate-600",
                activeSlot?.target === target && activeSlot?.index === index ? "border-blue-500 bg-blue-50" : "border-slate-300"
            )}
        >
            {card ? <PlayingCard card={card} size="sm" className="scale-50 origin-center" /> : "?"}
        </button>
    );

    const renderStagePreview = (stage: Scenario, i: number) => (
        <section key={i} className="opacity-60 bg-slate-100 border border-slate-300 p-2 rounded-sm mb-2">
            <div className="flex justify-between items-center mb-1 border-b border-slate-200 pb-1">
                <span className="font-bold text-[10px] text-slate-500">STAGE {i + 1}: {(stage.street || 'preflop').toUpperCase()}</span>
                <span className="text-[9px] text-slate-400">Pot: {stage.potSize}BB</span>
            </div>
            <div className="flex gap-2 items-center">
                <div className="flex gap-0.5">
                    {stage.communityCards.map((c, idx) => (
                        <PlayingCard key={idx} card={c} size="sm" className="scale-50 origin-left -mr-4" />
                    ))}
                    {stage.communityCards.length === 0 && <span className="text-[9px] italic text-slate-400">No board</span>}
                </div>
                <div className="text-[10px] text-slate-600">
                    <span className="font-bold">Correct:</span> {stage.correctAction}
                </div>
            </div>
        </section>
    );

    return (
        <div className="min-h-screen bg-slate-100 p-2 font-mono text-xs text-slate-800">
            {/* Minimal Header */}
            <div className="flex items-center justify-between mb-2 bg-white p-2 border border-slate-300 rounded-sm sticky top-0 z-20 shadow-sm">
                <button onClick={onBack} className="hover:underline font-bold text-slate-600">← BACK</button>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">BUILDER</span>
                    {stages.length > 0 && <span className="bg-slate-200 text-slate-600 px-1.5 rounded text-[10px] font-bold">Stage {stages.length + 1}</span>}
                </div>
                <div className="flex gap-1">
                    <button onClick={handleSave} className="bg-slate-800 text-white px-3 py-1 rounded-sm hover:bg-slate-700">SAVE</button>
                </div>
            </div>

            {statusMsg && <div className="text-center bg-green-100 text-green-800 p-1 mb-2 border border-green-300 rounded-sm">{statusMsg}</div>}

            <div className="max-w-lg mx-auto space-y-2">

                {/* HERO */}
                <section className="bg-white p-2 border border-slate-300 rounded-sm">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold uppercase text-slate-500">HERO</span>
                        <button onClick={() => handleRandomize('hero')} className="text-blue-600 hover:underline">[RND]</button>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-1">{[0, 1].map(i => renderCardSlot('hero', i, heroCards[i]))}</div>
                        <div className="flex-1 grid grid-cols-2 gap-1">
                            <div><label className="block text-[9px] text-slate-400">POS</label><select value={heroPos} onChange={e => setHeroPos(e.target.value)} className="w-full border p-0.5 rounded-sm"><option>BTN</option><option>SB</option><option>BB</option><option>UTG</option><option>MP</option><option>CO</option></select></div>
                            <div><label className="block text-[9px] text-slate-400">STACK</label><input type="number" value={heroStack} onChange={e => setHeroStack(+e.target.value)} className="w-full border p-0.5 rounded-sm" /></div>
                        </div>
                    </div>
                </section>

                {/* VILLAINS */}
                <section className="space-y-1">
                    <div className="flex justify-between px-1">
                        <span className="font-bold uppercase text-slate-500">VILLAINS</span>
                        <button onClick={handleAddVillain} disabled={villains.length >= 5} className="text-blue-600 hover:underline disabled:text-slate-300">[+ ADD]</button>
                    </div>
                    {villains.map((v, idx) => (
                        <div key={v.id} className="bg-white p-2 border border-slate-300 rounded-sm relative">
                            <button onClick={() => handleRemoveVillain(idx)} className="absolute top-1 right-1 text-red-400 hover:text-red-600 text-[10px]">[DEL]</button>
                            <div className="flex gap-2">
                                <div>
                                    <div className="flex gap-1 mb-1">
                                        {renderCardSlot('villain', 0, v.cards[0], idx)}
                                        {renderCardSlot('villain', 1, v.cards[1], idx)}
                                    </div>
                                    <button onClick={() => handleRandomize('villain', idx)} className="text-[9px] text-blue-600 hover:underline w-full text-center">[RND]</button>
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-1">
                                    <div className="col-span-1"><label className="block text-[9px] text-slate-400">POS</label><select value={v.position} onChange={e => updateVillain(idx, 'position', e.target.value)} className="w-full border p-0.5"><option>BTN</option><option>SB</option><option>BB</option><option>UTG</option><option>MP</option><option>CO</option></select></div>
                                    <div className="col-span-1"><label className="block text-[9px] text-slate-400">STACK</label><input type="number" value={v.stack} onChange={e => updateVillain(idx, 'stack', +e.target.value)} className="w-full border p-0.5" /></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* GAME SETTINGS */}
                <section className="bg-white p-2 border border-slate-300 rounded-sm mt-2">
                    <div className="grid grid-cols-4 gap-1">
                        <div>
                            <label className="block text-[9px] text-slate-400">START</label>
                            <select value={street} onChange={e => setStreet(e.target.value as any)} className="w-full border p-0.5 rounded-sm text-[10px]">
                                <option>preflop</option><option>flop</option><option>turn</option><option>river</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] text-slate-400">POT</label>
                            <input type="number" value={potSize} onChange={e => setPotSize(+e.target.value)} className="w-full border p-0.5 rounded-sm text-[10px]" />
                        </div>
                        <div>
                            <label className="block text-[9px] text-slate-400">SB</label>
                            <input type="number" value={blinds.sb} onChange={e => setBlinds({ ...blinds, sb: +e.target.value })} className="w-full border p-0.5 rounded-sm text-[10px]" />
                        </div>
                        <div>
                            <label className="block text-[9px] text-slate-400">BB</label>
                            <input type="number" value={blinds.bb} onChange={e => setBlinds({ ...blinds, bb: +e.target.value })} className="w-full border p-0.5 rounded-sm text-[10px]" />
                        </div>
                    </div>
                </section>

                {/* PREVIOUS STAGES */}
                {stages.map(renderStagePreview)}

                {/* STREET CONFIG */}
                <section className="bg-white p-2 border border-slate-300 rounded-sm mt-2">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold uppercase text-slate-500">CURRENT STREET: {street.toUpperCase()}</span>
                        {(street === 'preflop' ? 0 : street === 'flop' ? 3 : street === 'turn' ? 4 : 5) > 0 && (
                            <button onClick={() => handleRandomize('board')} className="text-blue-600 hover:underline">[RND]</button>
                        )}
                    </div>

                    {/* Board Cards */}
                    <div className="flex gap-1 justify-center bg-slate-50 p-2 border border-slate-200 rounded-sm min-h-[60px] items-center">
                        {(() => {
                            const boardCount = street === 'preflop' ? 0 : street === 'flop' ? 3 : street === 'turn' ? 4 : 5;
                            if (boardCount === 0) return <span className="text-slate-400 text-[10px] italic">No community cards</span>;
                            return Array.from({ length: 5 }).map((_, i) => i < boardCount ? renderCardSlot('board', i, boardCards[i]) : null);
                        })()}
                    </div>

                    {/* Action Module */}
                    <div className="mt-2">
                        {/* Row 1: ACTOR SELECTOR */}
                        <div className="flex gap-1 mb-2 border-b border-slate-200 pb-2">
                            <button
                                onClick={() => setSelectedActor('hero')}
                                className={cn("px-2 py-1 text-[10px] font-bold rounded border", selectedActor === 'hero' ? "bg-slate-800 text-white" : "bg-white text-slate-500")}
                            >
                                HERO
                            </button>
                            {villains.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedActor(i)}
                                    className={cn("px-2 py-1 text-[10px] font-bold rounded border", selectedActor === i ? "bg-red-600 text-white" : "bg-white text-slate-500")}
                                >
                                    V{i + 1}
                                </button>
                            ))}
                        </div>

                        {/* Row 2: ACTION TYPE */}
                        <div className="grid grid-cols-5 gap-1 mb-2">
                            {['Check', 'Call', 'Bet', 'Raise', 'All-in'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setCurrentActionType(type)}
                                    className={cn("p-1 border text-[9px] font-bold hover:bg-slate-50", currentActionType === type ? "bg-blue-100 border-blue-400 text-blue-800" : "bg-white")}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Row 3: AMOUNT INPUT */}
                        <div className="flex items-center gap-2">
                            <label className="text-[9px] font-bold text-slate-400">AMOUNT</label>
                            <input
                                type="number"
                                value={selectedActor === 'hero' ? heroChips : villains[selectedActor as number]?.chipsInFront || 0}
                                onChange={e => {
                                    const val = +e.target.value;
                                    if (selectedActor === 'hero') setHeroChips(val);
                                    else updateVillain(selectedActor as number, 'chipsInFront', val);
                                }}
                                className="flex-1 border p-1 rounded-sm text-sm font-bold"
                            />
                        </div>

                        {/* Row 4: ADD ACTION BUTTON */}
                        <button onClick={handleAddAction} className="w-full mt-2 bg-blue-600 text-white p-1 rounded-sm text-[10px] font-bold hover:bg-blue-700">
                            + ADD ACTION
                        </button>

                        {/* HISTORY LOG */}
                        <div className="mt-2 bg-slate-50 p-2 rounded border border-slate-200">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] font-bold text-slate-400">HISTORY LOG</span>
                                <button onClick={() => setActionHistory('')} className="text-[9px] text-red-400 hover:text-red-600">CLEAR</button>
                            </div>
                            <div className="max-h-24 overflow-y-auto font-mono text-[10px] space-y-0.5">
                                {actionHistory.split('\n').filter(s => s.trim()).map((line, i) => (
                                    <div key={i} className="text-slate-600">{line}</div>
                                ))}
                                {actionHistory.length === 0 && <span className="text-slate-300 italic">No actions recorded</span>}
                            </div>
                        </div>

                        {/* Navigation Buttons Grid */}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <button
                                onClick={handleNextAction}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 rounded-sm text-[10px]"
                            >
                                ➡️ Next Action
                            </button>
                            <button
                                onClick={handleNextStage}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 rounded-sm text-[10px]"
                            >
                                ⬇️ Next Street
                            </button>
                        </div>
                    </div>
                </section>

                {/* SOLUTION */}
                <section className="bg-slate-200 p-2 border border-slate-300 rounded-sm mt-2">
                    <div className="flex gap-1 mb-2">
                        {['Fold', 'Call', 'Raise'].map(a => (
                            <button key={a} onClick={() => setCorrectAction(a as Action)} className={cn("flex-1 p-1 border text-[10px] uppercase font-bold", correctAction === a ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-300")}>{a}</button>
                        ))}
                    </div>
                    <textarea value={explanation} onChange={e => setExplanation(e.target.value)} className="w-full border p-1 h-16 text-[10px]" placeholder="Explanation..." />
                </section>


            </div>

            {/* MODAL */}
            {activeSlot && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2">
                    <div className="bg-white p-2 rounded-sm w-full max-w-md shadow-xl border border-slate-400">
                        <div className="flex justify-between mb-2 border-b pb-1">
                            <span className="font-bold">SELECT CARD</span>
                            <button onClick={() => setActiveSlot(null)}>CLOSE</button>
                        </div>
                        <CardMatrix selectedCards={[...heroCards, ...boardCards, ...villains.flatMap(v => v.cards)]} onSelectCard={handleCardSelect} maxSelection={52} />
                    </div>
                </div>
            )}
        </div>
    );
}

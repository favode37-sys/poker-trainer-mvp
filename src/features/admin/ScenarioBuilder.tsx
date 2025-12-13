import { useState } from 'react';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { CardMatrix } from '@/components/ui/CardMatrix';
import { type Card, type Scenario, type Action, type Decision } from '@/lib/types';
import { createDeck, drawCards } from '@/lib/poker-engine';
import { scenarioStore } from '@/lib/scenario-store';
import { cn } from '@/lib/utils';
import { ArrowLeft, Plus, X, ArrowRight, Save, Copy } from 'lucide-react';

interface ScenarioBuilderProps {
    onBack: () => void;
}

interface Villain {
    id: string;
    position: string;
    stack?: number;
    chipsInFront?: number;
    action?: string;
}

interface ActionEntry {
    actor: string;
    action: string;
    amount?: number;
    isCorrect?: boolean;
    whyYes?: string;
    whyNot?: string;
    street?: Street;  // Track which street this action belongs to
}

type Street = 'preflop' | 'flop' | 'turn' | 'river';

export function ScenarioBuilder({ onBack }: ScenarioBuilderProps) {
    // --- ACCUMULATED HAND STAGES (for Seamless Deal) ---
    const [stages, setStages] = useState<Scenario[]>([]);

    // --- CURRENT EDITOR STATE ---
    const [heroCards, setHeroCards] = useState<Card[]>([]);
    const [heroPos, setHeroPos] = useState('BTN');
    const [villains, setVillains] = useState<Villain[]>([{ id: 'v1', position: 'BB', chipsInFront: 0 }]);
    const [street, setStreet] = useState<Street>('preflop');
    const [boardCards, setBoardCards] = useState<Card[]>([]);
    const [potSize, setPotSize] = useState(0);

    // Modals
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
    const [cardTarget, setCardTarget] = useState<'hero' | 'board'>('hero');

    // Action History
    const [actionHistory, setActionHistory] = useState<ActionEntry[]>([]);
    const [currentActor, setCurrentActor] = useState('hero');
    const [currentAction, setCurrentAction] = useState('Check');
    const [currentAmount, setCurrentAmount] = useState(0);

    // Hero Explanation
    const [whyYes, setWhyYes] = useState('');
    const [whyNot, setWhyNot] = useState('');

    // Save status
    const [saveMessage, setSaveMessage] = useState('');

    // --- LOGIC: BUILD CURRENT SCENARIO OBJECT ---
    const buildCurrentScenario = (): Scenario | null => {
        if (heroCards.length !== 2) return null;

        const heroActionEntry = actionHistory.find(a => a.actor === 'hero' && a.isCorrect);
        if (!heroActionEntry) return null;

        // Find the index of Hero's correct action
        const heroCorrectIndex = actionHistory.findIndex(a => a.actor === 'hero' && a.isCorrect);

        // Calculate Hero's chips in front BEFORE the correct action (previous bets/raises)
        const heroPreviousActions = actionHistory.slice(0, heroCorrectIndex).filter(a => a.actor === 'hero');
        const heroChipsFromPrevious = heroPreviousActions.reduce((sum, a) => sum + (a.amount || 0), 0);

        // Get villain's last action BEFORE hero's correct action
        const actionsBeforeHeroDecision = actionHistory.slice(0, heroCorrectIndex);

        const engineVillains = villains.map(v => {
            const lastVAction = [...actionsBeforeHeroDecision].reverse().find(a => a.actor === v.id);
            return {
                id: v.id,
                position: v.position,
                stack: 100,
                chipsInFront: (lastVAction?.amount) || 0,
                action: (lastVAction?.action) || 'Check',
                cards: [] as Card[]
            };
        });

        const mainVillain = engineVillains[0];

        // Calculate amount to call
        const villainBet = mainVillain?.chipsInFront || 0;
        const amountToCall = Math.max(0, villainBet - heroChipsFromPrevious);

        return {
            id: `manual_${Date.now()}_${stages.length}`,
            title: `Custom Hand - ${street.toUpperCase()}`,
            levelId: 'blitz',
            street,
            blinds: { sb: 0.5, bb: 1 },
            heroPosition: heroPos,
            villainPosition: mainVillain?.position || 'BB',
            heroCards: heroCards as [Card, Card],
            communityCards: [...boardCards],
            potSize: potSize || 1.5,
            heroChipsInFront: heroChipsFromPrevious,  // Hero's previous bets before decision
            villainChipsInFront: villainBet,
            heroStack: 100 - heroChipsFromPrevious,
            villains: engineVillains,
            villainAction: (mainVillain?.action || 'Check') as Action,
            amountToCall: amountToCall,
            defaultRaiseAmount: heroActionEntry.amount || 0,
            correctAction: heroActionEntry.action as Action,
            explanation_simple: heroActionEntry.whyYes || '',
            explanation_deep: heroActionEntry.whyNot || '',
            actionHistory: actionHistory.map(a => {
                const name = a.actor === 'hero' ? 'Hero' : villains.find(v => v.id === a.actor)?.position || 'V';
                return `${name} ${a.action} ${a.amount || ''}`.trim();
            })
        };
    };

    // --- ACTIONS ---
    const handleSaveHand = () => {
        if (heroCards.length !== 2) {
            setSaveMessage('❌ Add Hero Cards!');
            setTimeout(() => setSaveMessage(''), 2000);
            return;
        }

        if (stages.length === 0) {
            setSaveMessage('❌ Add at least one Hero action!');
            setTimeout(() => setSaveMessage(''), 2000);
            return;
        }

        // Build decisions array from captured stages
        const decisions: Decision[] = stages.map((stage, i) => ({
            heroChipsInFront: stage.heroChipsInFront || 0,
            villainChipsInFront: stage.villainChipsInFront || 0,
            villainAction: stage.villainAction || 'Check',
            amountToCall: stage.amountToCall,
            correctAction: stage.correctAction,
            defaultRaiseAmount: stage.defaultRaiseAmount,
            explanation_simple: stage.explanation_simple,
            explanation_deep: stage.explanation_deep,
            actionLabel: stage.actionHistory[stage.actionHistory.length - 1] || `Decision ${i + 1}`
        }));

        // Use the last stage as the base for the scenario
        const lastStage = stages[stages.length - 1];
        const mainVillain = villains[0];

        const scenario: Scenario = {
            id: `hand_${Date.now()}`,
            title: `Custom Hand - ${decisions.length} decisions`,
            levelId: 'blitz',
            street,
            blinds: { sb: 0.5, bb: 1 },
            heroPosition: heroPos,
            villainPosition: mainVillain?.position || 'BB',
            heroCards: heroCards as [Card, Card],
            communityCards: [...boardCards],
            potSize: potSize || 1.5,
            heroChipsInFront: decisions[0]?.heroChipsInFront || 0,
            villainChipsInFront: decisions[0]?.villainChipsInFront || 0,
            heroStack: 100,
            villains: villains.map(v => ({
                id: v.id,
                position: v.position,
                stack: 100,
                chipsInFront: 0,
                action: 'Check',
                cards: [] as Card[]
            })),
            villainAction: decisions[0]?.villainAction || 'Check',
            amountToCall: decisions[0]?.amountToCall || 0,
            defaultRaiseAmount: decisions[0]?.defaultRaiseAmount || 0,
            correctAction: decisions[0]?.correctAction || 'Check',
            explanation_simple: decisions[0]?.explanation_simple || '',
            explanation_deep: decisions[0]?.explanation_deep || '',
            actionHistory: lastStage?.actionHistory || [],
            decisions: decisions  // NEW: All decision points in one scenario!
        };

        scenarioStore.addBatch([scenario]);

        setSaveMessage(`✅ Hand Saved! (${decisions.length} decisions)`);
        setTimeout(() => {
            setSaveMessage('');
            setStages([]);
            setStreet('preflop');
            setBoardCards([]);
            setHeroCards([]);
            setActionHistory([]);
            setPotSize(0);
        }, 2000);
    };

    const handleNextStreet = () => {
        const currentStage = buildCurrentScenario();
        if (!currentStage) {
            setSaveMessage('❌ Setup correct action before moving to next street!');
            setTimeout(() => setSaveMessage(''), 2000);
            return;
        }

        setStages([...stages, currentStage]);

        const newPot = potSize + (currentStage.heroChipsInFront || 0) +
            (currentStage.villains?.reduce((sum, v) => sum + (v.chipsInFront || 0), 0) || 0);

        setPotSize(newPot);

        const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
        const nextIdx = streetOrder.indexOf(street) + 1;
        if (nextIdx >= streetOrder.length) return;
        const nextStreet = streetOrder[nextIdx];

        setStreet(nextStreet);

        const deck = createDeck();
        const used = [...heroCards, ...boardCards];
        const count = nextStreet === 'flop' ? 3 : 1;
        const { drawn } = drawCards(deck, count, used);
        setBoardCards([...boardCards, ...drawn]);

        setActionHistory([]);
        setWhyYes('');
        setWhyNot('');
    };

    // --- BOILERPLATE HANDLERS ---
    const handleRandomizeHero = () => {
        const { drawn } = drawCards(createDeck(), 2, []);
        setHeroCards(drawn);
    };
    const handleRandomizeBoard = () => {
        const count = street === 'flop' ? 3 : street === 'turn' ? 4 : street === 'river' ? 5 : 0;
        if (count === 0) return;
        setBoardCards(drawCards(createDeck(), count, heroCards).drawn);
    };
    const handleCardClick = (target: 'hero' | 'board', index: number) => {
        setCardTarget(target); setActiveCardIndex(index); setIsCardModalOpen(true);
    };
    const handleCardSelect = (card: Card) => {
        if (activeCardIndex === null) return;
        if (cardTarget === 'hero') {
            const n = [...heroCards]; n[activeCardIndex] = card; setHeroCards(n);
        } else {
            const n = [...boardCards]; n[activeCardIndex] = card; setBoardCards(n);
        }
        setIsCardModalOpen(false); setActiveCardIndex(null);
    };
    const addVillain = () => { if (villains.length < 5) setVillains([...villains, { id: `v${Date.now()}`, position: 'UTG' }]); };
    const removeVillain = (id: string) => setVillains(villains.filter(v => v.id !== id));
    const updateVillainPos = (id: string, pos: string) => setVillains(villains.map(v => v.id === id ? { ...v, position: pos } : v));
    const handleStreetChange = (s: Street) => { setStreet(s); if (s === 'preflop') setBoardCards([]); };
    const getBoardSlotCount = () => street === 'flop' ? 3 : street === 'turn' ? 4 : street === 'river' ? 5 : 0;
    const getActorLabel = (actor: string) => {
        if (actor === 'hero') return `Hero (${heroPos})`;
        const v = villains.find(v => v.id === actor);
        return v ? `V: ${v.position}` : actor;
    };

    const addActionToHistory = () => {
        const entry: ActionEntry = {
            actor: currentActor,
            action: currentAction,
            street: street  // Save which street this action belongs to
        };
        if (['Bet', 'Raise', 'All-in'].includes(currentAction)) entry.amount = currentAmount;

        // Every Hero action is automatically marked as correct
        if (currentActor === 'hero') {
            entry.isCorrect = true;
            entry.whyYes = whyYes;
            entry.whyNot = whyNot;
        }

        // Add to history first
        const newHistory = [...actionHistory, entry];
        setActionHistory(newHistory);

        // If this is a Hero action → auto-capture stage
        if (currentActor === 'hero') {
            // --- CUMULATIVE CHIPS CALCULATION ---
            // Get chips already in pot from previous STREETS (stages on different streets)
            const previousStreetsStages = stages.filter(s => s.street !== street);
            const previousStreetsHeroChips = previousStreetsStages.reduce((sum, s) =>
                sum + (s.heroChipsInFront || 0) + (s.defaultRaiseAmount || 0), 0
            );
            const previousStreetsVillainChips = previousStreetsStages.reduce((sum, s) =>
                sum + (s.villainChipsInFront || 0), 0
            );

            // Find the index of THIS hero action (the one we just added)
            const heroCorrectIndex = newHistory.length - 1;

            // Filter only actions on CURRENT street before this hero action
            const actionsThisStreetBeforeHero = newHistory
                .slice(0, heroCorrectIndex)
                .filter(a => a.street === street);

            // Hero's chips on CURRENT street (before this action) 
            const heroChipsThisStreet = actionsThisStreetBeforeHero
                .filter(a => a.actor === 'hero')
                .reduce((sum, a) => sum + (a.amount || 0), 0);

            // Actions before this Hero decision (on current street only)

            const engineVillains = villains.map(v => {
                const lastVAction = [...actionsThisStreetBeforeHero].reverse().find(a => a.actor === v.id);
                return {
                    id: v.id,
                    position: v.position,
                    stack: 100,
                    chipsInFront: (lastVAction?.amount) || 0,
                    action: (lastVAction?.action) || 'Check',
                    cards: [] as Card[]
                };
            });

            const mainVillain = engineVillains[0];

            // For this stage, we want to show state BEFORE Hero's action:
            // - Villain's chips from their last action
            // - Hero's chips from their previous actions on this street
            const villainBet = mainVillain?.chipsInFront || 0;
            const amountToCall = Math.max(0, villainBet - heroChipsThisStreet);

            const stage: Scenario = {
                id: `manual_${Date.now()}_${stages.length}`,
                title: `Custom Hand - Stage ${stages.length + 1}`,
                levelId: 'blitz',
                street,
                blinds: { sb: 0.5, bb: 1 },
                heroPosition: heroPos,
                villainPosition: mainVillain?.position || 'BB',
                heroCards: heroCards as [Card, Card],
                communityCards: [...boardCards],
                potSize: (potSize || 1.5) + previousStreetsHeroChips + previousStreetsVillainChips,
                heroChipsInFront: heroChipsThisStreet,
                villainChipsInFront: villainBet,
                heroStack: 100 - previousStreetsHeroChips - heroChipsThisStreet,
                villains: engineVillains,
                villainAction: (mainVillain?.action || 'Check') as Action,
                amountToCall: amountToCall,
                defaultRaiseAmount: entry.amount || 0,
                correctAction: entry.action as Action,
                explanation_simple: entry.whyYes || '',
                explanation_deep: entry.whyNot || '',
                actionHistory: newHistory.map(a => {
                    const name = a.actor === 'hero' ? 'Hero' : villains.find(v => v.id === a.actor)?.position || 'V';
                    return `${name} ${a.action} ${a.amount || ''}`.trim();
                })
            };

            setStages([...stages, stage]);
            setSaveMessage(`✅ Stage ${stages.length + 1} captured!`);
            setTimeout(() => setSaveMessage(''), 1500);

            // Reset explanation fields
            setWhyYes('');
            setWhyNot('');
        }
    };

    const isHeroSelected = currentActor === 'hero';
    const needsAmount = ['Bet', 'Raise', 'All-in'].includes(currentAction);

    return (
        <div className="min-h-screen bg-slate-100 p-4 font-mono text-xs">
            <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" /> back
            </button>

            {/* STAGE INDICATOR */}
            <div className="flex gap-2 mb-4">
                {stages.map((_, i) => (
                    <div key={i} className="px-2 py-1 bg-green-200 text-green-800 rounded text-[10px] font-bold">Stage {i + 1}</div>
                ))}
                <div className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-[10px] font-bold">Current: {street.toUpperCase()}</div>
            </div>

            <div className="flex gap-8 mb-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2"><span className="text-slate-500">hero</span><button onClick={handleRandomizeHero} className="text-blue-500">[rnd]</button></div>
                    <div className="flex gap-2">
                        {[0, 1].map(i => (
                            <button key={i} onClick={() => handleCardClick('hero', i)} className={cn("w-12 h-16 rounded border flex items-center justify-center bg-white", heroCards[i] ? "border-slate-200" : "border-dashed border-slate-300")}>
                                {heroCards[i] ? <PlayingCard card={heroCards[i]} size="sm" /> : <span className="text-slate-300">?</span>}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">pos</span>
                        <select value={heroPos} onChange={e => setHeroPos(e.target.value)} className="bg-white border rounded px-2 py-1">
                            {['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'].map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2"><span className="text-slate-500">street</span>
                        <select value={street} onChange={e => handleStreetChange(e.target.value as Street)} className="bg-white border rounded px-2 py-1">
                            {['preflop', 'flop', 'turn', 'river'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button onClick={handleRandomizeBoard} className="text-blue-500">[rnd]</button>
                    </div>
                    {street !== 'preflop' && (
                        <div className="flex gap-1">
                            {Array.from({ length: getBoardSlotCount() }).map((_, i) => (
                                <button key={i} onClick={() => handleCardClick('board', i)} className={cn("w-10 h-14 rounded border flex items-center justify-center bg-white", boardCards[i] ? "border-slate-200" : "border-dashed border-slate-300")}>
                                    {boardCards[i] ? <PlayingCard card={boardCards[i]} size="sm" className="scale-75" /> : <span className="text-slate-300">?</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2"><span className="text-slate-500">villains</span><button onClick={addVillain} className="text-blue-500"><Plus className="w-3 h-3" /></button></div>
                    {villains.map(v => (
                        <div key={v.id} className="flex items-center gap-1">
                            <select value={v.position} onChange={e => updateVillainPos(v.id, e.target.value)} className="bg-white border rounded px-2 py-1">
                                {['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'].map(p => <option key={p}>{p}</option>)}
                            </select>
                            {villains.length > 1 && <button onClick={() => removeVillain(v.id)}><X className="w-3 h-3 text-slate-400" /></button>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <span className="text-slate-500 block mb-2">action history (current street)</span>
                <div className="bg-white border border-slate-200 rounded p-2 min-h-[60px] max-h-[120px] overflow-y-auto space-y-1">
                    {actionHistory.length === 0 && <span className="text-slate-300">no actions yet</span>}
                    {actionHistory.map((entry, i) => (
                        <div key={i} className={cn("text-slate-600", entry.isCorrect && "text-green-600 font-bold")}>
                            {getActorLabel(entry.actor)} → {entry.action} {entry.amount && entry.amount} {entry.isCorrect && "✓"}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <select value={currentActor} onChange={e => setCurrentActor(e.target.value)} className={cn("bg-white border rounded px-2 py-1", isHeroSelected ? "border-green-400" : "border-slate-200")}>
                    <option value="hero">Hero ({heroPos})</option>
                    {villains.map(v => <option key={v.id} value={v.id}>V: {v.position}</option>)}
                </select>

                <select value={currentAction} onChange={e => setCurrentAction(e.target.value)} className="bg-white border rounded px-2 py-1">
                    {['Fold', 'Check', 'Call', 'Bet', 'Raise', 'All-in'].map(a => <option key={a}>{a}</option>)}
                </select>
                {needsAmount && <input type="number" value={currentAmount} onChange={e => setCurrentAmount(+e.target.value)} className="bg-white border w-20 px-2 py-1" placeholder="amt" />}
                <button onClick={addActionToHistory} className="bg-slate-700 text-white px-3 py-1 rounded">save</button>
                {street !== 'river' && (
                    <button onClick={handleNextStreet} className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 ml-auto">
                        next street (capture) <ArrowRight className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Explanations - show when Hero is selected */}
            {isHeroSelected && (
                <div className="space-y-2 max-w-md">
                    <textarea value={whyYes} onChange={e => setWhyYes(e.target.value)} className="w-full bg-white border border-green-200 rounded p-2 h-16" placeholder="Why Yes? (почему это правильное действие)" />
                    <textarea value={whyNot} onChange={e => setWhyNot(e.target.value)} className="w-full bg-white border border-red-200 rounded p-2 h-16" placeholder="Why Not? (почему другое действие неправильно)" />
                </div>
            )}

            <div className="mt-8 pt-4 border-t border-slate-200 flex gap-4 flex-wrap">
                <button onClick={handleSaveHand} className="bg-green-600 text-white px-6 py-2 rounded flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Seamless Hand ({stages.length + 1} stages)
                </button>
                <button
                    onClick={() => {
                        const data = {
                            heroCards,
                            heroPosition: heroPos,
                            villains: villains.map(v => ({ position: v.position, id: v.id })),
                            street,
                            boardCards,
                            potSize,
                            actionHistory,
                            stages: stages.map(s => ({
                                street: s.street,
                                heroChipsInFront: s.heroChipsInFront,
                                villainChipsInFront: s.villainChipsInFront,
                                villainAction: s.villainAction,
                                correctAction: s.correctAction,
                                amountToCall: s.amountToCall
                            }))
                        };
                        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                        setSaveMessage('📋 Copied to clipboard!');
                        setTimeout(() => setSaveMessage(''), 1500);
                    }}
                    className="bg-slate-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <Copy className="w-4 h-4" /> Copy JSON
                </button>
                {saveMessage && <div className={cn("px-3 py-1 rounded inline-block", saveMessage.includes('✅') || saveMessage.includes('📋') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{saveMessage}</div>}
            </div>

            {isCardModalOpen && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-4 rounded-lg max-w-md w-full">
                        <div className="flex justify-between mb-3">
                            <span className="font-bold text-slate-600">Select Card</span>
                            <button onClick={() => setIsCardModalOpen(false)} className="text-slate-400">close</button>
                        </div>
                        <CardMatrix selectedCards={[...heroCards, ...boardCards]} onSelectCard={handleCardSelect} maxSelection={52} />
                    </div>
                </div>
            )}
        </div>
    );
}

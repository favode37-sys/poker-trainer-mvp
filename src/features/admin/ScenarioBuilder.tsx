import { useState } from 'react';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { CardMatrix } from '@/components/ui/CardMatrix';
import { type Card, type Scenario, type Action } from '@/lib/types';
import { createDeck, drawCards } from '@/lib/poker-engine';
import { scenarioStore } from '@/lib/scenario-store';
import { cn } from '@/lib/utils';
import { ArrowLeft, Plus, X, ArrowRight, Save } from 'lucide-react';

interface ScenarioBuilderProps {
    onBack: () => void;
}

interface Villain {
    id: string;
    position: string;
}

interface ActionEntry {
    actor: string;
    action: string;
    amount?: number;
    isCorrect?: boolean;
    whyYes?: string;
    whyNot?: string;
}

type Street = 'preflop' | 'flop' | 'turn' | 'river';

export function ScenarioBuilder({ onBack }: ScenarioBuilderProps) {
    const [heroCards, setHeroCards] = useState<Card[]>([]);
    const [heroPos, setHeroPos] = useState('BTN');
    const [villains, setVillains] = useState<Villain[]>([{ id: 'v1', position: 'BB' }]);
    const [street, setStreet] = useState<Street>('preflop');
    const [boardCards, setBoardCards] = useState<Card[]>([]);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
    const [cardTarget, setCardTarget] = useState<'hero' | 'board'>('hero');

    // Action History
    const [actionHistory, setActionHistory] = useState<ActionEntry[]>([]);
    const [currentActor, setCurrentActor] = useState('hero');
    const [currentAction, setCurrentAction] = useState('Check');
    const [currentAmount, setCurrentAmount] = useState(0);

    // Hero Explanation (shows when Hero is selected)
    const [whyYes, setWhyYes] = useState('');
    const [whyNot, setWhyNot] = useState('');

    // Save status
    const [saveMessage, setSaveMessage] = useState('');

    // Find the hero's correct action from history
    const getHeroCorrectAction = (): { action: Action; amount?: number } | null => {
        const heroAction = actionHistory.find(a => a.actor === 'hero' && a.isCorrect);
        if (!heroAction) return null;
        return {
            action: heroAction.action as Action,
            amount: heroAction.amount
        };
    };

    // Save hand to database
    const handleSaveHand = () => {
        // Validation
        if (heroCards.length !== 2) {
            setSaveMessage('❌ Выберите карты Hero');
            setTimeout(() => setSaveMessage(''), 2000);
            return;
        }

        const heroCorrect = getHeroCorrectAction();
        if (!heroCorrect) {
            setSaveMessage('❌ Добавьте правильное действие Hero');
            setTimeout(() => setSaveMessage(''), 2000);
            return;
        }

        // Build scenario
        const heroActionEntry = actionHistory.find(a => a.actor === 'hero' && a.isCorrect);

        // Calculate pot from action history
        const potSize = actionHistory.reduce((sum, a) => sum + (a.amount || 0), 0);

        // Get villain info
        const mainVillain = villains[0];
        const villainAction = actionHistory.find(a => a.actor === mainVillain?.id);

        const scenario: Scenario = {
            id: `manual_${Date.now()}`,
            title: `Custom Hand - ${heroPos} vs ${mainVillain?.position || 'BB'}`,
            levelId: 'blitz',
            street,
            blinds: { sb: 0.5, bb: 1 },
            heroPosition: heroPos,
            villainPosition: mainVillain?.position || 'BB',
            heroCards: heroCards as [Card, Card],
            communityCards: [...boardCards],
            potSize: potSize || 2.5,
            heroChipsInFront: 0,
            villainChipsInFront: villainAction?.amount || 0,
            heroStack: 100,
            villainAction: (villainAction?.action || 'Check') as Action,
            amountToCall: villainAction?.amount || 0,
            defaultRaiseAmount: heroCorrect.amount || 0,
            correctAction: heroCorrect.action,
            explanation_simple: heroActionEntry?.whyYes || '',
            explanation_deep: heroActionEntry?.whyNot || '',
            actionHistory: actionHistory.map(a => `${a.actor === 'hero' ? 'Hero' : 'V'} ${a.action}${a.amount ? ' ' + a.amount : ''}`)
        };

        // Save to store
        scenarioStore.addBatch([scenario]);

        setSaveMessage('✅ Раздача сохранена в базу Blitz!');
        setTimeout(() => setSaveMessage(''), 3000);

        // Reset form
        setHeroCards([]);
        setBoardCards([]);
        setActionHistory([]);
        setStreet('preflop');
    };

    const handleRandomizeHero = () => {
        const deck = createDeck();
        const { drawn } = drawCards(deck, 2, []);
        setHeroCards(drawn);
    };

    const handleRandomizeBoard = () => {
        const count = street === 'flop' ? 3 : street === 'turn' ? 4 : street === 'river' ? 5 : 0;
        if (count === 0) return;
        const deck = createDeck();
        const { drawn } = drawCards(deck, count, heroCards);
        setBoardCards(drawn);
    };

    const handleCardClick = (target: 'hero' | 'board', index: number) => {
        setCardTarget(target);
        setActiveCardIndex(index);
        setIsCardModalOpen(true);
    };

    const handleCardSelect = (card: Card) => {
        if (activeCardIndex === null) return;
        if (cardTarget === 'hero') {
            const newCards = [...heroCards];
            newCards[activeCardIndex] = card;
            setHeroCards(newCards);
        } else {
            const newCards = [...boardCards];
            newCards[activeCardIndex] = card;
            setBoardCards(newCards);
        }
        setIsCardModalOpen(false);
        setActiveCardIndex(null);
    };

    const addVillain = () => {
        if (villains.length >= 5) return;
        setVillains([...villains, { id: `v${Date.now()}`, position: 'UTG' }]);
    };

    const removeVillain = (id: string) => {
        setVillains(villains.filter(v => v.id !== id));
    };

    const updateVillainPos = (id: string, pos: string) => {
        setVillains(villains.map(v => v.id === id ? { ...v, position: pos } : v));
    };

    const handleStreetChange = (newStreet: Street) => {
        setStreet(newStreet);
        if (newStreet === 'preflop') {
            setBoardCards([]);
        }
    };

    const handleNextStreet = () => {
        const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
        const currentIndex = streetOrder.indexOf(street);
        if (currentIndex >= streetOrder.length - 1) return; // Already river

        const nextStreet = streetOrder[currentIndex + 1];
        setStreet(nextStreet);

        // Deal new cards for the street
        const deck = createDeck();
        const usedCards = [...heroCards, ...boardCards];

        if (nextStreet === 'flop') {
            const { drawn } = drawCards(deck, 3, usedCards);
            setBoardCards(drawn);
        } else {
            // Turn or River - add 1 card
            const { drawn } = drawCards(deck, 1, usedCards);
            setBoardCards([...boardCards, ...drawn]);
        }
    };

    const getBoardSlotCount = () => {
        if (street === 'flop') return 3;
        if (street === 'turn') return 4;
        if (street === 'river') return 5;
        return 0;
    };

    const getActorLabel = (actor: string) => {
        if (actor === 'hero') return `Hero (${heroPos})`;
        const v = villains.find(v => v.id === actor);
        return v ? `V: ${v.position}` : actor;
    };

    const isHeroSelected = currentActor === 'hero';

    const addActionToHistory = () => {
        const entry: ActionEntry = {
            actor: currentActor,
            action: currentAction,
        };
        if (['Bet', 'Raise', 'All-in'].includes(currentAction)) {
            entry.amount = currentAmount;
        }
        // If Hero action, mark as correct and save explanations
        if (isHeroSelected) {
            entry.isCorrect = true;
            entry.whyYes = whyYes;
            entry.whyNot = whyNot;
        }
        setActionHistory([...actionHistory, entry]);

        // Reset explanations after saving
        if (isHeroSelected) {
            setWhyYes('');
            setWhyNot('');
        }
    };

    const needsAmount = ['Bet', 'Raise', 'All-in'].includes(currentAction);
    const canNextStreet = street !== 'river';

    return (
        <div className="min-h-screen bg-slate-100 p-4 font-mono text-xs">

            {/* BACK */}
            <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" /> back
            </button>

            {/* MAIN LAYOUT */}
            <div className="flex gap-8 mb-6">

                {/* LEFT: HERO */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">hero</span>
                        <button onClick={handleRandomizeHero} className="text-blue-500">[rnd]</button>
                    </div>

                    <div className="flex gap-2">
                        {[0, 1].map((index) => (
                            <button
                                key={index}
                                onClick={() => handleCardClick('hero', index)}
                                className={cn(
                                    "w-12 h-16 rounded border flex items-center justify-center bg-white",
                                    heroCards[index] ? "border-slate-200" : "border-dashed border-slate-300"
                                )}
                            >
                                {heroCards[index] ? (
                                    <PlayingCard card={heroCards[index]} size="sm" />
                                ) : (
                                    <span className="text-slate-300">?</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">pos</span>
                        <select
                            value={heroPos}
                            onChange={e => setHeroPos(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700"
                        >
                            <option>SB</option>
                            <option>BB</option>
                            <option>UTG</option>
                            <option>MP</option>
                            <option>CO</option>
                            <option>BTN</option>
                        </select>
                    </div>
                </div>

                {/* CENTER: STREET & BOARD */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">street</span>
                        <select
                            value={street}
                            onChange={e => handleStreetChange(e.target.value as Street)}
                            className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700"
                        >
                            <option value="preflop">Preflop</option>
                            <option value="flop">Flop</option>
                            <option value="turn">Turn</option>
                            <option value="river">River</option>
                        </select>
                    </div>

                    {street !== 'preflop' && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500">board</span>
                                <button onClick={handleRandomizeBoard} className="text-blue-500">[rnd]</button>
                            </div>

                            <div className="flex gap-1">
                                {Array.from({ length: getBoardSlotCount() }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleCardClick('board', index)}
                                        className={cn(
                                            "w-10 h-14 rounded border flex items-center justify-center bg-white",
                                            boardCards[index] ? "border-slate-200" : "border-dashed border-slate-300"
                                        )}
                                    >
                                        {boardCards[index] ? (
                                            <PlayingCard card={boardCards[index]} size="sm" className="scale-75" />
                                        ) : (
                                            <span className="text-slate-300 text-[10px]">?</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* RIGHT: VILLAINS */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">villains</span>
                        <button onClick={addVillain} className="text-blue-500"><Plus className="w-3 h-3" /></button>
                    </div>

                    {villains.map((v) => (
                        <div key={v.id} className="flex items-center gap-1">
                            <select
                                value={v.position}
                                onChange={e => updateVillainPos(v.id, e.target.value)}
                                className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700"
                            >
                                <option>SB</option>
                                <option>BB</option>
                                <option>UTG</option>
                                <option>MP</option>
                                <option>CO</option>
                                <option>BTN</option>
                            </select>
                            {villains.length > 1 && (
                                <button onClick={() => removeVillain(v.id)} className="text-slate-400 hover:text-red-500">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ACTION HISTORY */}
            <div className="mb-4">
                <span className="text-slate-500 block mb-2">action history</span>
                <div className="bg-white border border-slate-200 rounded p-2 min-h-[60px] max-h-[120px] overflow-y-auto">
                    {actionHistory.length === 0 ? (
                        <span className="text-slate-300">no actions yet</span>
                    ) : (
                        <div className="space-y-1">
                            {actionHistory.map((entry, i) => (
                                <div key={i} className={cn(
                                    "text-slate-600",
                                    entry.isCorrect && "text-green-600 font-bold"
                                )}>
                                    {getActorLabel(entry.actor)} → {entry.action}
                                    {entry.amount !== undefined && ` ${entry.amount}`}
                                    {entry.isCorrect && " ✓"}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ADD ACTION ROW */}
            <div className="flex items-center gap-2 mb-4">
                {/* Actor */}
                <select
                    value={currentActor}
                    onChange={e => setCurrentActor(e.target.value)}
                    className={cn(
                        "bg-white border rounded px-2 py-1",
                        isHeroSelected ? "border-green-400 text-green-700" : "border-slate-200 text-slate-700"
                    )}
                >
                    <option value="hero">Hero ({heroPos})</option>
                    {villains.map(v => (
                        <option key={v.id} value={v.id}>V: {v.position}</option>
                    ))}
                </select>

                {/* Action */}
                <select
                    value={currentAction}
                    onChange={e => setCurrentAction(e.target.value)}
                    className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700"
                >
                    <option>Fold</option>
                    <option>Check</option>
                    <option>Call</option>
                    <option>Bet</option>
                    <option>Raise</option>
                    <option>All-in</option>
                </select>

                {/* Amount (if needed) */}
                {needsAmount && (
                    <input
                        type="number"
                        value={currentAmount}
                        onChange={e => setCurrentAmount(+e.target.value)}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 w-20"
                        placeholder="amount"
                    />
                )}

                {/* Save Button */}
                <button
                    onClick={addActionToHistory}
                    className="bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-600"
                >
                    save
                </button>

                {/* Next Street Button */}
                {canNextStreet && (
                    <button
                        onClick={handleNextStreet}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 flex items-center gap-1"
                    >
                        next street <ArrowRight className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* HERO EXPLANATIONS (only when Hero is selected) */}
            {isHeroSelected && (
                <div className="space-y-2 max-w-md">
                    <div>
                        <span className="text-green-600 block mb-1">why yes?</span>
                        <textarea
                            value={whyYes}
                            onChange={e => setWhyYes(e.target.value)}
                            className="w-full bg-white border border-green-200 rounded p-2 text-slate-700 h-16 resize-none"
                            placeholder="почему это действие правильное..."
                        />
                    </div>
                    <div>
                        <span className="text-red-500 block mb-1">why not?</span>
                        <textarea
                            value={whyNot}
                            onChange={e => setWhyNot(e.target.value)}
                            className="w-full bg-white border border-red-200 rounded p-2 text-slate-700 h-16 resize-none"
                            placeholder="пояснение если игрок выберет другое действие..."
                        />
                    </div>
                </div>
            )}

            {/* SAVE HAND BUTTON */}
            <div className="mt-8 pt-4 border-t border-slate-200">
                <button
                    onClick={handleSaveHand}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-500 flex items-center gap-2"
                >
                    <Save className="w-4 h-4" /> Сохранить раздачу
                </button>

                {saveMessage && (
                    <div className={cn(
                        "mt-2 px-3 py-1 rounded inline-block",
                        saveMessage.includes('✅') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                        {saveMessage}
                    </div>
                )}
            </div>

            {/* CARD MODAL */}
            {isCardModalOpen && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-4 rounded-lg max-w-md w-full">
                        <div className="flex justify-between mb-3">
                            <span className="font-bold text-slate-600">Select Card</span>
                            <button onClick={() => setIsCardModalOpen(false)} className="text-slate-400">close</button>
                        </div>
                        <CardMatrix
                            selectedCards={[...heroCards, ...boardCards]}
                            onSelectCard={handleCardSelect}
                            maxSelection={52}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

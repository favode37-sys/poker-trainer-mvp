import { useState } from 'react';
import { chartStore, type Chart } from '@/lib/chart-store';
import { cn } from '@/lib/utils';

interface ChartEditorProps {
    onBack: () => void;
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export function ChartEditor({ onBack }: ChartEditorProps) {
    const [mode, setMode] = useState<'cash' | 'mtt' | 'spin'>('cash');
    const [position, setPosition] = useState('BTN');
    const [stack, setStack] = useState(100);
    const [situation, setSituation] = useState('Open Raise');
    const [selectedHands, setSelectedHands] = useState<Set<string>>(new Set());
    const [status, setStatus] = useState('');

    const toggleHand = (hand: string) => {
        const newSet = new Set(selectedHands);
        if (newSet.has(hand)) newSet.delete(hand);
        else newSet.add(hand);
        setSelectedHands(newSet);
    };

    const handleSave = () => {
        if (selectedHands.size === 0) {
            setStatus("Empty range!");
            return;
        }
        const chart: Chart = {
            id: `chart_${Date.now()}`,
            title: `${mode.toUpperCase()} ${position} ${situation}`,
            mode,
            position,
            stackDepth: stack,
            situation,
            range: Array.from(selectedHands)
        };
        chartStore.save(chart);
        setStatus("Saved!");
        setTimeout(() => setStatus(''), 2000);
    };

    const selectGroup = (type: 'all' | 'clear' | 'pairs' | 'suited' | 'broadway') => {
        const newSet = new Set(type === 'all' || type === 'pairs' || type === 'suited' || type === 'broadway' ? selectedHands : []);

        if (type === 'clear') {
            setSelectedHands(new Set());
            return;
        }

        RANKS.forEach((r1, i) => {
            RANKS.forEach((r2, j) => {
                let hand = "";
                let isPair = i === j;
                let isSuited = i < j;

                if (isPair) hand = r1 + r2;
                else if (isSuited) hand = r1 + r2 + 's';
                else hand = r2 + r1 + 'o';

                if (type === 'all') newSet.add(hand);
                if (type === 'pairs' && isPair) newSet.add(hand);
                if (type === 'suited' && isSuited) newSet.add(hand);
                if (type === 'broadway' && i <= 4 && j <= 4) newSet.add(hand); // A-T
            });
        });
        setSelectedHands(newSet);
    };

    return (
        <div className="min-h-screen bg-slate-100 p-2 font-mono text-xs text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 bg-white p-2 border border-slate-300 rounded-sm sticky top-0 z-20 shadow-sm">
                <button onClick={onBack} className="hover:underline font-bold text-slate-600">← BACK</button>
                <span className="font-bold text-slate-500">CHART EDITOR</span>
                <button onClick={handleSave} className="bg-slate-800 text-white px-3 py-1 rounded-sm hover:bg-slate-700">SAVE</button>
            </div>

            {status && <div className="text-center bg-green-100 text-green-800 p-1 mb-2 border border-green-300 rounded-sm">{status}</div>}

            <div className="max-w-md mx-auto space-y-2">
                {/* Config */}
                <section className="bg-white p-2 border border-slate-300 rounded-sm grid grid-cols-4 gap-2">
                    <div>
                        <label className="block text-[9px] text-slate-400">MODE</label>
                        <select value={mode} onChange={e => setMode(e.target.value as any)} className="w-full border p-1 rounded-sm"><option value="cash">CASH</option><option value="mtt">MTT</option><option value="spin">SPIN</option></select>
                    </div>
                    <div>
                        <label className="block text-[9px] text-slate-400">STACK (BB)</label>
                        <input type="number" value={stack} onChange={e => setStack(+e.target.value)} className="w-full border p-1 rounded-sm" />
                    </div>
                    <div>
                        <label className="block text-[9px] text-slate-400">POS</label>
                        <select value={position} onChange={e => setPosition(e.target.value)} className="w-full border p-1 rounded-sm"><option>BTN</option><option>SB</option><option>BB</option><option>UTG</option><option>MP</option><option>CO</option></select>
                    </div>
                    <div>
                        <label className="block text-[9px] text-slate-400">ACTION</label>
                        <input type="text" value={situation} onChange={e => setSituation(e.target.value)} className="w-full border p-1 rounded-sm" />
                    </div>
                </section>

                {/* Tools */}
                <div className="flex gap-1 overflow-x-auto pb-1">
                    <button onClick={() => selectGroup('all')} className="px-2 py-1 border bg-white hover:bg-slate-50">[ALL]</button>
                    <button onClick={() => selectGroup('clear')} className="px-2 py-1 border bg-white hover:bg-red-50 text-red-600">[CLR]</button>
                    <button onClick={() => selectGroup('pairs')} className="px-2 py-1 border bg-white hover:bg-slate-50">[PAIRS]</button>
                    <button onClick={() => selectGroup('suited')} className="px-2 py-1 border bg-white hover:bg-slate-50">[SUITED]</button>
                    <button onClick={() => selectGroup('broadway')} className="px-2 py-1 border bg-white hover:bg-slate-50">[BROAD]</button>
                </div>

                {/* Grid */}
                <div className="bg-white p-1 border border-slate-300 rounded-sm">
                    <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-[1px] bg-slate-200 border border-slate-200">
                        {RANKS.map((r1, i) => (
                            RANKS.map((r2, j) => {
                                let hand = "";
                                if (i === j) hand = r1 + r1;
                                else if (i < j) hand = r1 + r2 + 's';
                                else hand = r2 + r1 + 'o';

                                const isSelected = selectedHands.has(hand);

                                return (
                                    <button
                                        key={i + '-' + j}
                                        onMouseDown={() => toggleHand(hand)} // MouseDown for faster clicking
                                        className={cn(
                                            "aspect-square flex items-center justify-center text-[7px] sm:text-[9px] font-bold leading-none select-none transition-colors",
                                            isSelected ? "bg-emerald-500 text-white" : "bg-white text-slate-300 hover:bg-slate-50"
                                        )}
                                        title={hand}
                                    >
                                        {hand}
                                    </button>
                                );
                            })
                        ))}
                    </div>
                </div>

                {/* Info Footer */}
                <div className="text-center text-slate-400 text-[10px]">
                    {selectedHands.size} hands selected ({Math.round((selectedHands.size / 169) * 100)}% cells)
                </div>
            </div>
        </div>
    );
}

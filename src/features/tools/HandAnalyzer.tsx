import { useState } from 'react';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import { CardMatrix } from '@/components/ui/CardMatrix';
import { Button } from '@/components/ui/Button';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { geminiService } from '@/lib/gemini';
import { type Card } from '@/lib/types';

interface HandAnalyzerProps {
    onBack: () => void;
}

export function HandAnalyzer({ onBack }: HandAnalyzerProps) {
    const [heroCards, setHeroCards] = useState<Card[]>([]);
    const [boardCards, setBoardCards] = useState<Card[]>([]);
    const [position, setPosition] = useState('BTN');
    const [actionText, setActionText] = useState('');
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCardSelect = (card: Card, target: 'hero' | 'board') => {
        const setter = target === 'hero' ? setHeroCards : setBoardCards;
        const current = target === 'hero' ? heroCards : boardCards;
        const max = target === 'hero' ? 2 : 5;

        if (current.some(c => c.rank === card.rank && c.suit === card.suit)) {
            setter(current.filter(c => c.rank !== card.rank || c.suit !== card.suit));
        } else if (current.length < max) {
            setter([...current, card]);
        }
    };

    const runAnalysis = async () => {
        setIsLoading(true);
        const heroStr = heroCards.map(c => `${c.rank}${c.suit.charAt(0)}`).join(' ');
        const boardStr = boardCards.map(c => `${c.rank}${c.suit.charAt(0)}`).join(' ');

        const result = await geminiService.analyzePlayerHand(heroStr, boardStr, position, actionText);
        setAnalysis(result);
        setIsLoading(false);
    };

    return (
        <div className="absolute inset-0 bg-slate-50 flex flex-col font-sans overflow-y-auto z-50">
            {/* Header */}
            <div className="flex-none p-4 bg-white border-b border-slate-200 flex items-center gap-4 sticky top-0 z-20">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Search className="w-5 h-5 text-brand-blue" />
                    Hand Detective
                </h2>
            </div>

            <div className="flex-1 p-4 max-w-md mx-auto w-full space-y-6 pb-20">
                {analysis ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-brand-blue">
                            <h3 className="font-black text-xl mb-4 text-slate-800">Case Solved 🕵️‍♂️</h3>
                            <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">
                                {analysis}
                            </div>
                        </div>
                        <Button fullWidth onClick={() => { setAnalysis(null); setHeroCards([]); setBoardCards([]); }}>
                            Analyze Another Hand
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* STEP 1: HERO */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-700">1. Your Hand & Position</h3>
                                <select
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    className="bg-slate-100 border-none rounded-lg px-3 py-1 text-sm font-bold text-slate-700"
                                >
                                    {['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'].map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-2 h-24 mb-2">
                                {heroCards.map((c, i) => <PlayingCard key={i} card={c} size="sm" />)}
                                {heroCards.length < 2 && <div className="w-12 h-16 border-2 border-dashed border-slate-300 rounded-md bg-slate-50 flex items-center justify-center text-xs text-slate-300">Select 2</div>}
                            </div>

                            <CardMatrix
                                selectedCards={[...heroCards, ...boardCards]}
                                onSelectCard={(c) => handleCardSelect(c, 'hero')}
                                maxSelection={2}
                            />
                        </section>

                        {/* STEP 2: BOARD */}
                        <section className="space-y-3 pt-4 border-t border-slate-200">
                            <h3 className="font-bold text-slate-700">2. Board (Optional)</h3>
                            <div className="flex gap-2 h-24 mb-2">
                                {boardCards.map((c, i) => <PlayingCard key={i} card={c} size="sm" />)}
                                {boardCards.length < 5 && <div className="w-12 h-16 border-2 border-dashed border-slate-300 rounded-md bg-slate-50" />}
                            </div>

                            {heroCards.length === 2 && (
                                <CardMatrix
                                    selectedCards={[...heroCards, ...boardCards]}
                                    onSelectCard={(c) => handleCardSelect(c, 'board')}
                                    maxSelection={5}
                                />
                            )}
                        </section>

                        {/* STEP 3: ACTION */}
                        <section className="space-y-3 pt-4 border-t border-slate-200">
                            <h3 className="font-bold text-slate-700">3. What happened?</h3>
                            <textarea
                                className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-brand-blue focus:ring-0 resize-none text-sm"
                                rows={3}
                                placeholder="e.g. I raised to 3bb, BB called. Flop check/check..."
                                value={actionText}
                                onChange={(e) => setActionText(e.target.value)}
                            />
                        </section>

                        <div className="pt-4">
                            <Button
                                fullWidth
                                size="lg"
                                variant="primary"
                                disabled={heroCards.length < 2 || !actionText || isLoading}
                                onClick={runAnalysis}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 animate-spin" /> Analyzing...
                                    </span>
                                ) : 'Analyze Hand'}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

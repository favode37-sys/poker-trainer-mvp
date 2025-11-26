import { type Card, type Suit, type Rank } from '@/lib/types';
import { Heart, Diamond, Club, Spade, Check } from 'lucide-react';

const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

interface CardMatrixProps {
    selectedCards: Card[];
    onSelectCard: (card: Card) => void;
    maxSelection?: number;
}

export function CardMatrix({ selectedCards, onSelectCard, maxSelection = 5 }: CardMatrixProps) {
    const isSelected = (r: Rank, s: Suit) =>
        selectedCards.some(c => c.rank === r && c.suit === s);

    return (
        <div className="grid grid-rows-4 gap-1 select-none">
            {SUITS.map(suit => (
                <div key={suit} className="flex gap-1 overflow-x-auto pb-2">
                    <div className={`w-8 h-10 flex items-center justify-center ${suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-slate-900'}`}>
                        {suit === 'hearts' && <Heart className="w-5 h-5 fill-current" />}
                        {suit === 'diamonds' && <Diamond className="w-5 h-5 fill-current" />}
                        {suit === 'clubs' && <Club className="w-5 h-5 fill-current" />}
                        {suit === 'spades' && <Spade className="w-5 h-5 fill-current" />}
                    </div>
                    {RANKS.map(rank => {
                        const active = isSelected(rank, suit);
                        const disabled = !active && selectedCards.length >= maxSelection;

                        return (
                            <button
                                key={`${rank}-${suit}`}
                                onClick={() => !disabled && onSelectCard({ rank, suit })}
                                disabled={disabled}
                                className={`
                                    w-8 h-10 rounded border flex flex-col items-center justify-center text-xs font-bold transition-all
                                    ${active
                                        ? 'bg-brand-blue border-blue-600 text-white scale-110 shadow-md z-10'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
                                    ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                <span>{rank}</span>
                                {active && <Check className="w-3 h-3 mt-0.5" />}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

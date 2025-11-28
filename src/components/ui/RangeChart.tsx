import { cn } from '@/lib/utils';

interface RangeChartProps {
    range: Set<string>; // Set of hands like "AA", "AKs", "T9o"
    heroHand?: string;  // The specific hand held by hero (to highlight)
    title?: string;
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export function RangeChart({ range, heroHand, title }: RangeChartProps) {
    return (
        <div className="flex flex-col items-center">
            {title && <h3 className="text-sm font-bold text-slate-700 mb-2 uppercase">{title}</h3>}
            <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-[1px] bg-slate-300 border border-slate-300 shadow-sm p-[1px] rounded-sm select-none">
                {RANKS.map((rowRank, i) => (
                    RANKS.map((colRank, j) => {
                        // Determine hand notation (e.g. "AKs", "66", "AKo")
                        let hand = "";
                        // Pair (e.g. AA)
                        if (i === j) hand = `${rowRank}${colRank}`;
                        // Suited (upper triangle)
                        else if (i < j) hand = `${rowRank}${colRank}s`;
                        // Offsuit (lower triangle)
                        else hand = `${colRank}${rowRank}o`;

                        const isPair = i === j;
                        const displayHand = isPair ? rowRank + rowRank : hand;

                        const isInRange = range.has(displayHand);
                        const isHero = heroHand === displayHand;

                        return (
                            <div
                                key={displayHand}
                                className={cn(
                                    "w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-[8px] sm:text-[10px] font-bold leading-none",
                                    isHero ? "ring-2 ring-black z-10 animate-pulse bg-yellow-400 text-black" :
                                        isInRange ? "bg-emerald-500 text-white" : "bg-white text-slate-300"
                                )}
                                title={displayHand}
                            >
                                {displayHand}
                            </div>
                        );
                    })
                ))}
            </div>
            <div className="flex gap-4 mt-2 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm" /> Open</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-slate-300 rounded-sm" /> Fold</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 ring-1 ring-black rounded-sm" /> You</div>
            </div>
        </div>
    );
}

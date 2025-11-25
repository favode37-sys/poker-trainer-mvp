import { Coins } from 'lucide-react';

interface Player {
    name: string;
    stack: number;
    avatar?: string;
    isActive: boolean;
}

interface SeatProps {
    position: number; // 1-6, used to determine the color theme
    player?: Player;
    positionLabel?: string; // e.g., "BTN", "UTG"
    betAmount?: number;
    isDealer?: boolean;
    isHero?: boolean;
    isFolded?: boolean;
    lastAction?: string;
}

// Color mappings for each seat (1-6)
const SEAT_COLORS = [
    { border: 'border-red-500', text: 'text-red-600' },       // Position 1
    { border: 'border-blue-500', text: 'text-blue-600' },     // Position 2
    { border: 'border-emerald-500', text: 'text-emerald-600' }, // Position 3
    { border: 'border-purple-500', text: 'text-purple-600' }, // Position 4
    { border: 'border-orange-500', text: 'text-orange-600' }, // Position 5
    { border: 'border-cyan-500', text: 'text-cyan-600' },     // Position 6
];

// Animal avatars for each seat (Duolingo style)
const SEAT_ANIMALS = [
    '🦊', // Position 1 - Fox
    '🐼', // Position 2 - Panda
    '🦁', // Position 3 - Lion
    '🐻', // Position 4 - Bear
    '🐸', // Position 5 - Frog
    '🦉', // Position 6 - Owl (like Duo!)
];

export function Seat({ position, player, positionLabel, betAmount = 0, isDealer = false, isHero = false, isFolded = false, lastAction }: SeatProps) {
    // If no player, show empty seat
    if (!player) {
        return null;
    }

    // Get color classes for this seat (position is 1-6, array is 0-5)
    const activeColors = SEAT_COLORS[(position - 1) % SEAT_COLORS.length];
    const animal = SEAT_ANIMALS[(position - 1) % SEAT_ANIMALS.length];

    // Use dull colors if folded
    const colors = isFolded ? {
        border: 'border-slate-300',
        text: 'text-slate-400'
    } : activeColors;

    // Chip positioning logic - pushes chips towards the center of the table
    const getChipPosition = (pos: number) => {
        switch (pos) {
            case 1: return "-top-10 left-1/2 -translate-x-1/2"; // Bottom Center -> Chips Above
            case 2: return "-top-4 -right-12"; // Bottom Left -> Chips Top Right
            case 3: return "-bottom-4 -right-12"; // Top Left -> Chips Bottom Right
            case 4: return "-bottom-10 left-1/2 -translate-x-1/2"; // Top Center -> Chips Below
            case 5: return "-bottom-4 -left-12"; // Top Right -> Chips Bottom Left
            case 6: return "-top-4 -left-12"; // Bottom Right -> Chips Top Left
            default: return "-top-10";
        }
    };

    return (
        <div className={`relative w-24 rounded-2xl p-1.5 overflow-visible shadow-[0_8px_16px_-2px_rgba(0,0,0,0.3),0_4px_8px_-2px_rgba(0,0,0,0.15)] border-b-4 ${isFolded ? 'bg-slate-100 opacity-75 border-slate-200' : 'bg-white border-slate-300'}`}>
            {/* Dealer Button (Top Right) */}
            {isDealer && (
                <div className="absolute -top-2 -right-2 h-6 w-6 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold text-slate-900 z-20 shadow-md">
                    D
                </div>
            )}

            {/* Bet Amount (Chips) */}
            {betAmount > 0 && (
                <div className={`absolute ${getChipPosition(position)} flex flex-col items-center z-30`}>
                    <div className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1 shadow-sm">
                        <Coins className="w-3 h-3 text-yellow-400" />
                        <span className="text-white text-xs font-bold">{betAmount} BB</span>
                    </div>
                </div>
            )}

            {/* Active Cards Indicator - Positioned based on seat */}
            {!isFolded && !isHero && (
                <div className={`absolute z-20 flex ${(position >= 2 && position <= 4)
                    ? "-bottom-2 -right-4" // Left & Top players -> Cards on Right
                    : "-bottom-2 -left-4"  // Right players -> Cards on Left
                    }`}>
                    <div className="w-5 h-7 bg-blue-600 rounded-[2px] border border-white shadow-sm transform -rotate-12 origin-bottom-right"></div>
                    <div className="w-5 h-7 bg-blue-600 rounded-[2px] border border-white shadow-sm transform rotate-6 -ml-3"></div>
                </div>
            )}

            {/* Inner Inset Frame (The Colored Container) */}
            <div className={`h-full w-full rounded-xl border-[3px] flex flex-col overflow-hidden ${colors.border} ${isFolded ? 'bg-slate-50' : 'bg-white'}`}>

                {/* Top Section (Avatar - Approx 45%) */}
                <div className={`flex-[0.45] flex items-center justify-center p-1 ${isFolded ? 'bg-slate-200/50' : 'bg-slate-50/50'}`}>
                    <div className={`h-14 w-14 rounded-full border-2 flex items-center justify-center ${isFolded ? 'bg-slate-100 grayscale opacity-50' : 'bg-white'} ${colors.border}`}>
                        {player.avatar ? (
                            <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-3xl">
                                {animal}
                            </span>
                        )}
                    </div>
                </div>

                {/* Bottom Section (Info) */}
                <div className={`flex-1 flex flex-col justify-center gap-1 ${isFolded ? 'bg-slate-50' : 'bg-white'}`}>
                    {/* Middle Row (Pos & Stack) - Edge to Edge Border */}
                    <div className={`flex items-center py-1 text-xs font-bold border-y ${isFolded ? 'text-slate-400 border-slate-300' : `text-slate-700 ${colors.border}`}`}>
                        <span className={`flex-1 text-center border-r ${isFolded ? 'border-slate-300' : colors.border}`}>{positionLabel || 'POS'}</span>
                        <span className="flex-1 text-center">
                            {player.stack}<span className="text-[10px] font-medium ml-0.5 opacity-70">BB</span>
                        </span>
                    </div>

                    {/* Bottom Row (Action) */}
                    <div className={`px-2 text-center text-sm font-extrabold truncate leading-tight ${colors.text}`}>
                        {lastAction || '\u00A0'}
                    </div>
                </div>
            </div>
        </div>
    );
}

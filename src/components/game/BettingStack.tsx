import { motion } from 'framer-motion';
import { ClayChip, type ChipColor } from '@/components/ui/ClayChip';
import { Coins } from 'lucide-react';

interface BettingStackProps {
    amount: number;
    position: number; // Seat position 1-6
}

// Helper: Converts amount to a visual stack of chips
// We don't need exact change, just a visual representation of magnitude.
const getChipStack = (amount: number): ChipColor[] => {
    const chips: ChipColor[] = [];
    if (amount <= 0) return [];

    // Simple logic: larger bets get more "expensive" colors and taller stacks
    if (amount < 10) {
        // Small bets: 1-3 red chips
        const count = Math.max(1, Math.min(3, Math.floor(amount / 2)));
        for (let i = 0; i < count; i++) chips.push('red');
    } else if (amount < 50) {
        // Medium bets: Mix of red and blue
        chips.push('blue');
        const reds = Math.min(3, Math.floor((amount - 10) / 5));
        for (let i = 0; i < reds; i++) chips.push('red');
    } else if (amount < 200) {
        // Large bets: Green base
        chips.push('green');
        chips.push('blue');
        if (amount > 100) chips.push('blue');
        chips.push('red');
    } else {
        // Huge bets: Black base
        chips.push('black');
        chips.push('green');
        chips.push('blue');
        chips.push('red');
    }

    return chips.reverse(); // Put heaviest chips at bottom
};

// Helper: Get the target spot on the felt based on seat position
const getBettingSpotStyles = (pos: number): string => {
    // Adjust these values to place chips nicely in front of the player on the felt
    switch (pos) {
        case 1: return "-top-16 left-1/2 -translate-x-1/2"; // Hero center forward
        case 2: return "-right-14 top-1/4";
        case 3: return "-right-14 bottom-1/4";
        case 4: return "-bottom-16 left-1/2 -translate-x-1/2"; // Top center forward
        case 5: return "-left-14 bottom-1/4";
        case 6: return "-left-14 top-1/4";
        default: return "-top-10";
    }
};

export function BettingStack({ amount, position }: BettingStackProps) {
    const chips = getChipStack(amount);
    const spotClass = getBettingSpotStyles(position);

    const containerVariants = {
        hidden: {
            opacity: 0,
            scale: 0.5,
            // Start from outside the center towards the seat
            y: position === 1 ? 100 : position === 4 ? -100 : 0,
            x: position === 2 || position === 3 ? 100 : position === 5 || position === 6 ? -100 : 0,
        },
        visible: {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            transition: { type: "spring", stiffness: 150, damping: 15 }
        },
        exit: {
            opacity: 0,
            scale: 0.5,
            // Fly towards center pot area
            y: position <= 3 ? 150 : -150,
            transition: { duration: 0.4, ease: "backIn" }
        }
    } as const;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute ${spotClass} z-20 flex flex-col items-center`}
            style={{ perspective: '500px' }}
        >
            {/* The physical stack of chips */}
            <div className="relative flex flex-col-reverse items-center">
                {chips.map((color, i) => (
                    <motion.div
                        key={i}
                        // Stagger chips slightly for realistic messy stack look
                        initial={{ y: 0, x: 0 }}
                        animate={{
                            y: -i * 6, // Stack upwards
                            x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 2), // Slight random horizontal offset
                            rotateX: 10 // Slight tilt for 3D effect
                        }}
                        className="absolute bottom-0 shadow-md"
                        style={{ zIndex: i }}
                    >
                        <ClayChip color={color} size="md" />
                    </motion.div>
                ))}
                {/* Invisible placeholder to give the stack height */}
                <div className="w-10 h-2 opacity-0" style={{ marginTop: chips.length * 6 }} />
            </div>

            {/* Numeric amount label below the stack */}
            <div className="mt-1 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-1">
                <Coins className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-black text-slate-800">${amount}</span>
            </div>
        </motion.div>
    );
}

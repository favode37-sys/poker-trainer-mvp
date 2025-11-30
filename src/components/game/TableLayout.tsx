import { motion } from 'framer-motion';
import { Seat } from './Seat';
import { Pot } from './Pot';
import { TableFelt } from './TableFelt';
import { type Card } from '@/lib/types';

interface Player {
    name: string;
    stack: number;
    avatar?: string;
    isActive: boolean;
}

interface SeatData {
    player?: Player;
    betAmount?: number;
    isDealer?: boolean;
    isHero?: boolean;
    positionLabel?: string;
}

interface TableLayoutProps {
    seats: [SeatData?, SeatData?, SeatData?, SeatData?, SeatData?, SeatData?];
    communityCards: Card[];
    potSize: number;
    themeClass?: string;
}

export function TableLayout({ seats, communityCards, potSize, themeClass }: TableLayoutProps) {
    return (
        // Added `scale-90 sm:scale-100` to wrapper for small screens
        <div className="relative w-full h-full scale-[0.85] xs:scale-95 sm:scale-100 transition-transform duration-300">

            {/* The Felt & Community Cards (Handled by TableFelt) */}
            <div className="absolute inset-0 z-0">
                <TableFelt communityCards={communityCards} themeClass={themeClass} />
            </div>

            {/* SEAT POSITIONS (Optimized for Mobile) */}
            {/* Seat 1 - Hero (Bottom Center) */}
            {seats[0] && (
                <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 z-30">
                    <Seat position={1} {...seats[0]} />
                </div>
            )}

            {/* Seat 2 - Bottom Left */}
            {seats[1] && (
                <div className="absolute bottom-[15%] -left-[20px] sm:bottom-[18%] sm:-left-[15px]">
                    <Seat position={2} {...seats[1]} />
                </div>
            )}

            {/* Seat 3 - Top Left */}
            {seats[2] && (
                <div className="absolute top-[15%] -left-[20px] sm:top-[18%] sm:-left-[15px]">
                    <Seat position={3} {...seats[2]} />
                </div>
            )}

            {/* Seat 4 - Top Center */}
            {seats[3] && (
                <div className="absolute top-[-30px] left-1/2 -translate-x-1/2">
                    <Seat position={4} {...seats[3]} />
                </div>
            )}

            {/* Seat 5 - Top Right */}
            {seats[4] && (
                <div className="absolute top-[15%] -right-[20px] sm:top-[18%] sm:-right-[15px]">
                    <Seat position={5} {...seats[4]} />
                </div>
            )}

            {/* Seat 6 - Bottom Right */}
            {seats[5] && (
                <div className="absolute bottom-[15%] -right-[20px] sm:bottom-[18%] sm:-right-[15px]">
                    <Seat position={6} {...seats[5]} />
                </div>
            )}

            {/* Pot Info - Clay Badge */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, x: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%" }}
                className="absolute top-[65%] left-1/2 z-20"
            >
                <Pot size={potSize} />
            </motion.div>
        </div>
    );
}

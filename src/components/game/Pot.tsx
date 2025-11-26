import { Coins } from 'lucide-react';

interface PotProps {
    size: number;
    className?: string;
}

export function Pot({ size, className = '' }: PotProps) {
    return (
        <div className={`flex items-center justify-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 shadow-md ${className}`}>
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-black text-sm tracking-wide">{size} BB</span>
        </div>
    );
}

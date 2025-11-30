import { Coins } from 'lucide-react';

interface PotProps {
    size: number;
    className?: string;
}

export function Pot({ size, className = '' }: PotProps) {
    return (
        <div className={`
            flex items-center justify-center gap-2 
            bg-white text-slate-800 
            px-5 py-2 rounded-2xl 
            border-2 border-slate-100
            shadow-[0_4px_0_#cbd5e1,0_8px_15px_rgba(0,0,0,0.1)] 
            transform transition-all
            ${className}
        `}>
            <div className="bg-yellow-100 p-1 rounded-full">
                <Coins className="w-5 h-5 text-yellow-600 fill-yellow-500" />
            </div>
            <span className="font-black text-lg tracking-tight font-mono">${size}</span>
        </div>
    );
}

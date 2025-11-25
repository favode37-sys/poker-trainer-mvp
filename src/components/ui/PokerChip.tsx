import { cn } from '@/lib/utils';

interface PokerChipProps {
    value?: number;
    color?: 'red' | 'blue' | 'green';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const colorClasses = {
    red: 'bg-brand-red border-[#D33E3E]',
    blue: 'bg-brand-blue border-[#1899D6]',
    green: 'bg-brand-green border-[#46A302]',
};

const sizeClasses = {
    sm: 'w-6 h-6 border-b-2',
    md: 'w-10 h-10 border-b-4',
    lg: 'w-14 h-14 border-b-4',
};

export function PokerChip({ value, color = 'red', size = 'md', className }: PokerChipProps) {
    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center font-bold text-white shadow-sm",
                colorClasses[color],
                sizeClasses[size],
                className
            )}
        >
            {value && <span className="text-[0.6em]">{value}</span>}
            {/* Inner ring detail for chip look */}
            <div className="absolute w-[70%] h-[70%] rounded-full border-2 border-white/20 border-dashed" />
        </div>
    );
}

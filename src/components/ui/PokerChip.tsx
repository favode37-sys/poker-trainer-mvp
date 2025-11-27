import { cn } from '@/lib/utils';

interface PokerChipProps {
    value?: number;
    color?: 'red' | 'blue' | 'green';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const colorClasses = {
    red: 'bg-functional-error border-functional-error',
    blue: 'bg-blue-300 border-blue-300',
    green: 'bg-functional-success border-functional-success',
};

const sizeClasses = {
    sm: 'w-6 h-6 border',
    md: 'w-10 h-10 border',
    lg: 'w-14 h-14 border',
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

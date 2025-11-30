import { cn } from '@/lib/utils';

export type ChipColor = 'red' | 'blue' | 'green' | 'black';

interface ClayChipProps {
    color: ChipColor;
    size?: 'sm' | 'md';
    className?: string;
    style?: React.CSSProperties;
}

export function ClayChip({ color, size = 'md', className, style }: ClayChipProps) {
    const sizeClasses = size === 'sm' ? 'w-6 h-6 border-2' : 'w-8 h-8 sm:w-10 sm:h-10 border-[3px]';

    const colorStyles = {
        red: 'bg-chip-red border-red-200 shadow-chip-red',
        blue: 'bg-chip-blue border-blue-200 shadow-chip-blue',
        green: 'bg-chip-green border-green-200 shadow-chip-green',
        black: 'bg-chip-black border-zinc-400 shadow-chip-black',
    };

    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center relative",
                sizeClasses,
                colorStyles[color],
                className
            )}
            style={style}
        >
            {/* Inner ring texture for extra detail */}
            <div className="absolute inset-1 rounded-full border border-white/30 border-dashed opacity-50" />
        </div>
    );
}

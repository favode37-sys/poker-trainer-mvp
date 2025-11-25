import * as React from "react"

import { cn } from "@/lib/utils"

// I'll use standard props, but since I didn't install class-variance-authority, 
// I'll just do manual class logic or install it. 
// The user didn't ask for cva, but it's good practice. 
// I'll stick to simple props for now to avoid extra deps unless I install it.
// Wait, I didn't install cva. I'll just use clsx/tailwind-merge.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold uppercase tracking-wider transition-all active:border-b-0 active:translate-y-[4px] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

        const variants = {
            primary: "bg-brand-green text-white border-b-4 border-[#46A302] hover:bg-[#46A302]/90", // Green
            secondary: "bg-brand-blue text-white border-b-4 border-[#1899D6] hover:bg-[#1899D6]/90", // Blue
            danger: "bg-brand-red text-white border-b-4 border-[#D33E3E] hover:bg-[#D33E3E]/90", // Red
            outline: "bg-white text-slate-500 border-2 border-slate-200 border-b-4 hover:bg-slate-50 active:border-b-2", // Outline style
            ghost: "bg-transparent text-slate-500 hover:bg-slate-100 border-transparent",
        }

        const sizes = {
            sm: "h-9 px-4 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-base",
        }

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth && "w-full",
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

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

        const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold tracking-wide transition-all active:scale-95 focus:outline-none disabled:opacity-50 disabled:pointer-events-none shadow-sm backdrop-blur-sm border border-white/20"

        const variants = {
            primary: "bg-brand-primary text-brand-dark hover:bg-brand-primary/90 hover:shadow-md",
            secondary: "bg-brand-accent text-brand-dark hover:bg-brand-accent/90 hover:shadow-md",
            danger: "bg-functional-error text-brand-dark hover:bg-functional-error/90 hover:shadow-md",
            outline: "bg-white/40 text-neutral-text-main border-neutral-border hover:bg-white/60",
            ghost: "bg-transparent text-neutral-text-secondary hover:bg-neutral-bg/50 border-transparent shadow-none",
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

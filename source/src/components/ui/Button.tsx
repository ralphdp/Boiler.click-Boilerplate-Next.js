"use client";

import React from "react";
import { cn } from "@/core/utils";

type ButtonVariants = "glass" | "glass-accent" | "outline" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariants;
    as?: React.ElementType; // For polymorphic behavior (e.g. using as Link or a)
    href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "glass", as: Component = "button", ...props }, ref) => {
        const variants: Record<ButtonVariants, string> = {
            glass: "glass hover:bg-white/5 border-white/5",
            "glass-accent": "glass glass-accent hover:bg-white/10 border-white/10",
            outline: "border border-white/10 hover:border-white/20 hover:bg-white/5 text-white/60 hover:text-white",
            ghost: "hover:bg-white/5 text-white/40 hover:text-white border-transparent"
        };

        const Element = Component as any;

        return (
            <Element
                ref={ref}
                className={cn(
                    "px-8 py-4 transition-all text-xs font-black technical tracking-[0.2em] flex items-center justify-center gap-2 group whitespace-nowrap cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed",
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

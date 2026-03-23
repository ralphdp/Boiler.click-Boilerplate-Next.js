"use client";

import React from "react";
import { cn } from "@/core/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full space-y-2 group">
                {label && (
                    <label className="text-xs font-bold text-white/50 group-focus-within:text-[var(--accent)] transition-colors ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-white/50 transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "w-full bg-[#050505] border border-white/10 rounded-md p-3.5 text-sm text-white focus:border-[var(--accent)] focus:outline-none transition-colors placeholder:text-white/20",
                            icon && "pl-12",
                            error && "border-red-500/50 focus:border-red-500/50",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-[10px] text-red-500/80 font-semibold tracking-normal ml-1" aria-live="polite">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

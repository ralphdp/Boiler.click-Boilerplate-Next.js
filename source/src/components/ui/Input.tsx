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
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 group-focus-within:text-accent/60 transition-colors ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-accent/40 transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "w-full bg-black/50 border border-white/5 p-4 text-sm technical tracking-widest focus:border-accent/40 focus:outline-none transition-all placeholder:text-white/5",
                            icon && "pl-12",
                            error && "border-red-500/50 focus:border-red-500/50",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-[8px] text-red-500/80 uppercase font-black tracking-widest ml-1" aria-live="polite">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

"use client";

import React from "react";
import { cn } from "@/core/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-2 group">
                {label && (
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 group-focus-within:text-accent/60 transition-colors ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <textarea
                        ref={ref}
                        className={cn(
                            "w-full bg-black/50 border border-white/5 p-4 text-sm technical tracking-widest focus:border-accent/50 focus:shadow-[0_0_5px_var(--accent)_inset] focus:outline-none transition-all placeholder:text-white/5 resize-y min-h-[100px]",
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

Textarea.displayName = "Textarea";

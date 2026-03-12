"use client";

import { useState, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
    term: string;
    definition: string;
    children: ReactNode;
}

export function TooltipContent({ term, definition }: { term: string; definition: string }) {
    return (
        <div className="bg-black/70 border border-white/20 px-4 py-3 shadow-2xl backdrop-blur-2xl pointer-events-none text-left">
            <div className="text-[0.625rem] font-black uppercase tracking-[0.2em] text-white/90 mb-1.5 border-b border-white/10 pb-1.5 flex items-center justify-between">
                <span>{term}</span>
                <span className="w-1.5 h-1.5 bg-white/80 animate-pulse rounded-full" />
            </div>
            <p className="text-[0.6875rem] leading-relaxed text-zinc-300 font-serif lowercase italic">
                {definition}
            </p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/20" />
        </div>
    );
}

export function TerminalTooltip({ term, definition, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(true);
    };

    const hideTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 100);
    };

    return (
        <span
            className="relative inline-block"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
        >
            <span className="cursor-help border-b border-dotted border-white/40 hover:border-white transition-colors decoration-thickness-1 underline-offset-4">
                {children}
            </span>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 z-[110] pointer-events-none"
                    >
                        <TooltipContent term={term} definition={definition} />
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
}

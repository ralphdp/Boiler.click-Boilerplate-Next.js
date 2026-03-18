"use client";

import { useState, useRef, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/core/utils";

interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
    term?: string;
    className?: string;
}

export function Tooltip({ content, children, term, className }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; arrowLeft: string; arrowPosition: "top" | "bottom" }>({ top: 0, left: 0, arrowLeft: "50%", arrowPosition: "bottom" });
    const [isMounted, setIsMounted] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const updatePosition = () => {
        if (!containerRef.current || !tooltipRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        // Use actual measured height or fallback to 85
        const actualTooltipHeight = tooltipRef.current.offsetHeight || 85;
        const tooltipWidth = 256;
        const padding = 20;

        // Default: Position it above the target
        let top = containerRect.top + window.scrollY - actualTooltipHeight - 12;
        let left = containerRect.left + window.scrollX + containerRect.width / 2 - tooltipWidth / 2;
        let arrowPosition: "top" | "bottom" = "bottom";
        let arrowLeft = "50%";

        // Vertical Collision (Top)
        if (containerRect.top < actualTooltipHeight + padding + 20) {
            top = containerRect.bottom + window.scrollY + 12;
            arrowPosition = "top";
        }

        // Left Boundary Collision
        if (left < padding) {
            const centerOfButton = containerRect.left + containerRect.width / 2;
            left = padding;
            // The arrow should stay centered over the button relative to the tooltip
            arrowLeft = `${centerOfButton - padding}px`;
        }
        // Right Boundary Collision
        else if (left + tooltipWidth > window.innerWidth - padding) {
            const centerOfButton = containerRect.left + containerRect.width / 2;
            left = window.innerWidth - padding - tooltipWidth;
            arrowLeft = `${centerOfButton - left}px`;
        }

        setCoords({ top, left, arrowLeft, arrowPosition });
    };

    // Re-calculate on mount/visible
    useEffect(() => {
        if (isVisible) {
            // Delay slightly to ensure height measurement is accurate after AnimatePresence mounts it
            const timer = setTimeout(updatePosition, 0);
            window.addEventListener("resize", updatePosition);
            window.addEventListener("scroll", updatePosition);
            return () => {
                clearTimeout(timer);
                window.removeEventListener("resize", updatePosition);
                window.removeEventListener("scroll", updatePosition);
            };
        }
    }, [isVisible]);

    const showTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(true);
    };

    const hideTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 150);
    };

    const tooltipElement = (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    ref={tooltipRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    style={{
                        position: "absolute",
                        top: coords.top,
                        left: coords.left,
                        width: "256px",
                        // Avoid flash at 0,0 by keeping opacity 0 until first coords set if needed,
                        // but coords[top/left] > 0 check is enough.
                        visibility: coords.top === 0 ? "hidden" : "visible"
                    }}
                    className="z-[9999] pointer-events-none"
                >
                    <div className="bg-black/95 border border-white/20 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl pointer-events-none text-left rounded-sm relative">
                        {term && (
                            <div className="text-[0.625rem] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-1.5 border-b border-white/10 pb-1.5 flex items-center justify-between">
                                <span>{term}</span>
                                <span className="w-1.5 h-1.5 bg-[var(--accent)] animate-pulse rounded-full" />
                            </div>
                        )}
                        <div className="text-[0.6875rem] leading-relaxed text-zinc-300 font-sans uppercase tracking-[0.15em]">
                            {content}
                        </div>
                        {/* Shadow Arrow */}
                        <div
                            style={{ left: coords.arrowLeft }}
                            className={cn(
                                "absolute -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent",
                                coords.arrowPosition === "bottom"
                                    ? "top-full -mt-[1px] border-t-[6px] border-t-white/20"
                                    : "bottom-full -mb-[1px] border-b-[6px] border-b-white/20"
                            )}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <div
                ref={containerRef}
                className={cn("relative inline-block", className)}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                onMouseMove={() => isVisible && updatePosition()} // Keep synced during complex shifts
            >
                {children}
            </div>
            {isMounted && typeof document !== "undefined" && createPortal(tooltipElement, document.body)}
        </>
    );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/core/utils";

interface Option {
    label: string;
    value: string;
}

interface SelectProps {
    label?: string;
    options: Option[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function Select({ label, options, value, onChange, placeholder = "Select option", className }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // Close when clicking outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div ref={containerRef} className={cn("w-full space-y-2 group relative", className)}>
            {label && (
                <label className="text-[9px] font-black uppercase tracking-widest text-white/20 group-focus-within:text-accent/60 transition-colors ml-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full bg-black/50 border border-white/5 p-4 text-sm technical tracking-widest flex items-center justify-between transition-all hover:bg-white/[0.02]",
                    isOpen ? "border-accent/40" : "hover:border-white/10"
                )}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={cn(selectedOption ? "text-white" : "text-white/20 uppercase tracking-[0.2em]")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={cn("text-white/20 transition-transform duration-300", isOpen && "rotate-180")}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                        className="absolute z-50 mt-1 w-full bg-black border border-white/10 shadow-2xl overflow-hidden origin-top"
                        role="listbox"
                    >
                        {options.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "p-4 text-xs technical tracking-widest cursor-pointer hover:bg-white/[0.05] flex items-center justify-between",
                                    value === option.value ? "text-accent" : "text-white/60"
                                )}
                                role="option"
                                aria-selected={value === option.value}
                            >
                                {option.label}
                                {value === option.value && <Check size={14} className="text-accent" />}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}

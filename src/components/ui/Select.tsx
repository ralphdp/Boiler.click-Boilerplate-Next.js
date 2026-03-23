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
                <label className="text-xs font-bold text-white/50 group-focus-within:text-[var(--accent)] transition-colors ml-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full bg-[#050505] border border-white/10 rounded-md p-3.5 text-sm font-medium flex items-center justify-between transition-colors hover:bg-[#0a0a0a]",
                    isOpen ? "border-[var(--accent)]" : "hover:border-white/20"
                )}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={cn(selectedOption ? "text-white" : "text-white/20")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={cn("text-white/20 transition-transform duration-200", isOpen && "rotate-180")}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 mt-1 w-full bg-[#000000] border border-white/10 rounded-md shadow-2xl overflow-hidden origin-top"
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
                                    "p-3.5 text-sm font-medium cursor-pointer hover:bg-white/5 flex items-center justify-between transition-colors",
                                    value === option.value ? "text-[var(--accent)] bg-[var(--accent)]/5" : "text-white/70"
                                )}
                                role="option"
                                aria-selected={value === option.value}
                            >
                                {option.label}
                                {value === option.value && <Check size={14} className="text-[var(--accent)]" />}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}

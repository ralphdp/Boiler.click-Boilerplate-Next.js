"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Terminal } from "lucide-react";
import { useTranslation } from "@/core/i18n/LanguageProvider";

export interface CommandDefinition {
    id: string;
    name: string;
    shortcut?: string;
    action: () => void;
    icon?: React.ReactNode;
}

export function CommandPalette({
    commands,
    isOpen,
    onOpenChange,
    onSearchChange
}: {
    commands: CommandDefinition[],
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    onSearchChange?: (query: string) => void
}) {
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    const filteredCommands = commands.filter((cmd) =>
        cmd.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onOpenChange(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onOpenChange]);

    useEffect(() => {
        if (isOpen) {
            setActiveIndex(0);
            setSearch("");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const cmd = filteredCommands[activeIndex];
            if (cmd) {
                cmd.action();
                onOpenChange(false);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0"
                        onClick={() => onOpenChange(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-xl bg-black border border-white/10 overflow-hidden shadow-2xl bg-[#0a0a0a] rounded-md shadow-[var(--accent)]/10"
                    >
                        {/* Search Input */}
                        <div className="flex items-center px-4 py-3 border-b border-white/10 relative group">
                            <Search className="w-5 h-5 text-white/50 group-focus-within:text-[var(--accent)] transition-colors" />
                            <input
                                ref={inputRef}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    onSearchChange?.(e.target.value);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={t.commandPalette.searchPlaceholder}
                                className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 pl-3 font-mono text-sm placeholder-white/30"
                            />
                            <div className="flex gap-1">
                                <span className="px-1.5 py-0.5 rounded-sm bg-white/10 text-white/50 font-mono text-xs shadow-inner">ESC</span>
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="max-h-[300px] overflow-y-auto admin-scrollbar p-2">
                            {filteredCommands.length === 0 ? (
                                <div className="text-center py-8 text-white/30 font-mono text-xs tracking-normal">
                                    {t.commandPalette.noDirectives}
                                </div>
                            ) : (
                                filteredCommands.map((cmd, index) => {
                                    const isActive = index === activeIndex;
                                    return (
                                        <div
                                            key={cmd.id}
                                            onClick={() => {
                                                cmd.action();
                                                onOpenChange(false);
                                            }}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-sm cursor-pointer transition-colors duration-150 ${isActive
                                                ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-white shadow-inner"
                                                : "bg-transparent border border-transparent text-white/60 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {cmd.icon || <Terminal className={`w-4 h-4 ${isActive ? 'text-[var(--accent)]' : 'opacity-40'}`} />}
                                                <span className="font-mono text-sm">{cmd.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {cmd.shortcut && (
                                                    <span className={`font-mono text-[10px] tracking-wider uppercase px-2 py-1 rounded bg-black/40 border border-white/5 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                                                        {cmd.shortcut}
                                                    </span>
                                                )}
                                                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "opacity-100 translate-x-1 text-[var(--accent)]" : "opacity-0 -translate-x-2"}`} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="p-2 bg-white/5 border-t border-white/5 flex justify-between items-center text-[10px] font-mono tracking-normal text-[var(--accent)] opacity-60">
                            <span>{t.commandPalette.subtitle}</span>
                            <span>v2.1</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

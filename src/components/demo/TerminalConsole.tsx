"use client";

import { motion } from "framer-motion";
import { TerminalSquare } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface TerminalConsoleProps {
    lines: string[];
    title?: string;
    userName?: string;
}

export function TerminalConsole({
    lines,
    title = "Audit Terminal Trace",
    userName = "root@vanguard"
}: TerminalConsoleProps) {
    return (
        <GlassCard className="p-8 flex flex-col gap-4 border-[var(--accent)]/20 shadow-[0_0_15px_rgba(var(--accent-rgb),0.05)] w-full">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <TerminalSquare className="text-[var(--accent)]" size={20} />
                <h3 className="text-lg font-bold uppercase tracking-widest leading-none mt-1">{title}</h3>
            </div>
            <div className="bg-black/80 p-4 font-mono text-xs text-[var(--accent)]/80 gap-2 flex-grow border border-white/5 flex flex-col justify-end overflow-hidden h-64 text-left">
                {lines.map((line, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                        <span className="text-white/30 shrink-0 select-none">[SYS]</span>
                        <span>{line}</span>
                    </motion.div>
                ))}
                <div className="flex gap-2 text-white/50 animate-pulse mt-2 items-center">
                    <span className="text-[var(--accent)]">{userName}:~#</span>
                    <span className="w-2 h-4 bg-white/50 inline-block" />
                </div>
            </div>
        </GlassCard>
    );
}

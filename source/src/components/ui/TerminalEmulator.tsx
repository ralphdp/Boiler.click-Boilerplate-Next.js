"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface LogLine {
    id: string;
    text: string;
    type?: "info" | "success" | "warning" | "error";
    timestamp?: string;
}

export function TerminalEmulator({
    logs,
    height = "300px",
    title = "Sovereign Root Console"
}: {
    logs: LogLine[],
    height?: string,
    title?: string
}) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    const getColor = (type?: string) => {
        switch (type) {
            case "error": return "text-red-500";
            case "warning": return "text-yellow-500";
            case "success": return "text-green-500";
            default: return "text-[var(--foreground)] opacity-80";
        }
    };

    return (
        <div className="w-full flex flex-col rounded-md border border-white/10 bg-black/90 backdrop-blur-md shadow-2xl overflow-hidden font-mono text-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-xs uppercase tracking-widest opacity-50 technical">{title}</span>
                <span className="w-4"></span>
            </div>

            {/* Scrollable Log Area */}
            <div
                className="p-4 overflow-y-auto admin-scrollbar"
                style={{ height }}
            >
                {logs.length === 0 && (
                    <div className="opacity-30 italic">Initializing substrate connection...</div>
                )}

                {logs.map((log) => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mb-1 leading-relaxed flex gap-3 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                    >
                        {log.timestamp && (
                            <span className="opacity-30 shrink-0">[{log.timestamp}]</span>
                        )}
                        <span className="text-[var(--accent)] shrink-0">~</span>
                        <span className={getColor(log.type)}>{log.text}</span>
                    </motion.div>
                ))}

                <div className="flex gap-3 mt-2 animate-pulse mt-4">
                    <span className="text-[var(--accent)] shrink-0">~</span>
                    <span className="w-2 h-4 bg-[var(--accent)]"></span>
                </div>
                <div ref={bottomRef} />
            </div>
        </div>
    );
}

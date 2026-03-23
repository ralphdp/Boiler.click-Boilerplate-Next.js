"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, File, ChevronRight, ChevronDown, Lock, ShieldAlert, Cpu } from "lucide-react";
import { listVfsDirectory, readVfsFile } from "@/core/actions/vfs";
import { SolidCard } from "@/components/ui/SolidCard";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/core/utils";

export function AdminVFS() {
    const [currentPath, setCurrentPath] = useState(".");
    const [entries, setEntries] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDirectory(".");
    }, []);

    const loadDirectory = async (p: string) => {
        setLoading(true);
        const res = await listVfsDirectory(p);
        setEntries(res);
        setCurrentPath(p);
        setLoading(false);
    };

    const handleEntryClick = async (entry: any) => {
        if (entry.isDirectory) {
            loadDirectory(entry.path);
        } else {
            setLoading(true);
            setSelectedFile(entry.path);
            const content = await readVfsFile(entry.path);
            setFileContent(content);
            setLoading(false);
        }
    };

    const navigateUp = () => {
        if (currentPath === ".") return;
        const parts = currentPath.split("/");
        parts.pop();
        loadDirectory(parts.join("/") || ".");
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-[700px] border border-white/5 bg-black/40 overflow-hidden"
        >
            {/* Header / Breadcrumbs */}
            <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Tooltip content="Navigate to the root identity node of the virtual substrate." term="VFS_ROOT_SHIFT">
                        <button
                            onClick={() => loadDirectory(".")}
                            className="text-[10px] font-semibold text-[var(--accent)] hover:underline shrink-0"
                        >
                            ROOT
                        </button>
                    </Tooltip>
                    <span className="text-white/20">/</span>
                    <div className="text-[10px] font-mono text-white/40 truncate">
                        {currentPath === "." ? "" : currentPath}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldAlert size={12} className="text-yellow-500/50" />
                    <span className="text-[9px] font-semibold tracking-normal text-white/20">VFS HARDENING ACTIVE</span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Explorer */}
                <div className="w-1/3 md:w-1/4 border-r border-white/5 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto admin-scrollbar p-2 space-y-1">
                        {currentPath !== "." && (
                            <button
                                onClick={navigateUp}
                                className="w-full flex items-center gap-2 p-2 text-[10px] text-white/40 hover:bg-white/5 transition-colors text-left"
                            >
                                <ChevronRight size={12} className="rotate-180 shrink-0" />
                                <span>..</span>
                            </button>
                        )}
                        {entries.map(entry => (
                            <button
                                key={entry.path}
                                onClick={() => handleEntryClick(entry)}
                                className={cn(
                                    "w-full flex items-center gap-2 p-2 text-[10px] transition-colors text-left group",
                                    selectedFile === entry.path ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-white/60 hover:bg-white/5"
                                )}
                            >
                                {entry.isDirectory ? <Folder size={12} className="text-blue-400/50 shrink-0" /> : <File size={12} className="text-white/20 shrink-0" />}
                                <span className="truncate">{entry.name}</span>
                            </button>
                        ))}
                        {loading && entries.length === 0 && <div className="p-4 text-center opacity-20 animate-pulse"><Cpu size={16} className="mx-auto" /></div>}
                    </div>
                </div>

                {/* Main: Viewer */}
                <div className="flex-1 flex flex-col overflow-hidden bg-black/60 relative">
                    {selectedFile ? (
                        <>
                            <div className="p-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                <span className="text-[9px] font-mono text-white/40 truncate">{selectedFile}</span>
                                <Lock size={10} className="text-white/20" />
                            </div>
                            <pre className="flex-1 overflow-auto p-4 text-[11px] font-mono text-white/80 admin-scrollbar selection:bg-[var(--accent)]/30">
                                <code>{fileContent}</code>
                            </pre>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-10">
                            <ShieldAlert size={64} />
                            <div className="text-[10px] font-semibold tracking-normal]">Select an Identity Node to Audit</div>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <Cpu size={24} className="text-[var(--accent)]" />
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Status */}
            <div className="p-2 bg-black/40 border-t border-white/5 flex justify-between items-center px-4">
                <span className="text-[8px] text-white/20 tracking-normal font-semibold">Substrate Build: 6.8.5</span>
                <span className="text-[8px] text-[var(--accent)]/50 tracking-normal font-semibold">Read-Only Gate</span>
            </div>
        </motion.div>
    );
}

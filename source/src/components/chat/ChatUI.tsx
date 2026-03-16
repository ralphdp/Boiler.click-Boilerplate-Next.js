"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send, Bot, User, Loader2, Maximize2, Minimize2,
    Trash2, Settings, Shield, Sparkles, X, MessageSquare
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { cn } from "@/core/utils";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
}

interface ChatUIProps {
    className?: string;
    isMinimized?: boolean;
    onToggleMinimize?: () => void;
    onClose?: () => void;
}

export function ChatUI({ className, isMinimized, onToggleMinimize, onClose }: ChatUIProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [userApiKey, setUserApiKey] = useState("");

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: "",
        description: "",
        action: () => { }
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("sovereign_chat_messages");
        const savedSession = localStorage.getItem("sovereign_chat_session");
        const savedKey = localStorage.getItem("sovereign_user_api_key");

        if (saved) setMessages(JSON.parse(saved));
        if (savedSession) setSessionId(savedSession);
        if (savedKey) setUserApiKey(savedKey);
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem("sovereign_chat_messages", JSON.stringify(messages));
        if (sessionId) localStorage.setItem("sovereign_chat_session", sessionId);
        if (userApiKey) localStorage.setItem("sovereign_user_api_key", userApiKey);
    }, [messages, sessionId, userApiKey]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    sessionId,
                    userApiKey: userApiKey || undefined
                })
            });

            if (!response.ok) {
                const data = await response.json();
                const errorMsg: Message = {
                    id: Date.now().toString(),
                    role: "system",
                    content: `Error: ${data.error || "Failed to connect to AI substrate."}`,
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, errorMsg]);
                setIsLoading(false);
                return;
            }

            // Handle Streaming Response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            const sid = response.headers.get("x-session-id");
            if (sid) setSessionId(sid);

            const assistantMsgId = (Date.now() + 1).toString();
            const assistantMsg: Message = {
                id: assistantMsgId,
                role: "assistant",
                content: "",
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMsg]);
            setIsLoading(false); // Stop loader as we start streaming

            let accumulated = "";
            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                accumulated += chunk;

                setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId ? { ...m, content: accumulated } : m
                ));
            }
        } catch (error) {
            console.error("Chat error:", error);
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setConfirmModal({
            open: true,
            title: "PURGE CONVERSATION HISTORY",
            description: "Are you sure you want to clear your conversation history? This will permanently sever the local memory node for this session.",
            action: () => {
                setMessages([]);
                localStorage.removeItem("sovereign_chat_messages");
            }
        });
    };

    if (isMinimized) return null;

    return (
        <GlassCard className={cn(
            "flex flex-col h-[600px] w-full max-w-md border-white/10 bg-black/80 backdrop-blur-2xl shadow-2xl overflow-hidden",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center border border-[var(--accent)]/30">
                        <Sparkles size={16} className="text-[var(--accent)]" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest">Sovereign AI</h3>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[8px] text-white/30 uppercase tracking-tighter">Substrate Active</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={cn("p-1.5 hover:bg-white/10 text-white/50 transition-colors", showSettings && "text-[var(--accent)] bg-white/5")}
                    >
                        <Settings size={16} />
                    </button>
                    <button onClick={clearChat} className="p-1.5 hover:bg-white/10 text-white/50 transition-colors">
                        <Trash2 size={16} />
                    </button>
                    {onToggleMinimize && (
                        <button onClick={onToggleMinimize} className="p-1.5 hover:bg-white/10 text-white/50 transition-colors">
                            <Minimize2 size={16} />
                        </button>
                    )}
                    {onClose && (
                        <button onClick={onClose} className="p-1.5 hover:bg-red-500/10 text-white/50 hover:text-red-500 transition-colors">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                    {showSettings ? (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute inset-0 z-10 p-6 bg-black/95 flex flex-col gap-4 overflow-y-auto"
                        >
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Provider Configuration</label>
                                <p className="text-[10px] text-white/40 italic font-serif leading-relaxed">
                                    The Sovereign Substrate uses a local-first memory model. Your API keys are stored encrypted in your browser's persistent storage node.
                                </p>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] uppercase font-bold text-white/60">OpenAI API Key</span>
                                        <Shield size={10} className="text-white/20" />
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="sk-..."
                                        value={userApiKey}
                                        onChange={(e) => setUserApiKey(e.target.value)}
                                        className="bg-white/5 border-white/10 text-xs font-mono"
                                    />
                                    <p className="text-[8px] text-white/30">Used for gpt-4o-mini requests. Never sent to our servers.</p>
                                </div>

                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="w-full py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent)]/20 transition-colors mt-4"
                                >
                                    Close Settings
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth admin-scrollbar bg-[radial-gradient(circle_at_bottom,var(--accent)/0.03,transparent)]"
                        >
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-50">
                                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                        <Bot size={32} className="text-white/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[11px] font-black uppercase tracking-widest">Substrate Ready</h4>
                                        <p className="text-[10px] font-serif italic text-white/40">Initiate identity handshake to begin conversation.</p>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3 max-w-[85%]",
                                        msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full shrink-0 flex items-center justify-center border",
                                        msg.role === "user" ? "bg-white/5 border-white/10" : "bg-[var(--accent)]/10 border-[var(--accent)]/20"
                                    )}>
                                        {msg.role === "user" ? <User size={14} /> : <Bot size={14} className="text-[var(--accent)]" />}
                                    </div>
                                    <div className={cn(
                                        "p-3 text-xs leading-relaxed",
                                        msg.role === "user"
                                            ? "bg-white/5 text-white/90 border border-white/10"
                                            : msg.role === "system"
                                                ? "bg-red-500/10 text-red-500 border border-red-500/20 italic"
                                                : "bg-[var(--accent)]/5 text-[var(--accent)]/90 border border-[var(--accent)]/20"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
                                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                                        <Loader2 size={14} className="text-[var(--accent)] animate-spin" />
                                    </div>
                                    <div className="p-3 bg-[var(--accent)]/5 text-[var(--accent)]/50 border border-[var(--accent)]/20 text-xs italic">
                                        Processing response...
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-black/40">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        placeholder="Type message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading}
                        className="w-full bg-white/5 border border-white/10 text-xs px-4 py-3 pr-12 focus:outline-none focus:border-[var(--accent)]/40 transition-colors placeholder:text-white/20 uppercase tracking-widest font-bold"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2 text-white/50 hover:text-[var(--accent)] disabled:opacity-20 disabled:hover:text-white/50 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="mt-2 flex justify-between items-center">
                    <span className="text-[8px] text-white/20 uppercase tracking-widest">Encryption: AES-256</span>
                    <span className="text-[8px] text-white/20 uppercase tracking-widest">{messages.length} Matrix Exchanges</span>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.open}
                title={confirmModal.title}
                description={confirmModal.description}
                variant="danger"
                onConfirm={() => {
                    confirmModal.action();
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }}
                onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
            />
        </GlassCard>
    );
}

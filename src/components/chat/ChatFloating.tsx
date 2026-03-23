"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { ChatUI } from "./ChatUI";

export function ChatFloating() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-[104px] right-6 z-[99]"
                    >
                        <ChatUI onClose={() => setIsOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-24 right-6 z-[100] w-14 h-14 rounded-md bg-[var(--accent)] text-white flex items-center justify-center shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)] hover:scale-110 active:scale-95 transition-all group"
            >
                <div className="absolute inset-0 rounded-md bg-[var(--accent)] animate-ping opacity-20 group-hover:opacity-40" />
                {isOpen ? <X size={24} className="text-white" /> : <MessageSquare size={24} className="text-white" />}
            </button>
        </>
    );
}

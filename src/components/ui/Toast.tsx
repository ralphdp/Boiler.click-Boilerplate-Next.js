"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

type ToastType = "success" | "warning" | "error" | "info";

interface Toast {
    id: string;
    title: string;
    description?: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (props: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback(({ title, description, type }: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, description, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className={`pointer-events-auto flex gap-3 p-4 rounded backdrop-blur-md border shadow-2xl overflow-hidden relative ${t.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-500" :
                                    t.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-500" :
                                        t.type === "warning" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" :
                                            "bg-white/10 border-white/20 text-white"
                                }`}
                        >
                            <div className="shrink-0 mt-0.5">
                                {t.type === "success" && <CheckCircle2 size={18} />}
                                {t.type === "error" && <XCircle size={18} />}
                                {t.type === "warning" && <AlertTriangle size={18} />}
                                {t.type === "info" && <CheckCircle2 size={18} className="text-[var(--accent)]" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm tracking-normal">{t.title}</h4>
                                {t.description && <p className="text-xs font-mono opacity-80 mt-1 leading-relaxed">{t.description}</p>}
                            </div>
                            <button onClick={() => removeToast(t.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                                <X size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

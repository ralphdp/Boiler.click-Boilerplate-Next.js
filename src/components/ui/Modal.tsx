"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/core/utils";
import { Button } from "./Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#050505]/95 cursor-pointer"
                        aria-hidden="true"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "relative w-full max-w-2xl bg-[#0a0a0a] p-8 md:p-12 shadow-2xl border border-white/10 z-[110] overflow-hidden",
                            className
                        )}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                    >
                        {/* Removed Legacy Glows for Flat Aesthetic */}

                        <div className="relative z-10 space-y-8">
                            <header className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    {title && (
                                        <h2 id="modal-title" className="text-2xl font-bold tracking-normal text-white">
                                            {title}
                                        </h2>
                                    )}
                                    {description && (
                                        <p className="text-sm text-white/50 leading-relaxed mt-2">
                                            {description}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white"
                                    aria-label="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </header>

                            <div className="py-4">
                                {children}
                            </div>

                            <footer className="flex justify-end pt-4 gap-4 border-t border-white/5">
                                {/* Default actions can go here if needed, or handled via children */}
                            </footer>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

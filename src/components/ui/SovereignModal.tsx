'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SovereignModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function SovereignModal({ isOpen, onClose, children }: SovereignModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Scrim */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-40"
                    />

                    {/* Content Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0a0a0a] border border-white/10 shadow-[0_0_150px_rgba(0,0,0,1)] rounded-2xl w-full max-w-lg pointer-events-auto relative overflow-hidden vanguard-card"
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="p-6">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

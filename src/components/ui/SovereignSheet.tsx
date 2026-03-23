'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SovereignSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function SovereignSheet({ isOpen, onClose, title, children }: SovereignSheetProps) {
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* Drawer panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#050505] border-l border-white/10 backdrop-blur-xl flex flex-col pointer-events-auto selection:bg-accent/30"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            {title && <h2 className="technical text-sm text-white/80">{title}</h2>}
                            <button
                                onClick={onClose}
                                className="text-white/40 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto admin-scrollbar p-6">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

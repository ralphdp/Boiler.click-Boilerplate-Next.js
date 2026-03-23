"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Check } from "lucide-react";
import { SolidCard } from "./SolidCard";
import { Button } from "./Button";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
    isOpen,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger"
}: ConfirmationModalProps) {
    const variantColors = {
        danger: "from-red-500/20 to-transparent border-red-500/20 text-red-500",
        warning: "from-yellow-500/20 to-transparent border-yellow-500/20 text-yellow-500",
        info: "from-[var(--accent)]/20 to-transparent border-[var(--accent)]/20 text-[var(--accent)]"
    };

    const buttonColors = {
        danger: "bg-red-500 hover:bg-red-600",
        warning: "bg-yellow-500 hover:bg-yellow-600",
        info: "bg-[var(--accent)] hover:opacity-90"
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050505]/95"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="max-w-md w-full"
                    >
                        <SolidCard className={`border ${variantColors[variant].split(' ')[1]} p-8 space-y-6 relative overflow-hidden bg-[#0a0a0a]`}>
                            <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r ${variantColors[variant].split(' ')[0]}`} />

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${variantColors[variant].split(' ')[1]} bg-white/5`}>
                                    <AlertCircle className={variantColors[variant].split(' ')[2]} size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold tracking-normal text-white">
                                        {title}
                                    </h2>
                                    <p className="text-sm text-white/50 leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onCancel}
                                    className="flex-1 font-bold border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                                    tooltip="Abort the current operation and close the modal."
                                    tooltipTerm="PROTOCOL_ABORT"
                                >
                                    <X size={14} className="mr-2" /> {cancelText}
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    className={`flex-2 ${buttonColors[variant]} text-white font-bold h-[52px]`}
                                    tooltip="Confirm and execute the requested structural modification."
                                    tooltipTerm="PROTOCOL_EXECUTE"
                                >
                                    <Check size={14} className="mr-2" /> {confirmText}
                                </Button>
                            </div>
                        </SolidCard>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

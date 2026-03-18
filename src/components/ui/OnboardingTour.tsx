"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Sparkles, X } from "lucide-react";

export function OnboardingTour({ userId }: { userId?: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Prevent SSR hydration mismatch and check local storage
        if (typeof window !== "undefined" && userId) {
            const hasSeenTour = localStorage.getItem(`hasSeentour_${userId}`);
            if (!hasSeenTour) {
                // Short delay to let the dashboard render before showing tour
                setTimeout(() => setIsVisible(true), 1500);
            }
        }
    }, [userId]);

    const steps = [
        {
            title: "Welcome to Sovereign V6",
            description: "You have securely authenticated into the Universal Substrate. Let's take a quick look at your command center.",
            highlight: null
        },
        {
            title: "Global Command Matrix",
            description: "Hit CMD+K or CTRL+K anywhere in the platform to instantly jump between modules, change your visual aesthetic, or execute quick commands.",
            highlight: "global-search" // Element ID to highlight if it existed, for now just text
        },
        {
            title: "Terminal Emulation",
            description: "Notice the real-time command logs terminal at the bottom of the interface? System telemetry is streamed securely straight to your console.",
            highlight: "terminal-console"
        },
        {
            title: "You're Fully Initialized",
            description: "Your session is live and actively monitored for security. Access settings, manage API Keys, or drop into your primary workspace.",
            highlight: "user-profile"
        }
    ];

    const completeTour = () => {
        if (userId) localStorage.setItem(`hasSeentour_${userId}`, "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <div className="absolute inset-0 z-0 pointer-events-none" onClick={completeTour} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.2 }}
                    className="relative z-10 w-full max-w-lg bg-black border border-white/20 shadow-2xl overflow-hidden glass-accent shadow-[var(--accent)]/10"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                        <motion.div
                            className="h-full bg-[var(--accent)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    <button onClick={completeTour} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                        <X size={16} />
                    </button>

                    <div className="p-8 space-y-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mx-auto mb-2 border border-[var(--accent)]/30">
                            <Sparkles size={24} />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-xl font-black uppercase tracking-widest text-white font-mono">
                                {steps[step].title}
                            </h2>
                            <p className="text-sm font-serif italic text-white/50 leading-relaxed max-w-xs mx-auto">
                                {steps[step].description}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6 !mb-2">
                            <div className="flex gap-2">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? "bg-[var(--accent)] w-6" : "bg-white/20"}`}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-3">
                                {step < steps.length - 1 ? (
                                    <button
                                        onClick={() => setStep(step + 1)}
                                        className="bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-2 text-xs font-black uppercase tracking-widest hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors flex items-center gap-2 text-white"
                                    >
                                        Next <ChevronRight size={14} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={completeTour}
                                        className="bg-[var(--accent)] text-black border border-[var(--accent)] hover:bg-black hover:text-[var(--accent)] px-6 py-2 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                                    >
                                        Initialize <Check size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

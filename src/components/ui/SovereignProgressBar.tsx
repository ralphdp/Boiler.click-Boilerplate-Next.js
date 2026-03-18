"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function ProgressBarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 800);
        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    return (
        <AnimatePresence>
            {isAnimating && (
                <motion.div
                    initial={{ scaleX: 0, opacity: 1, transformOrigin: "left" }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                    className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent)] to-[var(--accent)]/20 z-[9999] shadow-[0_0_20px_var(--accent)]"
                />
            )}
        </AnimatePresence>
    );
}

export function SovereignProgressBar() {
    return (
        <Suspense fallback={null}>
            <ProgressBarContent />
        </Suspense>
    );
}

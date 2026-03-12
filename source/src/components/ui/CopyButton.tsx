"use client";

import { useState } from "react";

export function CopyButton({ textToCopy, className = "" }: { textToCopy: string, className?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${copied
                ? "border-neon-green/50 text-neon-green bg-neon-green/10 shadow-[0_0_10px_rgba(0,255,0,0.2)]"
                : "border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200"
                } ${className}`}
        >
            {copied ? "COPIED" : "COPY TO CLIPBOARD"}
        </button>
    );
}

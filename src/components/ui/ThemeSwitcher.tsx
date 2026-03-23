"use client";

import { useState, useEffect } from "react";
import { ACTIVE_THEME } from "@/theme/config";

const BASE_THEMES = [
    { name: "Neon Blue", hex: "#00F0FF" },
    { name: "Crimson Red", hex: "#FF003C" },
    { name: "Matrix Green", hex: "#00FF41" },
    { name: "Cyber Pink", hex: "#FF007F" }
];

export function ThemeSwitcher({ activeAccentColor }: { activeAccentColor?: string }) {
    const [open, setOpen] = useState(false);

    const THEMES = [
        { name: "Global Override", hex: activeAccentColor || ACTIVE_THEME.primaryColor },
        ...BASE_THEMES
    ];

    useEffect(() => {
        const saved = localStorage.getItem("Sovereign_Theme");
        if (saved) {
            document.documentElement.style.setProperty('--accent', saved);
        }
    }, []);

    const switchTheme = (hex: string) => {
        document.documentElement.style.setProperty('--accent', hex);
        localStorage.setItem("Sovereign_Theme", hex);
        setOpen(false);
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center h-8 px-3 bg-[#0a0a0a] border border-white/10 hover:bg-white/5 hover:border-[var(--accent)] transition-all pointer-events-auto rounded-md shadow-sm"
                aria-label="Toggle Theme Accent"
                aria-expanded={open}
            >
                <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: 'var(--accent)' }} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-[#0a0a0a] border border-white/10 rounded-md p-2 flex flex-col gap-1 z-50 shadow-2xl">
                        {THEMES.map((theme) => (
                            <button
                                key={theme.hex}
                                onClick={() => switchTheme(theme.hex)}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md text-xs font-semibold text-white/80 text-left transition-colors"
                            >
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.hex }} />
                                {theme.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

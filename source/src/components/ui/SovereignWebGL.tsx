"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ACTIVE_THEME } from "@/theme/config";

const FireEngine = dynamic(() => import("./engines/FireEngine"), { ssr: false });
const GalaxyEngine = dynamic(() => import("./engines/GalaxyEngine"), { ssr: false });

// --- Matrix Engine Core ---
const FONT_SIZE = 16;
const FADE_ALPHA = 0.05;
const DRAW_INTERVAL_MS = 33;
const RECIPES = ["サーモン", "ご飯", "酢", "砂糖", "塩", "のり", "マグロ", "イクラ"]; // Abstracted for Boilerplate

const RANDOM_CHARS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾜｦﾝABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:\",.<>?/`~";

function MatrixEngine({ opacity = 0.15, zIndex = -1, color = "#0F0" }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dropsRef = useRef<number[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d", { willReadFrequently: true });
        if (!canvas || !ctx) return;

        const c = canvas;
        const g = ctx;

        let activeColor = color;
        let observer: MutationObserver | null = null;

        // Matrix Engine requires a literal hex for Canvas fillStyle. Wait for 'var(--accent)' updates dynamically:
        if (color.includes('var(--accent)')) {
            const updateColor = () => {
                const computed = window.getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
                if (computed) activeColor = computed;
            };
            updateColor(); // Initialize
            observer = new MutationObserver(updateColor);
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
        }

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        function resize() {
            c.width = window.innerWidth;
            c.height = window.innerHeight;
            dropsRef.current = Array(Math.floor(c.width / FONT_SIZE)).fill(0);
            g.clearRect(0, 0, c.width, c.height);
        }

        function draw() {
            g.fillStyle = `rgba(0, 0, 0, ${FADE_ALPHA})`;
            g.fillRect(0, 0, c.width, c.height);
            g.font = `${FONT_SIZE}px monospace`;

            const drops = dropsRef.current;
            for (let i = 0; i < drops.length; i++) {
                let text: string;
                if (Math.random() > 0.2) {
                    const phrase = RECIPES[Math.floor(Math.random() * RECIPES.length)];
                    const chars = [...phrase];
                    text = chars[drops[i] % chars.length] || "A";
                } else {
                    text = RANDOM_CHARS.charAt(Math.floor(Math.random() * RANDOM_CHARS.length));
                }

                g.fillStyle = activeColor;
                g.fillText(text, i * FONT_SIZE, drops[i] * FONT_SIZE);

                if (drops[i] * FONT_SIZE > c.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        resize();
        window.addEventListener("resize", resize);
        intervalRef.current = setInterval(draw, DRAW_INTERVAL_MS);

        return () => {
            window.removeEventListener("resize", resize);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (observer) observer.disconnect();
        };
    }, [color]);

    return (
        <div className="fixed inset-0 pointer-events-none transition-opacity duration-1000" style={{ opacity, zIndex }}>
            <canvas ref={canvasRef} className="block w-full h-full" style={{ width: "100%", height: "100%" }} />
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 0%, black 80%)' }} />
        </div>
    );
}

// Removed stubs. Dynamic engines imported above.


export type WebGLVariant = 'matrix' | 'fire' | 'galaxy' | 'none';

interface SovereignWebGLProps {
    variant?: WebGLVariant;
    opacity?: number;
    zIndex?: number;
    color?: string; // Optional override for Matrix.
}

export function SovereignWebGL({ variant = 'none', opacity = 0.15, zIndex = -1, color }: SovereignWebGLProps) {
    if (variant === 'none') return null;

    if (variant === 'matrix') {
        return <MatrixEngine opacity={opacity} zIndex={zIndex} color={color || 'var(--accent)'} />;
    }

    if (variant === 'fire') {
        return <FireEngine color={color || 'var(--accent)'} />;
    }

    if (variant === 'galaxy') {
        return <GalaxyEngine color={color || 'var(--accent)'} />;
    }

    return null;
}

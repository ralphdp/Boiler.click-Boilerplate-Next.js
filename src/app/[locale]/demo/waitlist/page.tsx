"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Send, Mail, Rocket, Globe, Zap, Timer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { useState, useEffect } from "react";

export default function WaitlistDemoPage() {
    const { t, language } = useTranslation();
    const { toast } = useToast();
    const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 23, minutes: 59, seconds: 59 });

    useEffect(() => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 12);
        targetDate.setHours(targetDate.getHours() + 23);

        const timer = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            const d = Math.floor(difference / (1000 * 60 * 60 * 24));
            const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((difference % (1000 * 60)) / 1000);

            if (difference < 0) {
                clearInterval(timer);
                return;
            }

            setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: t.waitlist?.vectorRecorded || "Vector Recorded",
            description: t.waitlist?.summonedUponLaunch || "You will be summoned upon launch.",
            type: "success"
        });
    };

    return (
        <main className="relative min-h-screen p-6 py-24 text-white overflow-hidden flex flex-col items-center bg-black">
            {/* Nav Header */}
            <div className="w-full max-w-6xl mb-24 flex items-center justify-between border-b border-white/5 pb-6 relative z-10">
                <Button as={Link} href={`/${language}/demo`} variant="ghost" className="w-fit text-white/50 px-0 hover:text-white transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Hub
                </Button>
                <div className="flex items-center gap-2 opacity-30 text-[10px] uppercase font-black tracking-widest text-[var(--accent)]">
                    <Globe size={12} />
                    Protocol L6.8
                </div>
            </div>

            {/* Content Alpha */}
            <div className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8"
                >
                    <div className="w-16 h-16 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl flex items-center justify-center p-0 text-[var(--accent)] shadow-[0_0_50px_rgba(var(--accent-rgb),0.2)]">
                        <Rocket size={32} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent)]/5 border border-[var(--accent)]/10 text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mb-4">
                        <Sparkles size={10} className="text-[var(--accent)]" />
                        STEALTH PROTOCOL ACTIVE
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                        PREPARING <br /> <span className="text-[var(--accent)]">ZENITH NODE</span>
                    </h1>
                    <p className="text-white/40 font-mono text-sm max-w-xl mx-auto uppercase tracking-widest leading-relaxed">
                        The architecture is currently in a high-fidelity refinement phase. Provide your communications vector to be notified upon public deployment.
                    </p>
                </motion.div>

                {/* Countdown Grid */}
                <div className="grid grid-cols-4 gap-4 md:gap-8 mt-16 mb-24 max-w-xl w-full">
                    {Object.entries(timeLeft).map(([label, value]) => (
                        <div key={label} className="flex flex-col items-center space-y-2">
                            <div className="text-3xl md:text-5xl font-black font-mono text-white/90">
                                {String(value).padStart(2, '0')}
                            </div>
                            <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--accent)]/50">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Vector Capture Input */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-2xl"
                >
                    <div className="glass p-2 border border-white/5 rounded-0 flex items-center relative group focus-within:border-[var(--accent)]/30 transition-all">
                        <div className="pl-4 pr-2 text-white/20 group-focus-within:text-[var(--accent)] transition-colors">
                            <Mail size={16} />
                        </div>
                        <input
                            required
                            type="email"
                            placeholder="TRANSMIT EMAIL VECTOR..."
                            className="bg-transparent border-none outline-none text-sm font-mono text-white placeholder-white/20 py-3 flex-1 px-2"
                        />
                        <Button
                            onClick={handleJoin}
                            className="w-fit bg-[var(--accent)] text-white hover:bg-white hover:text-black transition-all px-6 py-3 text-[10px] font-black uppercase tracking-widest h-fit"
                        >
                            JOIN
                        </Button>
                    </div>
                </motion.div>

                {/* Features Substrate */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-32 border-t border-white/5 pt-12 text-left opacity-30 hover:opacity-100 transition-opacity">
                    {[
                        { icon: Zap, title: "Edge Deployment", desc: "Zero-latency distribution." },
                        { icon: Rocket, title: "Infinite Scale", desc: "Hardened Firebase logic." },
                        { icon: Timer, title: "Instant Setup", desc: "Boilerplate ready in 5 min." }
                    ].map(f => (
                        <div key={f.title} className="flex gap-4">
                            <div className="p-2 border border-white/10 h-fit"><f.icon size={14} className="text-[var(--accent)]" /></div>
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black uppercase tracking-widest">{f.title}</h4>
                                <p className="text-[9px] font-mono text-white/50 leading-tight">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Shader Mimic */}
            <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-[var(--accent)]/5 to-transparent pointer-events-none" />
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:64px:64px]" />
            </div>
        </main>
    );
}

"use client";

import { motion } from "framer-motion";
import {
    ArrowLeft, Zap, Shield, Globe, Layers, Cpu, Code2,
    ArrowRight, CheckCircle2, Star, Users, Database, Server,
    Monitor, Lock, Smartphone, Terminal, Sparkles
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SolidCard } from "@/components/ui/SolidCard";
import { useTranslation } from "@/core/i18n/LanguageProvider";

export default function LandingDemoPage() {
    const { t, language } = useTranslation();

    const sections = [
        { icon: Zap, title: "Extreme Velocity", desc: "Built on Next.js 16 for near-instant rendering and edge execution." },
        { icon: Shield, title: "Sovereign Security", desc: "Integrated NextAuth + Firebase Guards for persistent identity protection." },
        { icon: Globe, title: "Universal I18n", desc: "Native translation bridging for global expansion out of the box." },
        { icon: Layers, title: "Modular Substrate", desc: "Decoupled architecture for rapid feature injection and scaling." }
    ];

    const stats = [
        { label: "Execution Time", value: "85ms" },
        { label: "Uptime Protocol", value: "99.9%" },
        { label: "Auth Nodes", value: "12,402" },
        { label: "Deployment Pulse", value: "LATEST" }
    ];

    const steps = [
        {
            title: "Clone Node",
            desc: "Instantiate your local repository with one zero-bias command.",
            icon: Terminal
        },
        {
            title: "Configure Origin",
            desc: "Bind your Firebase and Stripe keys via the automated root console.",
            icon: Database
        },
        {
            title: "Deploy Zenith",
            desc: "Push to the edge and experience instant architectural stability.",
            icon: Server
        }
    ];

    return (
        <main className="relative min-h-screen text-white overflow-x-hidden selection:bg-[var(--accent)]/30">
            {/* Header / Nav Removed */}
            <div className="max-w-7xl mx-auto px-6 pt-12">
                <Button as={Link} href={`/${language}/demo`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Hub
                </Button>
            </div>

            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-12 relative overflow-hidden pt-32 pb-48">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 space-y-8 max-w-5xl"
                >
                    <h1 className="text-6xl md:text-9xl font-semibold tracking-normal leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">
                        ENGINEERING <br /> <span className="text-[var(--accent)]">SOVEREIGNTY</span>
                    </h1>
                    <p className="text-white/50 font-sans text-xl md:text-2xl max-w-2xl mx-auto">
                        The definitive boilerplate for high-fidelity SaaS applications and localized commerce.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                        <Button className="px-12 py-6 bg-[var(--accent)] text-white hover:bg-white hover:text-black text-sm">
                            LAUNCH SUBSTRATE
                        </Button>
                        <Button variant="outline" className="px-12 py-6 text-sm">
                            VIEW BLUEPRINTS
                        </Button>
                    </div>
                </motion.div>

                {/* Animated Background Primitives */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] pointer-events-none opacity-20">
                    <div className="absolute inset-0 border border-[var(--accent)]/20 translate-z-10 animate-[spin_60s_linear_infinite]" />
                    <div className="absolute inset-16 border border-white/5 animate-[spin_40s_linear_infinite_reverse]" />
                    <div className="absolute top-0 left-0 w-32 h-32 border border-[var(--accent)]/30 animate-pulse" />
                </div>
            </section>

            {/* Statistics Band */}
            <section className="border-y border-white/5 py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[var(--accent)]/5 opacity-20 blur-[100px] rounded-full" />
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="space-y-2"
                        >
                            <div className="text-4xl md:text-5xl font-semibold text-white/90 font-mono">{stat.value}</div>
                            <div className="text-[10px] font-semibold tracking-normal] text-[var(--accent)]">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="p-6 py-48 max-w-6xl mx-auto text-center space-y-24">
                <div className="space-y-4">
                    <h2 className="text-4xl font-semibold tracking-normal">Architectural <span className="text-[var(--accent)]">Core</span></h2>
                    <p className="text-white/40 font-mono text-sm tracking-normal">Rigorous primitives for the modern web.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sections.map((item, i) => (
                        <SolidCard key={i} className="p-12 group hover:border-[var(--accent)]/50 transition-all text-left">
                            <item.icon size={32} className="text-[var(--accent)] mb-8 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-bold tracking-normal mb-4">{item.title}</h3>
                            <p className="text-white/50 font-mono text-sm leading-relaxed">{item.desc}</p>
                            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[9px] font-semibold tracking-normal text-white/20">Module Path: /core/substrate</span>
                                <ArrowRight size={14} className="text-white/20 group-hover:text-[var(--accent)] transition-colors" />
                            </div>
                        </SolidCard>
                    ))}
                </div>
            </section>

            {/* Step Process Section */}
            <section id="process" className="py-48 px-6 bg-white/[0.02] border-y border-white/5 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-24 space-y-4">
                        <h2 className="text-4xl font-semibold tracking-normal">Initialization <span className="text-[var(--accent)]">Protocol</span></h2>
                        <p className="text-white/40 font-mono text-sm tracking-normal">From repository to edge in 300 seconds.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-12 left-24 right-24 h-px bg-white/10" />

                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative z-10 flex flex-col items-center text-center space-y-6"
                            >
                                <div className="w-24 h-24 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-lg border border-white/10 flex items-center justify-center p-0 bg-black group hover:border-[var(--accent)] transition-colors">
                                    <step.icon size={32} className="text-white/40 group-hover:text-[var(--accent)] transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold tracking-normal">{step.title}</h4>
                                    <p className="text-sm text-white/50 leading-relaxed max-w-xs">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="py-48 px-6 max-w-5xl mx-auto">
                <SolidCard className="p-16 text-center space-y-12 border-[var(--accent)]/10 bg-gradient-to-br from-white/[0.03] to-transparent">
                    <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} className="fill-[var(--accent)] text-[var(--accent)]" />)}
                    </div>
                    <blockquote className="text-2xl md:text-4xl font-sans text-white/90 leading-relaxed">
                        "The Sovereign boilerplate didn't just speed up our workflow; it fundamentally restructured how we think about architectural state. The Next.js 16 integration is flawless."
                    </blockquote>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#0a0a0a] border border-white/10 rounded-xl shadow-lg border border-white/20 flex items-center justify-center text-[10px] font-semibold tracking-normal text-[var(--accent)]">MS</div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-semibold tracking-normal text-white">Marcus Sterling</div>
                            <div className="text-[9px] font-semibold tracking-normal text-[var(--accent)]">LEAD PROTOCOL ENGINEER // AXON CORP</div>
                        </div>
                    </div>
                </SolidCard>
            </section>

            {/* Tech Stack Band */}
            <section className="p-12 border-y border-white/5 bg-white/[0.02] flex flex-wrap justify-center gap-12 md:gap-24 items-center">
                {[
                    { name: 'NEXT.JS 16', icon: Zap },
                    { name: 'TAILWIND V4', icon: Sparkles },
                    { name: 'FIREBASE', icon: Smartphone },
                    { name: 'STRIPE', icon: Lock },
                    { name: 'NEXTAUTH', icon: Shield }
                ].map(tech => (
                    <div key={tech.name} className="flex items-center gap-2 text-[10px] font-semibold tracking-normal] text-white/20 hover:text-[var(--accent)] transition-colors cursor-default group">
                        <tech.icon size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        {tech.name}
                    </div>
                ))}
            </section>

            {/* Final CTA Bridge */}
            <section className="py-64 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-[var(--accent)]/10 to-transparent" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative z-10 space-y-12 max-w-3xl mx-auto"
                >
                    <h2 className="text-5xl md:text-8xl font-semibold tracking-normal leading-none">
                        READY TO <br /> <span className="text-[var(--accent)]">GOVERN?</span>
                    </h2>
                    <p className="text-white/50 font-mono text-sm tracking-normal max-w-xl mx-auto">
                        Join the elite tier of developers building on the Vanguard Substrate. Your commercial future begins here.
                    </p>
                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <Button className="px-16 py-8 bg-white text-black hover:bg-[var(--accent)] hover:text-white transition-all text-sm font-semibold">
                            INITIALIZE NOW
                        </Button>
                        <Button variant="outline" className="px-16 py-8 text-sm hover:border-[var(--accent)] transition-all">
                            CONTACT ARCHITECT
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="p-12 border-t border-white/5 text-center space-y-8 bg-black">
                <div className="flex justify-center gap-12 text-[10px] font-semibold tracking-normal text-white/30">
                    <a href="#" className="hover:text-[var(--accent)]">Twitter</a>
                    <a href="#" className="hover:text-[var(--accent)]">GitHub</a>
                    <a href="#" className="hover:text-[var(--accent)]">Discord</a>
                </div>
                <div className="text-white/10 font-mono text-[9px] tracking-normal]">
                    &copy; 2026 Sovereign Architecture // All rights reserved. // Protocol 6/11
                </div>
            </footer>

            {/* Grid Backdrop */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:64px_64px]" />
            </div>
        </main>
    );
}

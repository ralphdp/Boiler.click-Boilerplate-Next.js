"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShoppingCart, ShieldAlert, X, TerminalSquare, User, Key, Activity, Database, Cpu } from "lucide-react";
import { getGlobalOverrides, getStoreProducts } from "@/core/actions/admin";
import { useTranslation } from "@/core/i18n/LanguageProvider";

export default function DemoPage() {
    const { language } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [commerceMode, setCommerceMode] = useState<string>("none");
    const [pricingTiers, setPricingTiers] = useState<any[]>([
        {
            "id": "basic",
            "name": "Basic Node",
            "price": "9",
            "features": ["Standard Telemetry", "Email Support", "Priority Access"],
            "buttonText": "Initialize Basic"
        },
        {
            "id": "pro",
            "name": "Pro Node",
            "price": "99",
            "features": ["Advanced Telemetry", "24/7 Priority Support", "Full Admin Access"],
            "buttonText": "Initialize Pro"
        }
    ]);
    const [recommendedPlan, setRecommendedPlan] = useState<string>("pro");
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([
            getGlobalOverrides(),
            getStoreProducts()
        ]).then(([overrides, prods]) => {
            setCommerceMode(overrides.commerceMode || "none");
            if (overrides.pricingTiers) {
                const processedTiers = overrides.pricingTiers.map((t: any) => ({
                    ...t,
                    features: (t.features || []).map((f: any) =>
                        typeof f === 'string' ? { name: f, active: true } : f
                    )
                }));
                setPricingTiers(processedTiers);
            }
            if (overrides.recommendedPlan) setRecommendedPlan(overrides.recommendedPlan);
            setProducts(prods);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6 text-white">
                <div className="text-xs text-[var(--accent)] font-mono animate-pulse tracking-widest">[ COMPILING DEMO MATRIX ]</div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen p-6 text-white overflow-hidden flex flex-col items-center">

            <div className="w-full max-w-6xl mt-12 mb-6">
                <Button as={Link} href={`/${language}`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Protocol
                </Button>
            </div>

            {/* Vanguard Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-4xl text-center space-y-6 mt-12 mb-24 z-10"
            >
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-widest">
                    Vanguard <span className="text-[var(--accent)] text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-white">Showcase</span>
                </h1>
                <p className="text-white/50 font-serif italic text-lg md:text-xl max-w-2xl mx-auto">
                    Experience the dynamic capabilities of the Sovereign boilerplate. This view reacts in real-time to your Admin Panel configuration.
                </p>
            </motion.div>

            {/* Shape-Shifting Commerce Matrix */}
            <div className="w-full max-w-6xl z-10 pb-32">
                {commerceMode === "saas" && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="space-y-12"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--accent)]">Subscription Tiers</h2>
                            <p className="text-sm font-mono text-white/50">SaaS mode detected. Dynamic pricing arrays active.</p>
                        </div>

                        <div className={`grid gap-8 w-full mx-auto ${pricingTiers.length === 1 ? 'grid-cols-1 max-w-md' :
                                pricingTiers.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl' :
                                    pricingTiers.length === 3 ? 'grid-cols-1 md:grid-cols-3 max-w-6xl' :
                                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl'
                            }`}>
                            {pricingTiers.map(tier => (
                                <GlassCard key={tier.id} className={`p-8 flex flex-col justify-between transition-all relative overflow-hidden ${recommendedPlan === tier.id ? 'border-[var(--accent)]/50 bg-[var(--accent)]/5 shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)]' : 'hover:border-white/20'}`}>
                                    {recommendedPlan === tier.id && <div className="absolute top-0 right-0 bg-[var(--accent)] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1">Recommended</div>}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h3 className={`text-xl font-bold uppercase tracking-widest ${recommendedPlan === tier.id ? 'text-[var(--accent)]' : ''}`}>{tier.name}</h3>
                                            <div className="text-4xl font-black">${tier.price}<span className="text-sm font-normal text-white/50">/mo</span></div>
                                        </div>
                                        <ul className="space-y-3 font-mono text-xs text-white/70">
                                            {tier.features.map((feat: any, i: number) => {
                                                const isActive = typeof feat === 'string' ? true : feat.active !== false;
                                                const featureName = typeof feat === 'string' ? feat : feat.name;
                                                return (
                                                    <li key={i} className={`flex items-center gap-2 ${!isActive ? 'text-white/30 decoration-white/30' : ''}`}>
                                                        {isActive ? (
                                                            <CheckCircle2 size={14} className="text-[var(--accent)] flex-shrink-0" />
                                                        ) : (
                                                            <X size={14} className="text-white/30 flex-shrink-0" />
                                                        )}
                                                        <span className={!isActive ? 'line-through' : ''}>{featureName}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                    <Button className={`w-full mt-8 uppercase tracking-widest font-bold ${recommendedPlan === tier.id ? 'bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>{tier.buttonText}</Button>
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                )}

                {commerceMode === "store" && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="space-y-12"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--accent)]">Sovereign Store</h2>
                            <p className="text-sm font-mono text-white/50">E-commerce mode detected. Rendering product arrays.</p>
                        </div>

                        {products.length === 0 ? (
                            <GlassCard className="p-12 text-center flex flex-col items-center justify-center border-dashed border-white/20">
                                <ShoppingCart size={32} className="text-white/20 mb-4" />
                                <div className="text-sm font-mono text-white/50">Store Active. Zero products detected in Firebase matrix.</div>
                            </GlassCard>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {products.map(product => (
                                    <GlassCard key={product.id} className="flex flex-col overflow-hidden hover:border-[var(--accent)]/50 transition-colors group">
                                        {/* Image Placeholder or Actual Image */}
                                        <div className="w-full h-48 bg-black/50 border-b border-white/5 relative flex items-center justify-center overflow-hidden">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="font-mono text-[10px] text-white/20 uppercase tracking-widest">No Image Asset</div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 font-mono text-xs text-[var(--accent)] font-bold">
                                                ${product.price}
                                            </div>
                                        </div>
                                        <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                                            <div className="space-y-2">
                                                <h3 className="font-bold text-lg">{product.name}</h3>
                                                <p className="text-xs text-white/50 line-clamp-2">{product.description}</p>
                                            </div>
                                            <a
                                                href={product.stripeLink || "#"}
                                                target="_blank"
                                                className="w-full bg-white/5 border border-white/10 hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] uppercase tracking-widest text-xs font-bold transition-all p-2 text-center rounded block"
                                            >
                                                Acquire Asset
                                            </a>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {commerceMode === "none" && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <GlassCard className="max-w-xl mx-auto p-12 flex flex-col items-center justify-center border border-white/5">
                            <div className="w-16 h-16 rounded-full glass border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center mb-6">
                                <ShieldAlert size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Commerce Matrix Offline</h2>
                            <p className="text-xs font-mono text-white/50">Admin configuration set to static structural rendering.</p>
                        </GlassCard>
                    </motion.div>
                )}
            </div>


            {/* Vanguard Component Showcase */}
            <div className="w-full max-w-6xl z-10 space-y-24 mb-32">

                {/* Section Header */}
                <div className="text-center space-y-4">
                    <div className="w-16 h-px bg-[var(--accent)] mx-auto opacity-50" />
                    <h2 className="text-3xl font-black uppercase tracking-widest">Substrate Grid</h2>
                    <p className="text-white/50 font-mono text-sm">Visualizing component architecture and interaction states.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Terminal Simulator */}
                    <GlassCard className="p-8 flex flex-col gap-4 border-[var(--accent)]/20 shadow-[0_0_15px_rgba(var(--accent-rgb),0.05)]">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <TerminalSquare className="text-[var(--accent)]" size={20} />
                            <h3 className="text-lg font-bold uppercase tracking-widest">Audit Terminal</h3>
                        </div>
                        <div className="bg-black/80 rounded p-4 font-mono text-xs text-[var(--accent)]/80 space-y-2 flex-grow border border-white/5">
                            <div className="flex gap-2">
                                <span className="text-white/30">[SYS]</span>
                                <span>Establishing secure handshake...</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-white/30">[AUTH]</span>
                                <span>Node connection verified.</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-white/30">[DB]</span>
                                <span>Retrieving state vectors from Firebase... OK</span>
                            </div>
                            <div className="flex gap-2 text-white/50 animate-pulse mt-4">
                                <span className="text-[var(--accent)]">root@vanguard:~#</span> <span className="w-2 h-4 bg-white/50 inline-block animate-ping" />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Identity & Input Forms */}
                    <GlassCard className="p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <User className="text-[var(--accent)]" size={20} />
                            <h3 className="text-lg font-bold uppercase tracking-widest">Identity Handshake</h3>
                        </div>
                        <div className="space-y-4 w-full max-w-sm mx-auto flex-grow flex flex-col justify-center">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">Sovereign Identifier / Email</label>
                                <input type="text" placeholder="node@protocol.cx" className="w-full bg-black/50 border border-white/10 text-sm px-4 py-3 outline-none focus:border-[var(--accent)] focus:bg-[var(--accent)]/5 text-white font-mono transition-all rounded hover:border-white/20" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">Cryptographic Key / Password</label>
                                <div className="relative">
                                    <input type="password" placeholder="••••••••••••" className="w-full bg-black/50 border border-white/10 text-sm px-4 py-3 outline-none focus:border-[var(--accent)] focus:bg-[var(--accent)]/5 text-white font-mono transition-all rounded hover:border-white/20" />
                                    <Key size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
                                </div>
                            </div>
                            <Button className="w-full uppercase tracking-widest mt-2">Transmit Identity</Button>
                        </div>
                    </GlassCard>

                </div>

                {/* State Vectors / Data Table */}
                <GlassCard className="p-8 overflow-x-auto">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                        <Database className="text-[var(--accent)]" size={20} />
                        <h3 className="text-lg font-bold uppercase tracking-widest">Telemetry Matrix</h3>
                    </div>
                    <table className="w-full text-left font-mono text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-white/10 text-white/50 text-xs">
                                <th className="pb-3 px-4 font-normal">Node ID</th>
                                <th className="pb-3 px-4 font-normal">Status</th>
                                <th className="pb-3 px-4 font-normal">Throughput</th>
                                <th className="pb-3 px-4 font-normal text-right">Uptime</th>
                            </tr>
                        </thead>
                        <tbody className="text-white/80">
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 flex items-center gap-2"><Cpu size={14} className="text-[var(--accent)]" /> ALPHA-01</td>
                                <td className="py-4 px-4"><span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded">ONLINE</span></td>
                                <td className="py-4 px-4">1,402 req/s</td>
                                <td className="py-4 px-4 text-right">99.99%</td>
                            </tr>
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 flex items-center gap-2"><Cpu size={14} className="text-white/30" /> BETA-02</td>
                                <td className="py-4 px-4"><span className="text-xs bg-white/10 text-white/50 border border-white/20 px-2 py-0.5 rounded">STANDBY</span></td>
                                <td className="py-4 px-4">0 req/s</td>
                                <td className="py-4 px-4 text-right">--</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors text-white/30">
                                <td className="py-4 px-4 flex items-center gap-2"><Cpu size={14} className="text-red-500/50" /> DELTA-09</td>
                                <td className="py-4 px-4"><span className="text-xs bg-red-500/10 text-red-500/80 border border-red-500/20 px-2 py-0.5 rounded line-through">HALTED</span></td>
                                <td className="py-4 px-4">0 req/s</td>
                                <td className="py-4 px-4 text-right">ERR_SYNC</td>
                            </tr>
                        </tbody>
                    </table>
                </GlassCard>

                {/* Button Matrix */}
                <GlassCard className="p-8 border-dashed border-white/10 bg-transparent">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-8">
                        <Activity className="text-[var(--accent)]" size={20} />
                        <h3 className="text-lg font-bold uppercase tracking-widest text-white/50">Interaction States</h3>
                    </div>
                    <div className="flex flex-wrap gap-6 justify-center">
                        <Button className="px-8 bg-[var(--accent)] text-white hover:bg-[var(--accent)]/80 hover:scale-105 active:scale-95 transition-all">PRIMARY NODE</Button>
                        <Button variant="ghost" className="px-8 border border-white/20 text-white/80 hover:bg-white/10 hover:text-white uppercase tracking-widest font-bold font-mono hover:-translate-y-1 transition-all">GHOST NODE</Button>
                        <Button className="px-8 bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]">HALT PROTOCOL</Button>
                    </div>
                </GlassCard>

            </div>
            {/* Grid Backdrop */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

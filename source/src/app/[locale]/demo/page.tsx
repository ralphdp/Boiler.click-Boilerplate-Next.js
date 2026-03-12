"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShoppingCart, ShieldAlert , X} from "lucide-react";
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

                        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(pricingTiers.length || 2, 4)} gap-8 max-w-6xl w-full mx-auto`}>
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
                                                            <CheckCircle2 size={14} className="text-[var(--accent)] flex-shrink-0"/>
                                                        ) : (
                                                            <X size={14} className="text-white/30 flex-shrink-0"/>
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

            {/* Grid Backdrop */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

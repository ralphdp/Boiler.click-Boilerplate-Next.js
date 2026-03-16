"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShoppingCart, ShieldAlert, X, TerminalSquare, User, Key, Activity, Database, Cpu, ChevronDown, Palette, Loader2, Maximize, Eye, EyeOff, Copy, FileUp, Sparkles, SlidersHorizontal, Settings, Layers } from "lucide-react";
import { SovereignWebGL } from "@/components/ui/SovereignWebGL";
import { getGlobalOverrides, getStoreProducts } from "@/core/actions/admin";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";

function FAQItem({ faq }: { faq: { q: string; a: string } }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="flex flex-col group p-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between outline-none text-left w-full hover:text-[var(--accent)] transition-colors"
            >
                <span className="font-bold text-lg">{faq.q}</span>
                <ChevronDown size={20} className={`transform transition-transform duration-300 text-white/50 group-hover:text-[var(--accent)] ${isOpen ? "rotate-180 text-[var(--accent)]" : ""}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pt-4 text-white/60 font-mono text-sm leading-relaxed">
                            {faq.a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function DemoPage() {
    const { t, language } = useTranslation();
    const { toast } = useToast();
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
    const [baseTheme, setBaseTheme] = useState<string>('#a855f7');

    // Live Data Simulation State
    const [reqRate, setReqRate] = useState(1402);
    const [terminalLines, setTerminalLines] = useState<string[]>([
        "Establishing secure handshake...",
        "Node connection verified.",
        "Retrieving state vectors from Firebase... OK"
    ]);

    // Modal Simulation State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Showcase Addition State
    const [microToggle, setMicroToggle] = useState(false);
    const [sliderValue, setSliderValue] = useState(50);
    const [btnLoading, setBtnLoading] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [tempWebGl, setTempWebGl] = useState<'matrix' | 'galaxy' | 'fire' | 'none'>('none');
    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

    const handleCopy = () => {
        navigator.clipboard.writeText("sk_live_vanguard_8F92A2B3D4C5E6");
        toast({ title: t.demoMatrix.copiedClipboard, description: t.demoMatrix.apiCopied, type: "success" });
    }

    // Dynamic Theme Sandbox Engine
    const setTempTheme = (hex: string) => {
        document.documentElement.style.setProperty('--accent', hex);
    };

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
                setPricingTiers(processedTiers.filter((t: any) => !t.hidden));
            }
            if (overrides.recommendedPlan) setRecommendedPlan(overrides.recommendedPlan);
            if (overrides.primaryColor) setBaseTheme(overrides.primaryColor);
            setProducts(prods.items || []);
        }).finally(() => setLoading(false));

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Start Live Telemetry Simulation Loop
        const simInterval = setInterval(() => {
            setReqRate(prev => Math.max(1200, prev + Math.floor(Math.random() * 80) - 40));
            if (Math.random() > 0.6) {
                const logs = [
                    "Re-syncing parity checks...",
                    "Flushing telemetry to Upstash...",
                    "Client handshake [OK]",
                    "GC execution completed cleanly.",
                    "Refreshing distributed memory vectors...",
                    "Sovereign node ALIVE and transmitting.",
                ];
                setTerminalLines(prev => {
                    const next = [...prev, logs[Math.floor(Math.random() * logs.length)]];
                    return next.length > 8 ? next.slice(next.length - 8) : next;
                });
            }
        }, 1500);

        return () => {
            clearInterval(simInterval);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-6 text-white space-y-8">
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white/5 border border-white/10 p-6 space-y-4 animate-pulse">
                            <div className="h-6 bg-white/10 w-1/3"></div>
                            <div className="h-12 bg-white/10 w-1/2"></div>
                            <div className="space-y-2 mt-8">
                                <div className="h-2 bg-white/10 w-full"></div>
                                <div className="h-2 bg-white/10 w-5/6"></div>
                                <div className="h-2 bg-white/10 w-4/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-xs text-[var(--accent)] font-mono animate-pulse tracking-widest">[ COMPILING DEMO MATRIX ]</div>
            </main>
        );
    }

    return (
        <main className="relative z-10 min-h-screen p-6 text-white overflow-hidden flex flex-col items-center">
            {/* Global Cursor Glow effect */}
            <div
                className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, var(--accent) 0%, transparent 40%)`,
                    opacity: 0.08
                }}
            />

            {/* Background WebGL Override */}
            {tempWebGl !== 'none' && (
                <div className="fixed inset-0 z-[-1] pointer-events-none">
                    <SovereignWebGL variant={tempWebGl} opacity={0.3} zIndex={-1} color="var(--accent)" />
                </div>
            )}

            {/* Modal Overlay Override */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-black/80 backdrop-blur-xl border border-white/10 p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50"></div>
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-6">
                                <Maximize className="text-[var(--accent)]" size={24} />
                                <h3 className="text-xl font-bold uppercase tracking-widest leading-none mt-1">{t.demoMatrix.modalOverride}</h3>
                            </div>
                            <p className="text-white/70 font-mono text-sm leading-relaxed mb-6">
                                The architectural modal system supports deeply nested z-indexes, glassmorphism, and instant framer-motion dismissal.
                            </p>
                            <Button className="w-full bg-[var(--accent)] text-white hover:bg-white hover:text-black transition-colors uppercase tracking-widest font-bold" onClick={() => { setIsModalOpen(false); toast({ title: t.demoMatrix.commandAcknowledged, description: t.demoMatrix.modalClosed, type: "success" }) }}>
                                Affirm Directive
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                    Vanguard <span className="text-[var(--accent)] text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-white">{t.demoMatrix.vanguardShowcase.split(" ").slice(1).join(" ")}</span>
                </h1>
                <p className="text-white/50 font-serif italic text-lg md:text-xl max-w-2xl mx-auto">
                    Experience the dynamic capabilities of the Sovereign boilerplate. This view reacts in real-time to your Admin Panel configuration.
                </p>

                {/* Theme Sandbox */}
                <div className="pt-8 flex flex-col items-center gap-4">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-bold font-mono">{t.demoMatrix.sandboxOverride}</p>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2">
                        <Palette size={14} className="text-white/50 ml-2" />
                        {[baseTheme, '#00F0FF', '#FF003C', '#00FF41', '#FF007F'].map(hex => (
                            <button
                                key={hex}
                                onClick={() => setTempTheme(hex)}
                                className="w-6 h-6 border border-white/20 hover:scale-110 active:scale-95 transition-all outline-none"
                                style={{ backgroundColor: hex }}
                                title={`Set Theme to ${hex}`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Shape-Shifting Commerce Matrix */}
            <div className="w-full max-w-6xl z-10 pb-32">
                {commerceMode === "saas" && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="space-y-12"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--accent)]">{t.demoMatrix.subscriptionTiers}</h2>
                            <p className="text-sm font-mono text-white/50">{t.demoMatrix.saasModeDesc}</p>
                        </div>

                        <div className={`grid gap-8 w-full mx-auto ${pricingTiers.length === 1 ? 'grid-cols-1 max-w-md' :
                            pricingTiers.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl' :
                                pricingTiers.length === 3 ? 'grid-cols-1 md:grid-cols-3 max-w-6xl' :
                                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl'
                            }`}>
                            {pricingTiers.map(tier => (
                                <GlassCard key={tier.id} className={`p-8 flex flex-col justify-between transition-all relative overflow-hidden ${recommendedPlan === tier.id ? 'border-[var(--accent)]/50 bg-[var(--accent)]/5 shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)]' : 'hover:border-white/20'}`}>
                                    {recommendedPlan === tier.id && <div className="absolute top-0 right-0 bg-[var(--accent)] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1">{t.demoMatrix.recommended}</div>}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h3 className={`text-xl font-bold uppercase tracking-widest ${recommendedPlan === tier.id ? 'text-[var(--accent)]' : ''}`}>{tier.name}</h3>
                                            <div className="text-4xl font-black">${tier.price}<span className="text-sm font-normal text-white/50">{t.demoMatrix.perMonth}</span></div>
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
                            <h2 className="text-2xl font-bold uppercase tracking-widest text-[var(--accent)]">{t.demoMatrix.sovereignStore}</h2>
                            <p className="text-sm font-mono text-white/50">{t.demoMatrix.ecommerceDesc}</p>
                        </div>

                        {products.length === 0 ? (
                            <GlassCard className="p-12 text-center flex flex-col items-center justify-center border-dashed border-white/20">
                                <ShoppingCart size={32} className="text-white/20 mb-4" />
                                <div className="text-sm font-mono text-white/50">{t.demoMatrix.zeroProducts}</div>
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
                                                <div className="font-mono text-[10px] text-white/20 uppercase tracking-widest">{t.demoMatrix.noImageAsset}</div>
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
                                                className="w-full bg-white/5 border border-white/10 hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] uppercase tracking-widest text-xs font-bold transition-all p-2 text-center block"
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
                            <div className="w-16 h-16 glass border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center mb-6">
                                <ShieldAlert size={24} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-widest mb-2">{t.demoMatrix.commerceOffline}</h2>
                            <p className="text-xs font-mono text-white/50">{t.demoMatrix.offlineDesc}</p>
                        </GlassCard>
                    </motion.div>
                )}
            </div>


            {/* Vanguard Component Showcase */}
            <motion.div
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="w-full max-w-6xl z-10 space-y-24 mb-32"
            >

                {/* Section Header */}
                <div className="text-center space-y-4">
                    <div className="w-16 h-px bg-[var(--accent)] mx-auto opacity-50" />
                    <h2 className="text-3xl font-black uppercase tracking-widest">{t.demoMatrix.substrateGrid}</h2>
                    <p className="text-white/50 font-mono text-sm">{t.demoMatrix.gridDesc}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Terminal Simulator */}
                    <GlassCard className="p-8 flex flex-col gap-4 border-[var(--accent)]/20 shadow-[0_0_15px_rgba(var(--accent-rgb),0.05)]">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <TerminalSquare className="text-[var(--accent)]" size={20} />
                            <h3 className="text-lg font-bold uppercase tracking-widest">{t.demoMatrix.auditTerminal}</h3>
                        </div>
                        <div className="bg-black/80 p-4 font-mono text-xs text-[var(--accent)]/80 gap-2 flex-grow border border-white/5 flex flex-col justify-end overflow-hidden h-64">
                            {terminalLines.map((line, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
                                    <span className="text-white/30 shrink-0">[SYS]</span>
                                    <span>{line}</span>
                                </motion.div>
                            ))}
                            <div className="flex gap-2 text-white/50 animate-pulse mt-2">
                                <span className="text-[var(--accent)]">root@vanguard:~#</span> <span className="w-2 h-4 bg-white/50 inline-block animate-ping" />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Identity & Input Forms */}
                    <GlassCard className="p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <User className="text-[var(--accent)]" size={20} />
                            <h3 className="text-lg font-bold uppercase tracking-widest">{t.demoMatrix.identityHandshake}</h3>
                        </div>
                        <div className="space-y-4 w-full max-w-sm mx-auto flex-grow flex flex-col justify-center">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">{t.demoMatrix.identifierEmail}</label>
                                <input type="text" placeholder="node@protocol.cx" className="w-full bg-black/50 border border-white/10 text-sm px-4 py-3 outline-none focus:border-[var(--accent)] focus:bg-[var(--accent)]/5 text-white font-mono transition-all hover:border-white/20" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-white/50 font-bold ml-1">{t.demoMatrix.cryptoKey}</label>
                                <div className="relative">
                                    <input type="password" placeholder="••••••••••••" className="w-full bg-black/50 border border-white/10 text-sm px-4 py-3 outline-none focus:border-[var(--accent)] focus:bg-[var(--accent)]/5 text-white font-mono transition-all hover:border-white/20" />
                                    <Key size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
                                </div>
                            </div>
                            <Button
                                onClick={() => toast({ title: t.demoMatrix.identityRejected, description: t.demoMatrix.identityMismatch, type: "error" })}
                                className="w-full uppercase tracking-widest mt-2 hover:bg-[var(--accent)] hover:text-black transition-colors"
                            >
                                Transmit Identity
                            </Button>
                        </div>
                    </GlassCard>

                    {/* NEW: API Key Vault */}
                    <GlassCard className="p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Key className="text-[var(--accent)]" size={20} />
                            <h3 className="text-lg font-bold uppercase tracking-widest">{t.demoMatrix.webhookSecret}</h3>
                        </div>
                        <div className="space-y-4 w-full flex-grow flex flex-col justify-center max-w-sm mx-auto">
                            <p className="text-white/50 text-xs font-mono">{t.demoMatrix.rollSecretInfo}</p>
                            <div className="flex items-center bg-black/50 border border-white/10 group">
                                <div className="p-4 flex-grow font-mono text-sm tracking-wider text-[var(--accent)] select-none">
                                    {showSecret ? "sk_live_v8F92A2B3D4C5E6" : "sk_live_v****************"}
                                </div>
                                <button onClick={() => setShowSecret(!showSecret)} className="p-4 text-white/30 hover:text-white transition-colors bg-white/5 border-l border-white/10 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)]">
                                    {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button onClick={handleCopy} className="p-4 text-white/30 hover:text-white transition-colors bg-white/5 border-l border-white/10 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)]">
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                    </GlassCard>

                    {/* NEW: UI Micro-Tokens */}
                    <GlassCard className="p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Settings className="text-[var(--accent)]" size={20} />
                            <h3 className="text-lg font-bold uppercase tracking-widest">{t.demoMatrix.microTokens}</h3>
                        </div>
                        <div className="flex flex-col gap-8 flex-grow justify-center w-full max-w-sm mx-auto">
                            {/* Toggle */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-widest text-white/50 font-bold">{t.demoMatrix.strictParity}</span>
                                <button
                                    onClick={() => setMicroToggle(!microToggle)}
                                    className={`w-12 h-6 flex items-center p-1 transition-colors ${microToggle ? 'bg-[var(--accent)]' : 'bg-white/10'}`}
                                >
                                    <motion.div
                                        className="w-4 h-4 bg-white shadow-sm"
                                        animate={{ x: microToggle ? 24 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>

                            {/* Slider */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase tracking-widest text-white/50 font-bold">{t.demoMatrix.nodeAllocation}</span>
                                    <span className="text-xs font-mono text-[var(--accent)]">{sliderValue}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100" value={sliderValue} onChange={(e) => setSliderValue(parseInt(e.target.value))}
                                    className="w-full h-1 bg-white/10 appearance-none outline-none accent-[var(--accent)] hover:accent-white transition-all cursor-pointer"
                                />
                            </div>

                            {/* Button loader */}
                            <Button
                                onClick={() => { setBtnLoading(true); setTimeout(() => { setBtnLoading(false); toast({ title: t.demoMatrix.operationComplete, description: t.demoMatrix.asyncResComplete, type: "success" }) }, 2000) }}
                                className="w-full bg-white/5 border border-white/10 hover:bg-[var(--accent)] hover:border-[var(--accent)] text-white hover:text-black uppercase tracking-widest font-bold transition-all relative overflow-hidden rounded-none"
                            >
                                {btnLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Deploy Architecture"}
                            </Button>
                        </div>
                    </GlassCard>

                    {/* NEW: File Drop */}
                    <GlassCard className="p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <FileUp className="text-[var(--accent)]" size={20} />
                            <h3 className="text-lg font-bold uppercase tracking-widest">{t.demoMatrix.encryptedDrop}</h3>
                        </div>
                        <div
                            className={`flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 w-full flex-grow p-12 relative overflow-hidden cursor-pointer ${isDragging ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-white/10 hover:border-white/30 bg-black/40'}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); toast({ title: t.demoMatrix.payloadInjected, description: t.demoMatrix.fileSynced, type: "success" }) }}
                        >
                            <FileUp size={32} className={`mb-4 transition-colors ${isDragging ? 'text-[var(--accent)]' : 'text-white/20'}`} />
                            <p className="text-sm font-bold uppercase tracking-widest text-center text-white/80">{t.demoMatrix.dropPayload}</p>
                            <p className="text-[10px] font-mono text-white/40 mt-2 text-center">{t.demoMatrix.dropSimDesc}</p>
                        </div>
                    </GlassCard>

                    {/* NEW: WebGL Switcher */}
                    <GlassCard className="p-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Layers className="text-[var(--accent)]" size={20} />
                            <h3 className="text-lg font-bold uppercase tracking-widest">{t.demoMatrix.envDirectives}</h3>
                        </div>
                        <div className="flex flex-col gap-4 flex-grow justify-center w-full max-w-sm mx-auto">
                            <p className="text-white/50 text-xs font-mono text-center mb-2">{t.demoMatrix.simRootWebGl}</p>
                            <Button
                                onClick={() => { setTempWebGl('matrix'); toast({ title: t.demoMatrix.envShifted, description: "Kinetic Matrix rendered.", type: "success" }) }}
                                className={`w-full uppercase tracking-widest font-bold rounded-none ${tempWebGl === 'matrix' ? 'bg-[var(--accent)] text-black' : 'bg-transparent border border-white/20 hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
                            >
                                <Cpu size={14} className="mr-2" /> {t.demoMatrix.kineticMatrix}
                            </Button>
                            <Button
                                onClick={() => { setTempWebGl('galaxy'); toast({ title: "Environment Shifted", description: "Galaxy Dust rendered.", type: "success" }) }}
                                className={`w-full uppercase tracking-widest font-bold rounded-none ${tempWebGl === 'galaxy' ? 'bg-[var(--accent)] text-black' : 'bg-transparent border border-white/20 hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
                            >
                                <Sparkles size={14} className="mr-2" /> {t.demoMatrix.galaxyDust}
                            </Button>
                            <Button
                                onClick={() => { setTempWebGl('fire'); toast({ title: "Environment Shifted", description: "Plasma Fire rendered.", type: "success" }) }}
                                className={`w-full uppercase tracking-widest font-bold rounded-none ${tempWebGl === 'fire' ? 'bg-[var(--accent)] text-black' : 'bg-transparent border border-white/20 hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}
                            >
                                <Activity size={14} className="mr-2" /> {t.demoMatrix.plasmaFire}
                            </Button>
                            {tempWebGl !== 'none' && (
                                <button onClick={() => { setTempWebGl('none'); toast({ title: t.demoMatrix.envHalted, description: t.demoMatrix.renderingDisabled, type: "info" }) }} className="text-[10px] uppercase font-mono tracking-widest text-red-500 hover:text-red-400 mt-2 hover:underline text-center w-full outline-none">
                                    [ Halt active rendering ]
                                </button>
                            )}
                        </div>
                    </GlassCard>

                </div>

                {/* Button Matrix */}
                <GlassCard className="p-8 border-dashed border-white/10 bg-transparent">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-8">
                        <Activity className="text-[var(--accent)]" size={20} />
                        <h3 className="text-lg font-bold uppercase tracking-widest text-white/50">{t.demoMatrix.interactionStates}</h3>
                    </div>
                    <div className="flex flex-wrap gap-6 justify-center">
                        <Button className="px-8 bg-[var(--accent)] text-white hover:bg-[var(--accent)]/80 hover:scale-105 active:scale-95 transition-all">{t.demoMatrix.primaryNode}</Button>
                        <Button onClick={() => setIsModalOpen(true)} variant="ghost" className="px-8 border border-[var(--accent)]/50 text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)] hover:text-black uppercase tracking-widest font-bold font-mono hover:-translate-y-1 transition-all">{t.demoMatrix.triggerModal}</Button>
                        <Button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2500); }} variant="ghost" className="px-8 border border-[var(--accent)]/50 text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)] hover:text-black uppercase tracking-widest font-bold font-mono hover:-translate-y-1 transition-all">{t.demoMatrix.simulateNetwork}</Button>
                        <Button className="px-8 bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]">{t.demoMatrix.haltProtocol}</Button>
                    </div>
                </GlassCard>

                {/* State Vectors / Data Table */}
                <GlassCard className="p-8 overflow-x-auto">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                        <Database className="text-[var(--accent)]" size={20} />
                        <h3 className="text-lg font-bold uppercase tracking-widest">{t.demoMatrix.telemetryMatrix}</h3>
                    </div>
                    <table className="w-full text-left font-mono text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-white/10 text-white/50 text-xs">
                                <th className="pb-3 px-4 font-normal">{t.demoMatrix.nodeId}</th>
                                <th className="pb-3 px-4 font-normal">{t.demoMatrix.status}</th>
                                <th className="pb-3 px-4 font-normal">{t.demoMatrix.throughput}</th>
                                <th className="pb-3 px-4 font-normal text-right">{t.demoMatrix.uptime}</th>
                            </tr>
                        </thead>
                        <tbody className="text-white/80">
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 flex items-center gap-2"><Cpu size={14} className="text-[var(--accent)]" /> ALPHA-01</td>
                                <td className="py-4 px-4"><span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5">{t.demoMatrix.online}</span></td>
                                <td className="py-4 px-4 font-bold text-[var(--accent)] transition-all duration-300">{reqRate.toLocaleString()} req/s</td>
                                <td className="py-4 px-4 text-right">99.99%</td>
                            </tr>
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 flex items-center gap-2"><Cpu size={14} className="text-white/30" /> BETA-02</td>
                                <td className="py-4 px-4"><span className="text-xs bg-white/10 text-white/50 border border-white/20 px-2 py-0.5">{t.demoMatrix.standby}</span></td>
                                <td className="py-4 px-4">0 req/s</td>
                                <td className="py-4 px-4 text-right">--</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors text-white/30">
                                <td className="py-4 px-4 flex items-center gap-2"><Cpu size={14} className="text-red-500/50" /> DELTA-09</td>
                                <td className="py-4 px-4"><span className="text-xs bg-red-500/10 text-red-500/80 border border-red-500/20 px-2 py-0.5 line-through">{t.demoMatrix.halted}</span></td>
                                <td className="py-4 px-4">0 req/s</td>
                                <td className="py-4 px-4 text-right">ERR_SYNC</td>
                            </tr>
                        </tbody>
                    </table>
                </GlassCard>

                {/* Notification Banner System */}
                <GlassCard className="p-8 border border-white/10 bg-black/40 max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                        <Activity className="text-[var(--accent)]" size={20} />
                        <h3 className="text-lg font-bold uppercase tracking-widest">{t.demoMatrix.notificationAlert}</h3>
                    </div>
                    <div className="text-white/50 text-sm font-mono mb-8">
                        The Substrate provides a unified notification architecture out of the box. Execute the directives below to interface with the global message matrix.
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Button
                            onClick={() => toast({ title: t.demoMatrix.opTriumphant, description: t.demoMatrix.handshakeSuccess, type: "success" })}
                            className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500 hover:text-black uppercase tracking-widest font-bold"
                        >
                            Trigger Success
                        </Button>
                        <Button
                            onClick={() => toast({ title: t.demoMatrix.integrityWarning, description: t.demoMatrix.nodeRedundancy, type: "warning" })}
                            className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black uppercase tracking-widest font-bold"
                        >
                            Trigger Warning
                        </Button>
                        <Button
                            onClick={() => toast({ title: t.demoMatrix.fatalException, description: t.demoMatrix.massiveDesync, type: "error" })}
                            className="bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        >
                            Trigger Error
                        </Button>
                        <Button
                            onClick={() => toast({ title: t.demoMatrix.substrateInfo, description: t.demoMatrix.standardCalibration, type: "info" })}
                            className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white uppercase tracking-widest font-bold"
                        >
                            Trigger Info
                        </Button>
                    </div>
                </GlassCard>

                {/* Animated FAQ Matrix */}
                <GlassCard className="border border-white/10 bg-transparent flex flex-col gap-8 p-0 overflow-hidden max-w-4xl mx-auto w-full">
                    <div className="p-8 pb-0 flex flex-col items-center text-center">
                        <h3 className="text-2xl font-bold uppercase tracking-widest text-[var(--accent)] mb-4">{t.demoMatrix.protocolDirectives}</h3>
                        <p className="text-white/50 text-sm font-mono max-w-2xl">
                            Standard queries regarding the architecture are parameterized below. Utilizing AnimatePresence for stateful height transitions.
                        </p>
                    </div>

                    <div className="border-t border-white/5 divide-y divide-white/5 w-full">
                        {t.demoMatrix.faqs.map((faq, i) => (
                            <FAQItem key={i} faq={faq} />
                        ))}
                    </div>
                </GlassCard>

            </motion.div>
            {/* Grid Backdrop */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

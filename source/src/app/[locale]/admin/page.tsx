"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldAlert, Users, Activity, Settings, ArrowLeft, ArrowRight, ShieldCheck, Palette, Radio, ShoppingCart, Trash2, Plus, Edit2, ArrowUp, ArrowDown, X, Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getSovereignNodes, setNodeRole, setNodeStatus, getTelemetryData, setSovereignWebGLVariant, setGlobalBroadcast, setContentOverride, getGlobalOverrides, getAuditTraces, setCommerceMode, setResendFrom, setSiteTitle, setContactEmail, setHaltingProtocol as setHaltingProtocolAction, setPreLaunchMode as setPreLaunchModeAction, setSandboxMode as setSandboxModeAction, setPrimaryColor, setSocialLinks, setSEOMetadata, setRateLimitMode, setTelemetryKeys, setPricingMatrix, getStoreProducts, createStoreProduct, updateStoreProduct, deleteStoreProduct } from "@/core/actions/admin";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { language } = useTranslation();
    const [tab, setTab] = useState<"nodes" | "audit" | "telemetry" | "config" | "branding" | "broadcast" | "store">("branding");
    const [nodes, setNodes] = useState<any[]>([]);
    const [traces, setTraces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingNode, setUpdatingNode] = useState<string | null>(null);
    const [activeRoleNode, setActiveRoleNode] = useState<string | null>(null);
    const [sandboxMode, setSandboxMode] = useState(false);
    const [haltingProtocol, setHaltingProtocol] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [typographyOverride, setTypographyOverride] = useState("");
    const [commerceMode, setCommerceModeUI] = useState("");
    const [resendFrom, setResendFromUI] = useState("");
    const [siteTitle, setSiteTitleUI] = useState("");
    const [contactEmail, setContactEmailUI] = useState("");
    const [preLaunchMode, setPreLaunchMode] = useState(false);
    const [primaryColor, setPrimaryColorUI] = useState("");
    const [socialX, setSocialXUI] = useState("");
    const [socialGithub, setSocialGithubUI] = useState("");
    const [socialDiscord, setSocialDiscordUI] = useState("");
    const [webglVariantUI, setWebglVariantUI] = useState("fire");
    const [seoDescription, setSeoDescriptionUI] = useState("");
    const [seoKeywords, setSeoKeywordsUI] = useState("");
    const [seoOgImage, setSeoOgImageUI] = useState("");
    const [rateLimitMode, setRateLimitModeUI] = useState("standard");
    const [gaId, setGaIdUI] = useState("");
    const [posthogId, setPosthogIdUI] = useState("");
    const [pricingTiers, setPricingTiers] = useState<any[]>([]);
    const [recommendedPlan, setRecommendedPlan] = useState("pro");

    const [storeProducts, setStoreProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productForm, setProductForm] = useState<any>({ id: "", name: "", description: "", price: "", imageUrl: "", stripeLink: "" });
    const [isEditingProduct, setIsEditingProduct] = useState(false);

    // Read inbound hash on initial render to preserve active tab
    useEffect(() => {
        if (typeof window !== "undefined") {
            const hash = window.location.hash.replace("#", "") as "nodes" | "audit" | "telemetry" | "config" | "branding" | "broadcast" | "store";
            if (["nodes", "audit", "telemetry", "config", "branding", "broadcast", "store"].includes(hash)) {
                setTab(hash);
            }
        }
    }, []);

    const handleTabChange = (newTab: "nodes" | "audit" | "telemetry" | "config" | "branding" | "broadcast" | "store") => {
        setTab(newTab);
        window.history.replaceState(null, "", `#${newTab}`);
    };

    const [telemetry, setTelemetry] = useState<{ latency: number, firebaseSync: string, resendTransport: string, stripeBridge: string, redisEdge: string } | null>(null);

    useEffect(() => {
        let telemetryInterval: NodeJS.Timeout;

        if (tab === "nodes") {
            setLoading(true);
            getSovereignNodes(50)
                .then(setNodes)
                .catch(e => console.error("Failed to load nodes", e))
                .finally(() => setLoading(false));
        }

        if (tab === "audit") {
            setLoading(true);
            getAuditTraces(20)
                .then(setTraces)
                .catch(e => console.error("Failed to load traces", e))
                .finally(() => setLoading(false));
        }

        if (tab === "telemetry") {
            const fetchTelemetry = () => {
                getTelemetryData()
                    .then(setTelemetry)
                    .catch(e => console.error("Telemetry failed", e));
            };
            fetchTelemetry();
            telemetryInterval = setInterval(fetchTelemetry, 2500);
        }

        if (tab === "config" || tab === "branding" || tab === "broadcast" || tab === "store") {
            getGlobalOverrides()
                .then(res => {
                    setBroadcastMessage(res.broadcast);
                    setTypographyOverride(res.typography);
                    setCommerceModeUI(res.commerceMode);
                    setResendFromUI(res.resendFrom);
                    setSiteTitleUI(res.siteTitle);
                    setContactEmailUI(res.contactEmail);
                    setHaltingProtocol(res.haltingProtocol);
                    setPreLaunchMode(res.preLaunchMode);
                    setPrimaryColorUI(res.primaryColor);
                    setSocialXUI(res.socialX);
                    setSocialGithubUI(res.socialGithub);
                    setSocialDiscordUI(res.socialDiscord);
                    setWebglVariantUI(res.webglVariant);
                    setSeoDescriptionUI(res.seoDescription);
                    setSeoKeywordsUI(res.seoKeywords);
                    setSeoOgImageUI(res.seoOgImage);
                    setRateLimitModeUI(res.rateLimitMode);
                    setGaIdUI(res.gaId);
                    setPosthogIdUI(res.posthogId);
                    const processedTiers = (res.pricingTiers || []).map((t: any) => ({
                        ...t,
                        features: (t.features || []).map((f: any) =>
                            typeof f === 'string' ? { name: f, active: true } : f
                        )
                    }));
                    setPricingTiers(processedTiers);
                    setRecommendedPlan(res.recommendedPlan || "pro");
                    setSandboxMode(res.sandboxMode || false);
                })
                .catch(e => console.error("Failed to load global overrides:", e));

            setLoadingProducts(true);
            getStoreProducts().then(prods => {
                setStoreProducts(prods);
                setLoadingProducts(false);
            });
        }

        return () => {
            if (telemetryInterval) clearInterval(telemetryInterval);
        };
    }, [tab]);

    const handleRoleChange = async (uid: string, newRole: "ADMIN" | "USER") => {
        setUpdatingNode(uid);
        const res = await setNodeRole(uid, newRole);
        if (res.success) {
            setNodes(nodes.map(n => n.uid === uid ? { ...n, customClaims: { ...n.customClaims, role: newRole } } : n));
        } else {
            console.error(res.message);
        }
        setUpdatingNode(null);
    };

    const handleStatusChange = async (uid: string, currentlyDisabled: boolean) => {
        setUpdatingNode(uid);
        const res = await setNodeStatus(uid, !currentlyDisabled);
        if (res.success) {
            setNodes(nodes.map(n => n.uid === uid ? { ...n, disabled: !currentlyDisabled } : n));
        } else {
            console.error(res.message);
        }
        setUpdatingNode(null);
    };

    return (
        <main className="relative min-h-screen p-6 text-white overflow-y-auto">
            <div className="w-full max-w-5xl mx-auto space-y-6 pt-12 pb-24">

                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <Button as={Link} href={`/${language}/dashboard`} variant="ghost" className="w-fit text-white/50 px-0 hover:text-white">
                        <ArrowLeft size={16} className="mr-2" />
                        Return
                    </Button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-2xl font-black uppercase tracking-widest text-[var(--accent)] font-mono flex items-center gap-3">
                            <ShieldAlert size={24} />
                            ADMIN PANEL
                        </h1>
                        <div className="text-[10px] font-mono tracking-widest px-4 py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)]">
                            LOGGED IN AS: {session?.user?.email}
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-[var(--accent)]/50 via-[var(--accent)]/10 to-transparent" />

                {/* Vertical Split Layout */}
                <div className="flex flex-col md:flex-row gap-6 items-start w-full">
                    {/* Tabs Sidebar */}
                    <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible w-full md:w-56 shrink-0 gap-1 border-b md:border-b-0 md:border-r border-white/5 pb-2 md:pb-0 md:pr-4 select-none admin-scrollbar">
                        {([
                            { id: "branding", icon: Palette, label: "Branding" },
                            { id: "nodes", icon: Users, label: "Users" },
                            { id: "audit", icon: ShieldCheck, label: "Audit Logs" },
                            { id: "store", icon: ShoppingCart, label: "Store" },
                            { id: "config", icon: Settings, label: "Configuration" },
                            { id: "broadcast", icon: Radio, label: "Announcements" },
                            { id: "telemetry", icon: Activity, label: "System Health" }
                        ] as const).map(({ id, icon: Icon, label }) => (
                            <button
                                key={id}
                                onClick={() => handleTabChange(id)}
                                className={`relative flex items-center shrink-0 w-max md:w-full whitespace-nowrap gap-3 px-4 sm:px-6 md:px-4 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors text-left ${tab === id ? "text-[var(--accent)] bg-white/5 md:bg-transparent" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                            >
                                <Icon size={14} className="shrink-0" /> {label}
                                {tab === id && (
                                    <motion.div
                                        layoutId="admin-tab-indicator"
                                        className="absolute bottom-0 md:bottom-auto md:top-0 left-0 right-0 md:right-auto md:-left-4 h-0.5 md:h-full md:w-0.5 bg-[var(--accent)]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Matrix */}
                    <div className="flex-1 w-full min-w-0">
                        <AnimatePresence mode="wait">

                            {/* Tab: Nodes */}
                            {tab === "nodes" && (
                                <motion.div
                                    key="nodes-view"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >



                                    <div className="bg-black/40 border border-white/5">
                                        <div className="p-4 border-b border-white/5 bg-white/5">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Active Users</h3>
                                        </div>
                                        <div className="w-full overflow-visible">
                                            <table className="w-full min-w-[800px] text-left border-collapse text-xs font-mono">
                                                <thead>
                                                    <tr className="bg-white/5 text-white/50">
                                                        <th className="p-4 font-normal tracking-widest uppercase">ID</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Name</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Email Address</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Role</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Status</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Auth Type</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Created</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {loading ? (
                                                        <tr><td colSpan={5} className="p-8 text-center text-white/30 animate-pulse">Loading users...</td></tr>
                                                    ) : nodes.length === 0 ? (
                                                        <tr><td colSpan={5} className="p-8 text-center text-white/30">No users found.</td></tr>
                                                    ) : (
                                                        nodes.map((node) => (
                                                            <tr key={node.uid} className="hover:bg-white/5 transition-colors group">
                                                                <td className="p-4 text-white/40 group-hover:text-[var(--accent)] transition-colors">{node.uid.substring(0, 8)}...</td>
                                                                <td className="p-4">{node.displayName}</td>
                                                                <td className="p-4 font-bold">{node.email}</td>
                                                                <td className="p-4">
                                                                    <div className="relative inline-block w-full max-w-[90px]">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setActiveRoleNode(activeRoleNode === node.uid ? null : node.uid)}
                                                                            className="bg-black/50 border border-white/10 text-[10px] px-3 py-2 outline-none rounded focus:border-[var(--accent)] disabled:opacity-50 min-w-[70px] text-left uppercase tracking-widest font-black text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                                                                            disabled={updatingNode === node.uid || node.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || node.email === session?.user?.email}
                                                                        >
                                                                            {updatingNode === node.uid ? "SYNC..." : (node.customClaims?.role === "ADMIN" || node.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ? "ROOT" : "USER")}
                                                                        </button>
                                                                        {activeRoleNode === node.uid && (
                                                                            <>
                                                                                <div className="fixed inset-0 z-40" onClick={() => setActiveRoleNode(null)} />
                                                                                <div className="absolute top-full left-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 flex flex-col z-50 min-w-[70px] shadow-2xl p-1 gap-1">
                                                                                    {["USER", "ADMIN"].map(roleOpt => (
                                                                                        <button
                                                                                            type="button"
                                                                                            key={roleOpt}
                                                                                            onClick={() => {
                                                                                                handleRoleChange(node.uid, roleOpt as "ADMIN" | "USER");
                                                                                                setActiveRoleNode(null);
                                                                                            }}
                                                                                            className={`px-3 py-2 text-[10px] font-black tracking-widest text-left transition-colors uppercase ${(node.customClaims?.role === "ADMIN" && roleOpt === "ADMIN") || (node.customClaims?.role !== "ADMIN" && roleOpt === "USER")
                                                                                                    ? 'bg-white/10 text-white'
                                                                                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                                                                                                }`}
                                                                                        >
                                                                                            {roleOpt === "ADMIN" ? "ROOT" : "USER"}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="p-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStatusChange(node.uid, node.disabled)}
                                                                        className={`text-[10px] px-3 py-1 outline-none rounded min-w-[70px] uppercase tracking-widest font-black transition-colors ${node.disabled
                                                                            ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
                                                                            : "bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white"
                                                                            }`}
                                                                        disabled={updatingNode === node.uid || node.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || node.email === session?.user?.email}
                                                                    >
                                                                        {updatingNode === node.uid ? "SYNC..." : (node.disabled ? "BANNED" : "ACTIVE")}
                                                                    </button>
                                                                </td>
                                                                <td className="p-4 text-white/50 capitalize">{node.provider.replace('.com', '')}</td>
                                                                <td className="p-4 text-white/30">{new Date(node.creationTime).toLocaleDateString()}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Tab: Audit */}
                            {tab === "audit" && (
                                <motion.div
                                    key="audit-view"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-black/40 border border-white/5">
                                        <div className="p-4 border-b border-white/5 bg-white/5">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">System Audit Logs</h3>
                                        </div>
                                        <div className="w-full max-h-[600px] overflow-y-auto overflow-x-auto admin-scrollbar">
                                            <table className="w-full min-w-[800px] text-left border-collapse text-xs font-mono">
                                                <thead>
                                                    <tr className="bg-white/5 text-white/50 sticky top-0 z-10 backdrop-blur-md">
                                                        <th className="p-4 font-normal tracking-widest uppercase">Timestamp</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Action</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Severity</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Origin User</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5 focus:outline-none">
                                                    {loading ? (
                                                        <tr><td colSpan={5} className="p-8 text-center text-white/30 animate-pulse">Loading logs...</td></tr>
                                                    ) : traces.length === 0 ? (
                                                        <tr><td colSpan={5} className="p-8 text-center text-white/30 truncate">No events logged.</td></tr>
                                                    ) : (
                                                        traces.map((trace, i) => (
                                                            <tr key={trace.id || i} className="hover:bg-white/5 transition-colors">
                                                                <td className="p-4 text-white/40 whitespace-nowrap">{new Date(trace.timestamp).toLocaleString()}</td>
                                                                <td className="p-4 font-bold tracking-widest">{trace.action}</td>
                                                                <td className={`p-4 font-bold tracking-widest ${trace.severity === 'FATAL' || trace.severity === 'ERROR' ? 'text-[var(--accent)]' : trace.severity === 'WARN' ? 'text-yellow-500' : 'text-[var(--accent)]'}`}>
                                                                    {trace.severity}
                                                                </td>
                                                                <td className="p-4 text-[var(--accent)] max-w-xs truncate">{trace.user}</td>
                                                                <td className="p-4 text-white/60">{trace.message}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Tab: Telemetry */}
                            {tab === "telemetry" && (
                                <motion.div
                                    key="telemetry-view"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    {telemetry ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <GlassCard className="border border-white/5 bg-black/40 space-y-2">
                                                <p className="text-[10px] tracking-widest uppercase text-white/50">Edge Latency</p>
                                                <p className={`text-3xl font-black ${telemetry.latency < 100 ? 'text-[var(--accent)]' : 'text-yellow-500'}`}>{telemetry.latency}<span className="text-sm font-normal text-white/30 ml-1">ms</span></p>
                                            </GlassCard>
                                            <GlassCard className="border border-white/5 bg-black/40 space-y-2">
                                                <p className="text-[10px] tracking-widest uppercase text-white/50">Firebase Auth</p>
                                                <p className={`text-3xl font-black ${telemetry.firebaseSync === 'NOMINAL' ? 'text-[var(--accent)]' : 'text-[var(--accent)]'}`}>{telemetry.firebaseSync}</p>
                                            </GlassCard>
                                            <GlassCard className="border border-white/5 bg-black/40 space-y-2">
                                                <p className="text-[10px] tracking-widest uppercase text-white/50">Email Service (Resend)</p>
                                                <p className={`text-3xl font-black ${telemetry.resendTransport === 'ONLINE' ? 'text-[var(--accent)]' : 'text-[var(--accent)]'}`}>{telemetry.resendTransport}</p>
                                            </GlassCard>
                                            <GlassCard className="border border-white/5 bg-black/40 space-y-2 md:col-span-1">
                                                <p className="text-[10px] tracking-widest uppercase text-white/50">Payments (Stripe)</p>
                                                <p className={`text-3xl font-black ${telemetry.stripeBridge === 'ONLINE' ? 'text-[var(--accent)]' : 'text-[var(--accent)]'}`}>{telemetry.stripeBridge}</p>
                                            </GlassCard>
                                            <GlassCard className="border border-white/5 bg-black/40 space-y-2 md:col-span-2">
                                                <p className="text-[10px] tracking-widest uppercase text-white/50">Rate Limiting (Upstash Redis)</p>
                                                <p className={`text-3xl font-black ${telemetry.redisEdge === 'ONLINE' ? 'text-[var(--accent)]' : 'text-[var(--accent)]'}`}>{telemetry.redisEdge}</p>
                                            </GlassCard>
                                        </div>
                                    ) : (
                                        <GlassCard className="border border-white/5 bg-black/40 h-64 flex items-center justify-center">
                                            <span className="text-xs text-white/30 font-mono italic tracking-widest animate-pulse">[ Loading System Health... ]</span>
                                        </GlassCard>
                                    )}
                                </motion.div>
                            )}

                            {/* Tab: Config */}
                            {tab === "config" && (
                                <motion.div
                                    key="config-view"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >

                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Early Access / Pre-Launch Mode</h3>
                                            <p className="text-xs font-serif italic text-white/50">Restricts public access, showing a 'Coming Soon' page to regular visitors.</p>
                                        </div>
                                        <div className="flex w-full justify-start">
                                            <button
                                                onClick={async () => {
                                                    const newState = !preLaunchMode;
                                                    setPreLaunchMode(newState);
                                                    await setPreLaunchModeAction(newState);
                                                    router.refresh();
                                                }}
                                                className={`w-12 h-6 rounded-full relative transition-colors border shrink-0 ${preLaunchMode ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white/10 border-white/20'}`}
                                                aria-pressed={preLaunchMode}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preLaunchMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </GlassCard>

                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Maintenance Mode</h3>
                                            <p className="text-xs font-serif italic text-white/50">Blocks all non-admin visitors and displays a 'Site Under Maintenance' screen.</p>
                                        </div>
                                        <div className="flex w-full justify-start">
                                            <button
                                                onClick={async () => {
                                                    const newState = !haltingProtocol;
                                                    setHaltingProtocol(newState);
                                                    await setHaltingProtocolAction(newState);
                                                    router.refresh();
                                                }}
                                                className={`w-12 h-6 rounded-full relative transition-colors border shrink-0 ${haltingProtocol ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white/10 border-white/20'}`}
                                                aria-pressed={haltingProtocol}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${haltingProtocol ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </GlassCard>




                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Rate Limit Strictness</h3>
                                            <p className="text-xs font-serif italic text-white/50">Controls how strictly the website limits incoming traffic to prevent bots and spam.</p>
                                        </div>
                                        <div className="flex flex-wrap w-full justify-start gap-4">
                                            {['relaxed', 'standard', 'strict', 'lockdown'].map((variant) => (
                                                <button
                                                    key={variant}
                                                    onClick={async () => {
                                                        const res = await setRateLimitMode(variant);
                                                        if (res.success) {
                                                            setRateLimitModeUI(variant);
                                                            router.refresh();
                                                        }
                                                    }}
                                                    className={`border text-xs px-6 py-2 outline-none rounded min-w-[100px] uppercase tracking-widest font-bold transition-colors shadow-2xl ${rateLimitMode === variant ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black/50 border-white/10 text-white/80 hover:bg-white/5 focus:border-[var(--accent)]'}`}
                                                >
                                                    {variant}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="text-xs text-white/70 bg-black/50 p-4 rounded border border-white/5 font-mono mt-2">
                                            {rateLimitMode === 'relaxed' && "Relaxed: High threshold context. Allows high volume of requests before blocking. Best for heavy APIs or preventing false positives."}
                                            {rateLimitMode === 'standard' && "Standard: Recommended baseline. Balanced protection against common spam and light scraping."}
                                            {rateLimitMode === 'strict' && "Strict: Aggressive rate limits. Drops connections quickly for repeated rapid requests. Use if experiencing anomalous spikes."}
                                            {rateLimitMode === 'lockdown' && "Lockdown: Maximum restriction mode. Rejects almost all sustained automated requests. Only deploy during active L7 attacks."}
                                        </div>
                                    </GlassCard>



                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Sender Email Address</h3>
                                            <p className="text-xs font-serif italic text-white/50">Sets the 'From' email address used for sending all automated emails.</p>
                                        </div>
                                        <div className="flex flex-col gap-3 w-full justify-start">
                                            <input
                                                type="text"
                                                placeholder="noreply@domain.com"
                                                className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                value={resendFrom}
                                                onChange={(e) => setResendFromUI(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const res = await setResendFrom(resendFrom);
                                                    if (res.success) {
                                                        alert("Email relay origin established.");
                                                        router.refresh();
                                                    }
                                                }}
                                                className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)]/40 hover:text-white"
                                            >
                                                Save Email
                                            </button>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            )}

                            {/* Tab: Store */}
                            {tab === "store" && (
                                <motion.div
                                    key="store-view"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 gap-6"
                                >
                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Store Mode (SaaS vs E-commerce)</h3>
                                            <p className="text-xs font-serif italic text-white/50">Switches the website billing system between traditional SaaS subscriptions or an E-commerce store.</p>
                                        </div>
                                        <div className="flex flex-wrap w-full justify-start gap-4">
                                            {['saas', 'store', 'none'].map((variant) => (
                                                <button
                                                    key={variant}
                                                    onClick={async () => {
                                                        const res = await setCommerceMode(variant);
                                                        if (res.success) {
                                                            setCommerceModeUI(variant);
                                                            router.refresh();
                                                        }
                                                    }}
                                                    className={`border text-xs px-6 py-2 outline-none rounded min-w-[100px] uppercase tracking-widest font-bold transition-colors shadow-2xl ${commerceMode === variant ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black/50 border-white/10 text-white/80 hover:bg-white/5 focus:border-[var(--accent)]'}`}
                                                >
                                                    {variant}
                                                </button>
                                            ))}
                                        </div>
                                    </GlassCard>
                                    {commerceMode === 'saas' && (
                                        <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col gap-4 md:col-span-2">
                                            <div className="space-y-4 text-left flex flex-col w-full">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                                                    <div>
                                                        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Pricing Page Configuration</h3>
                                                        <p className="text-xs font-serif italic text-white/50">Changes the content and format displayed on the public Pricing arrays.</p>
                                                    </div>
                                                    {pricingTiers.length < 4 && (
                                                        <button onClick={() => {
                                                            const newId = `tier_${Date.now()}`;
                                                            setPricingTiers([...pricingTiers, {
                                                                id: newId,
                                                                name: "New Tier",
                                                                price: "0",
                                                                features: [{ name: "Feature 1", active: true }, { name: "Feature 2", active: true }],
                                                                buttonText: "Get Access"
                                                            }]);
                                                        }} className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/40 px-3 py-1 uppercase font-bold tracking-widest border border-[var(--accent)] rounded ml-auto sm:ml-0 flex items-center gap-2">
                                                            <Plus size={12} /> Add Tier
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
                                                    <span className="text-xs font-mono text-white/50">Recommended:</span>
                                                    <div className="flex flex-wrap border border-white/10 rounded overflow-hidden">
                                                        {pricingTiers.map(tier => (
                                                            <button key={tier.id} onClick={() => setRecommendedPlan(tier.id)} className={`px-3 py-1 text-xs font-bold uppercase ${recommendedPlan === tier.id ? 'bg-[var(--accent)] text-white' : 'bg-black/50 text-white/50 hover:bg-white/5'}`}>{tier.name || 'Tier'}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
                                                {pricingTiers.map((tier, tIdx) => (
                                                    <div key={tier.id} className={`space-y-4 bg-white/5 border p-5 rounded relative flex flex-col ${recommendedPlan === tier.id ? 'border-[var(--accent)]/50 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]' : 'border-white/10'}`}>
                                                        {recommendedPlan === tier.id && <div className="absolute -top-2.5 right-4 bg-[var(--accent)] text-[10px] text-white px-2 py-0.5 font-bold uppercase tracking-widest rounded-sm">Recommended</div>}

                                                        <div className="text-xs font-bold text-white mb-2 uppercase tracking-widest flex justify-between items-center">
                                                            Tier {tIdx + 1}
                                                            <div className="flex gap-2">
                                                                <button onClick={() => {
                                                                    const newTiers = [...pricingTiers];
                                                                    newTiers[tIdx].hidden = !newTiers[tIdx].hidden;
                                                                    setPricingTiers(newTiers);
                                                                }} className={`p-1 rounded ${tier.hidden ? 'text-white/30 hover:text-white/50' : 'text-green-500 hover:text-green-400'}`}>
                                                                    {tier.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                                                </button>
                                                                <button onClick={() => {
                                                                    setPricingTiers(pricingTiers.filter((_, i) => i !== tIdx));
                                                                    if (recommendedPlan === tier.id) setRecommendedPlan("");
                                                                }} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                                                            </div>
                                                        </div>

                                                        <input type="text" placeholder="Plan Name" className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white w-full font-mono font-bold" value={tier.name} onChange={(e) => {
                                                            const newTiers = [...pricingTiers];
                                                            newTiers[tIdx].name = e.target.value;
                                                            setPricingTiers(newTiers);
                                                        }} />

                                                        <input type="text" placeholder="Price (e.g. 9)" className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white w-full font-mono text-lg" value={tier.price} onChange={(e) => {
                                                            const newTiers = [...pricingTiers];
                                                            newTiers[tIdx].price = e.target.value;
                                                            setPricingTiers(newTiers);
                                                        }} />

                                                        <div className="space-y-2 pt-2 border-t border-white/10 flex-grow">
                                                            <div className="text-[10px] uppercase font-bold text-white/50 px-1">Checkmark Features</div>
                                                            {tier.features.map((feat: any, fIdx: number) => {
                                                                const isActive = typeof feat === 'string' ? true : feat.active !== false;
                                                                const featureName = typeof feat === 'string' ? feat : feat.name;

                                                                return (
                                                                    <div key={fIdx} className="flex gap-2 items-center">
                                                                        <button onClick={() => {
                                                                            const newTiers = [...pricingTiers];
                                                                            if (typeof newTiers[tIdx].features[fIdx] === 'string') {
                                                                                newTiers[tIdx].features[fIdx] = { name: newTiers[tIdx].features[fIdx], active: false };
                                                                            } else {
                                                                                newTiers[tIdx].features[fIdx].active = !newTiers[tIdx].features[fIdx].active;
                                                                            }
                                                                            setPricingTiers(newTiers);
                                                                        }} className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${isActive ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black/50 border-white/20 text-transparent hover:border-white/40'}`}>
                                                                            <Check size={12} className={isActive ? 'opacity-100' : 'opacity-0'} />
                                                                        </button>
                                                                        <input type="text" placeholder="Feature" className={`bg-black/50 border border-white/10 text-xs px-3 py-1.5 outline-none focus:border-[var(--accent)] w-full font-mono ${isActive ? 'text-white' : 'text-white/30 line-through'}`} value={featureName} onChange={(e) => {
                                                                            const newTiers = [...pricingTiers];
                                                                            if (typeof newTiers[tIdx].features[fIdx] === 'string') {
                                                                                newTiers[tIdx].features[fIdx] = { name: e.target.value, active: true };
                                                                            } else {
                                                                                newTiers[tIdx].features[fIdx].name = e.target.value;
                                                                            }
                                                                            setPricingTiers(newTiers);
                                                                        }} />
                                                                        <div className="flex flex-col gap-0.5 shrink-0">
                                                                            <button disabled={fIdx === 0} onClick={() => {
                                                                                const newTiers = [...pricingTiers];
                                                                                const temp = newTiers[tIdx].features[fIdx];
                                                                                newTiers[tIdx].features[fIdx] = newTiers[tIdx].features[fIdx - 1];
                                                                                newTiers[tIdx].features[fIdx - 1] = temp;
                                                                                setPricingTiers(newTiers);
                                                                            }} className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/20 rounded disabled:opacity-20 disabled:hover:bg-white/5"><ArrowUp size={10} /></button>
                                                                            <button disabled={fIdx === tier.features.length - 1} onClick={() => {
                                                                                const newTiers = [...pricingTiers];
                                                                                const temp = newTiers[tIdx].features[fIdx];
                                                                                newTiers[tIdx].features[fIdx] = newTiers[tIdx].features[fIdx + 1];
                                                                                newTiers[tIdx].features[fIdx + 1] = temp;
                                                                                setPricingTiers(newTiers);
                                                                            }} className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/20 rounded disabled:opacity-20 disabled:hover:bg-white/5"><ArrowDown size={10} /></button>
                                                                        </div>
                                                                        <button onClick={() => {
                                                                            const newTiers = [...pricingTiers];
                                                                            newTiers[tIdx].features.splice(fIdx, 1);
                                                                            setPricingTiers(newTiers);
                                                                        }} className="w-5 h-5 flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded shrink-0"><Trash2 size={12} /></button>
                                                                    </div>
                                                                )
                                                            })}
                                                            <button onClick={() => {
                                                                const newTiers = [...pricingTiers];
                                                                newTiers[tIdx].features.push({ name: "", active: true });
                                                                setPricingTiers(newTiers);
                                                            }} className="w-full text-xs py-1.5 border border-dashed border-white/20 text-white/50 hover:bg-white/5 hover:text-white uppercase tracking-widest font-bold flex items-center justify-center gap-2 mt-1"><Plus size={12} /> Add Feature</button>
                                                        </div>

                                                        <input type="text" placeholder="Button Text" className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white w-full font-mono mt-auto" value={tier.buttonText} onChange={(e) => {
                                                            const newTiers = [...pricingTiers];
                                                            newTiers[tIdx].buttonText = e.target.value;
                                                            setPricingTiers(newTiers);
                                                        }} />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex w-full justify-start mt-2">
                                                <button
                                                    onClick={async () => {
                                                        const res = await setPricingMatrix({
                                                            pricingTiers, recommendedPlan
                                                        });
                                                        if (res.success) {
                                                            alert("Pricing arrays recalibrated.");
                                                        }
                                                    }}
                                                    className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)]/40 hover:text-white"
                                                >
                                                    Save Pricing Config
                                                </button>
                                            </div>
                                        </GlassCard>
                                    )}
                                    {commerceMode === 'store' && (
                                        <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col gap-4 md:col-span-2">
                                            <div className="space-y-2 text-left flex justify-between items-center w-full">
                                                <div>
                                                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Product Catalog Manager</h3>
                                                    <p className="text-xs font-serif italic text-white/50">Manage physical or digital products available when the site is in Store Mode.</p>
                                                </div>
                                                <button
                                                    onClick={() => { setIsEditingProduct(false); setProductForm({ id: "", name: "", description: "", price: "", imageUrl: "", stripeLink: "" }); }}
                                                    className="bg-white/10 hover:bg-white/20 p-2 rounded transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            {/* Entry Form */}
                                            <div className="flex flex-col gap-3 p-4 bg-white/5 border border-white/10 rounded">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Product Name"
                                                        className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                        value={productForm.name}
                                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                                    />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="Price (e.g. 19.99)"
                                                        className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                        value={productForm.price}
                                                        onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Product Image URL"
                                                        className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full md:col-span-2"
                                                        value={productForm.imageUrl}
                                                        onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Description"
                                                        className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full md:col-span-2"
                                                        value={productForm.description}
                                                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Stripe Checkout Link"
                                                        className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full md:col-span-2"
                                                        value={productForm.stripeLink}
                                                        onChange={e => setProductForm({ ...productForm, stripeLink: e.target.value })}
                                                    />
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (!productForm.name || !productForm.price) return alert("Name and price required");
                                                        if (isEditingProduct && productForm.id) {
                                                            const res = await updateStoreProduct(productForm.id, productForm);
                                                            if (res.success) {
                                                                setStoreProducts(storeProducts.map(p => p.id === productForm.id ? productForm : p));
                                                                setIsEditingProduct(false);
                                                                setProductForm({ id: "", name: "", description: "", price: "", imageUrl: "", stripeLink: "" });
                                                            }
                                                        } else {
                                                            const res = await createStoreProduct(productForm);
                                                            if (res.success) {
                                                                setStoreProducts([...storeProducts, { ...productForm, id: res.id }]);
                                                                setProductForm({ id: "", name: "", description: "", price: "", imageUrl: "", stripeLink: "" });
                                                            }
                                                        }
                                                    }}
                                                    className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)]/40 hover:text-white mt-2 self-start"
                                                >
                                                    {isEditingProduct ? "Update Product" : "Save New Product"}
                                                </button>
                                            </div>

                                            {/* Product List */}
                                            <div className="flex flex-col gap-2 mt-4">
                                                {loadingProducts ? <div className="text-xs font-mono text-white/50">Loading products...</div> :
                                                    storeProducts.length === 0 ? <div className="text-xs font-mono text-white/50">No products configured.</div> :
                                                        storeProducts.map((p, idx) => (
                                                            <div key={p.id || idx} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded">
                                                                <div>
                                                                    <div className="text-sm font-bold text-white">{p.name} <span className="text-[var(--accent)] ml-2">${p.price}</span></div>
                                                                    <div className="text-xs text-white/50 truncate max-w-xs">{p.description}</div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => { setIsEditingProduct(true); setProductForm(p); }}
                                                                        className="p-2 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!confirm("Are you sure?")) return;
                                                                            const res = await deleteStoreProduct(p.id);
                                                                            if (res.success) {
                                                                                setStoreProducts(storeProducts.filter(prod => prod.id !== p.id));
                                                                            }
                                                                        }}
                                                                        className="p-2 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                }
                                            </div>

                                        </GlassCard>
                                    )}
                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest">Test Mode (Sandbox)</h3>
                                            <p className="text-xs font-serif italic text-white/50">Disables real payment checks so you can test purchases locally.</p>
                                        </div>
                                        <div className="flex w-full justify-start">
                                            <button
                                                onClick={async () => {
                                                    const res = await setSandboxModeAction(!sandboxMode);
                                                    if (res.success) {
                                                        setSandboxMode(!sandboxMode);
                                                        router.refresh();
                                                    }
                                                }}
                                                className={`w-12 h-6 rounded-full relative transition-colors border shrink-0 ${sandboxMode ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white/10 border-white/20'}`}
                                                aria-pressed={sandboxMode}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${sandboxMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            )}

                            {/* Tab: Broadcast */}
                            {tab === "broadcast" && (
                                <motion.div
                                    key="broadcast-view"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 gap-6"
                                >
                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Announcements Matrix</h3>
                                            <p className="text-xs font-serif italic text-white/50">Displays an urgent alert banner at the top of the screen for all logged-in users. Leave blank to remove.</p>
                                        </div>
                                        <div className="flex flex-col gap-3 w-full justify-start">
                                            <input
                                                type="text"
                                                placeholder="Enter announcement message..."
                                                className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                value={broadcastMessage}
                                                onChange={(e) => setBroadcastMessage(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const res = await setGlobalBroadcast(broadcastMessage);
                                                    if (res.success) {
                                                        alert("Broadcast injected globally.");
                                                        router.refresh();
                                                    }
                                                }}
                                                className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold text-white transition-colors hover:bg-[var(--accent)]/40"
                                            >
                                                Send Announcement
                                            </button>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            )}

                            {/* Tab: Branding */}
                            {tab === "branding" && (
                                <motion.div
                                    key="branding-view"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Site Title</h3>
                                            <p className="text-xs font-serif italic text-white/50">Changes the main title of your website, shown in the browser tab and navigation bar.</p>
                                        </div>
                                        <div className="flex flex-col gap-3 w-full justify-start">
                                            <input
                                                type="text"
                                                placeholder="Nexus Vanguard"
                                                className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                value={siteTitle}
                                                onChange={(e) => setSiteTitleUI(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const res = await setSiteTitle(siteTitle);
                                                    if (res.success) {
                                                        alert("Site Title override established.");
                                                        router.refresh();
                                                    }
                                                }}
                                                className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)]/40 hover:text-white"
                                            >
                                                Update Title
                                            </button>
                                        </div>
                                    </GlassCard>

                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Global Site Subtitle</h3>
                                            <p className="text-xs font-serif italic text-white/50">Changes the main tagline or subtitle displayed on the public landing page.</p>
                                        </div>
                                        <div className="flex flex-col gap-3 w-full justify-start">
                                            <input
                                                type="text"
                                                placeholder="The Ultimate Sovereign Identity Matrix."
                                                className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                value={typographyOverride}
                                                onChange={(e) => setTypographyOverride(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const res = await setContentOverride(typographyOverride);
                                                    if (res.success) {
                                                        alert("Typography override established.");
                                                        router.refresh();
                                                    }
                                                }}
                                                className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)]/40 hover:text-white"
                                            >
                                                Update Subtitle
                                            </button>
                                        </div>
                                    </GlassCard>

                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Support Email Address</h3>
                                            <p className="text-xs font-serif italic text-white/50">Sets the contact email address shown in the footer of the website.</p>
                                        </div>
                                        <div className="flex flex-col gap-3 w-full justify-start">
                                            <input
                                                type="text"
                                                placeholder="hi+nextjs@boiler.click"
                                                className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                value={contactEmail}
                                                onChange={(e) => setContactEmailUI(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const res = await setContactEmail(contactEmail);
                                                    if (res.success) {
                                                        alert("Support Relay vector established.");
                                                        router.refresh();
                                                    }
                                                }}
                                                className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)]/40 hover:text-white"
                                            >
                                                Save Support Email
                                            </button>
                                        </div>
                                    </GlassCard>

                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Primary Theme Color</h3>
                                            <p className="text-xs font-serif italic text-white/50">Changes the primary color used for buttons and highlights across the website (e.g. #a855f7).</p>
                                        </div>
                                        <div className="flex flex-col gap-3 w-full justify-start">
                                            <input
                                                type="text"
                                                placeholder="#a855f7"
                                                className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColorUI(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const res = await setPrimaryColor(primaryColor);
                                                    if (res.success) {
                                                        alert("Global Accent Hue established.");
                                                        router.refresh();
                                                    }
                                                }}
                                                className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)]/40 hover:text-white"
                                            >
                                                Update Color
                                            </button>
                                        </div>
                                    </GlassCard>

                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">SEO & Marketing Meta Tags</h3>
                                            <p className="text-xs font-serif italic text-white/50">Configure how your website appears on Google search results and when shared on social media.</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                                            <input
                                                type="text"
                                                placeholder="Website Meta Description"
                                                className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                value={seoDescription}
                                                onChange={(e) => setSeoDescriptionUI(e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="SEO Keywords (comma separated)"
                                                className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                value={seoKeywords}
                                                onChange={(e) => setSeoKeywordsUI(e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Social Share Image URL (e.g. /og.png)"
                                                className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                value={seoOgImage}
                                                onChange={(e) => setSeoOgImageUI(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex w-full justify-start">
                                            <button
                                                onClick={async () => {
                                                    const res = await setSEOMetadata({ description: seoDescription, keywords: seoKeywords, ogUrl: seoOgImage });
                                                    if (res.success) {
                                                        alert("Search Index Protocols synchronized.");
                                                        router.refresh();
                                                    }
                                                }}
                                                className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)]/40 hover:text-white"
                                            >
                                                Save SEO Settings
                                            </button>
                                        </div>
                                    </GlassCard>


                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Social Media Links</h3>
                                            <p className="text-xs font-serif italic text-white/50">Configure the social media URLs displayed in the website footer.</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                                            <input
                                                type="text"
                                                placeholder="X / Twitter URL"
                                                className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                value={socialX}
                                                onChange={(e) => setSocialXUI(e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="GitHub URL"
                                                className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                value={socialGithub}
                                                onChange={(e) => setSocialGithubUI(e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Discord URL"
                                                className="bg-black/50 border border-white/10 text-xs px-4 py-2 outline-none focus:border-[var(--accent)] text-white font-mono w-full"
                                                value={socialDiscord}
                                                onChange={(e) => setSocialDiscordUI(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex w-full justify-start">
                                            <button
                                                onClick={async () => {
                                                    const res = await setSocialLinks({ socialX, socialGithub, socialDiscord });
                                                    if (res.success) {
                                                        alert("Social Relays synchronized.");
                                                        router.refresh();
                                                    }
                                                }}
                                                className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)]/40 hover:text-white"
                                            >
                                                Save Links
                                            </button>
                                        </div>
                                    </GlassCard>
                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Background Animation (WebGL)</h3>
                                            <p className="text-xs font-serif italic text-white/50">Changes the animated background effect shown across the entire website.</p>
                                        </div>
                                        <div className="flex flex-wrap w-full justify-start gap-4">
                                            {['fire', 'matrix', 'galaxy', 'none'].map((variant) => (
                                                <button
                                                    key={variant}
                                                    onClick={async () => {
                                                        const res = await setSovereignWebGLVariant(variant as any);
                                                        if (res.success) {
                                                            setWebglVariantUI(variant);
                                                            router.refresh();
                                                        }
                                                    }}
                                                    className={`border text-xs px-6 py-2 outline-none rounded min-w-[100px] uppercase tracking-widest font-bold transition-colors shadow-2xl ${webglVariantUI === variant ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black/50 border-white/10 text-white/80 hover:bg-white/5 focus:border-[var(--accent)]'}`}
                                                >
                                                    {variant}
                                                </button>
                                            ))}
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>

            {/* Grid Backdrop (Red Tinted) */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

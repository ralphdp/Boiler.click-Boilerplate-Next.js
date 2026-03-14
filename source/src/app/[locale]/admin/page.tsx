"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ShieldAlert, Users, Activity, Settings, ArrowLeft, ArrowRight, ShieldCheck, Palette, Radio, ShoppingCart, Trash2, Plus, Edit2, ArrowUp, ArrowDown, X, Check, Eye, EyeOff, LayoutDashboard, Download, Search, Filter, ChevronUp, ChevronDown as ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { getSovereignNodes, setNodeRole, setNodeStatus, getTelemetryData, setSovereignWebGLVariant, setGlobalBroadcast, setContentOverride, getGlobalOverrides, getAuditTraces, setCommerceMode, setResendFrom, setSiteTitle, setContactEmail, setHaltingProtocol as setHaltingProtocolAction, setPreLaunchMode as setPreLaunchModeAction, setSandboxMode as setSandboxModeAction, setMFAEnforced as setMFAEnforcedAction, setPrimaryColor, setSocialLinks, setSEOMetadata, setRateLimitMode, setTelemetryKeys, setPricingMatrix, getStoreProducts, bulkImportStoreProducts, createStoreProduct, updateStoreProduct, deleteStoreProduct } from "@/core/actions/admin";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { Ticket } from "lucide-react";
import { AdminVouchers } from "./AdminVouchers";

export default function AdminPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { data: session, update } = useSession();
    const { language } = useTranslation();
    const [tab, setTab] = useState<"overview" | "nodes" | "audit" | "telemetry" | "config" | "branding" | "broadcast" | "store" | "vouchers">("overview");
    const [nodes, setNodes] = useState<any[]>([]);
    const [traces, setTraces] = useState<any[]>([]);
    const [nodeSearch, setNodeSearch] = useState("");
    const [nodePage, setNodePage] = useState(1);
    const [auditSearch, setAuditSearch] = useState("");
    const [auditFilter, setAuditFilter] = useState<"ALL" | "INFO" | "WARN" | "CRIT">("ALL");
    const [auditPage, setAuditPage] = useState(1);

    const exportToCSV = (filename: string, rows: any[][]) => {
        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportNodesCSV = () => {
        const header = ["ID", "Name", "Email", "Role", "Status", "Auth Type", "Created"];
        const rows = filteredNodes.map(n => [n.uid, n.displayName, n.email, n.customClaims?.role || "USER", n.disabled ? "BANNED" : "ACTIVE", n.provider, new Date(n.creationTime).toLocaleString()]);
        exportToCSV(`nodes_export_${Date.now()}.csv`, [header, ...rows]);
    };

    const exportAuditCSV = () => {
        const header = ["ID", "Timestamp", "Action", "Severity", "Origin User", "Details"];
        const rows = filteredTraces.map(t => [t.id, new Date(t.timestamp).toLocaleString(), t.action, t.severity, t.user, t.message]);
        exportToCSV(`audit_export_${Date.now()}.csv`, [header, ...rows]);
    };

    const filteredNodes = nodes.filter(n => n.email.toLowerCase().includes(nodeSearch.toLowerCase()) || n.uid.toLowerCase().includes(nodeSearch.toLowerCase()));
    const paginatedNodes = filteredNodes.slice((nodePage - 1) * 50, nodePage * 50);
    const totalNodePages = Math.ceil(filteredNodes.length / 50);

    const filteredTraces = traces.filter(t => (auditFilter === "ALL" || t.severity === auditFilter) && (t.message.toLowerCase().includes(auditSearch.toLowerCase()) || t.user.toLowerCase().includes(auditSearch.toLowerCase()) || t.action.toLowerCase().includes(auditSearch.toLowerCase())));
    const paginatedTraces = filteredTraces.slice((auditPage - 1) * 50, auditPage * 50);
    const totalAuditPages = Math.ceil(filteredTraces.length / 50);

    const moveTier = (idx: number, direction: number) => {
        if (idx + direction < 0 || idx + direction >= pricingTiers.length) return;
        const newTiers = [...pricingTiers];
        const temp = newTiers[idx];
        newTiers[idx] = newTiers[idx + direction];
        newTiers[idx + direction] = temp;
        setPricingTiers(newTiers);
    };

    const [loading, setLoading] = useState(true);
    const [updatingNode, setUpdatingNode] = useState<string | null>(null);
    const [activeRoleNode, setActiveRoleNode] = useState<string | null>(null);
    const [roleDropdownRect, setRoleDropdownRect] = useState<DOMRect | null>(null);
    const [sandboxMode, setSandboxMode] = useState(false);
    const [mfaEnforced, setMFAEnforced] = useState(false);
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

    // Store Architectures
    const [storeSearch, setStoreSearch] = useState("");
    const [storeSearchInput, setStoreSearchInput] = useState("");
    const [storePage, setStorePage] = useState(1);
    const [totalStoreProducts, setTotalStoreProducts] = useState(0);
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);

    // Read inbound hash on initial render to preserve active tab
    useEffect(() => {
        if (typeof window !== "undefined") {
            const hash = window.location.hash.replace("#", "") as "overview" | "nodes" | "audit" | "telemetry" | "config" | "branding" | "broadcast" | "store" | "vouchers";
            if (["overview", "nodes", "audit", "telemetry", "config", "branding", "broadcast", "store", "vouchers"].includes(hash)) {
                setTab(hash as any);
            }
        }
    }, []);

    const handleTabChange = (newTab: "overview" | "nodes" | "audit" | "telemetry" | "config" | "branding" | "broadcast" | "store" | "vouchers") => {
        setTab(newTab);
        window.history.replaceState(null, "", `#${newTab}`);
    };

    const [telemetry, setTelemetry] = useState<{ latency: number, firebaseSync: string, resendTransport: string, stripeBridge: string, redisEdge: string } | null>(null);

    useEffect(() => {
        let telemetryInterval: NodeJS.Timeout;

        if (tab === "nodes" || tab === "overview") {
            setLoading(true);
            getSovereignNodes(500)
                .then(setNodes)
                .catch(e => console.error("Failed to load nodes", e))
                .finally(() => setLoading(false));
        }

        if (tab === "audit" || tab === "overview") {
            setLoading(true);
            getAuditTraces(100)
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

        if (tab === "overview" || tab === "config" || tab === "branding" || tab === "broadcast" || tab === "store") {
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
                    setMFAEnforced(res.mfaEnforced || false);
                })
                .catch(e => console.error("Failed to load global overrides:", e));
        }

        return () => {
            if (telemetryInterval) clearInterval(telemetryInterval);
        };
    }, [tab]);

    // Independent Effect: Reactive Store Catalog Matrix Load
    useEffect(() => {
        if (tab === "overview" || tab === "store") {
            setLoadingProducts(true);
            getStoreProducts(storeSearch, 50, storePage - 1).then(res => {
                setStoreProducts(res.items);
                setTotalStoreProducts(res.totalCount);
                setLoadingProducts(false);
            }).catch(() => setLoadingProducts(false));
        }
    }, [tab, storeSearch, storePage]);

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
                            { id: "overview", icon: LayoutDashboard, label: "Overview" },
                            { id: "branding", icon: Palette, label: "Branding" },
                            { id: "nodes", icon: Users, label: "Users" },
                            { id: "vouchers", icon: Ticket, label: "Vouchers" },
                            { id: "store", icon: ShoppingCart, label: "Store" },
                            { id: "config", icon: Settings, label: "Configuration" },
                            { id: "broadcast", icon: Radio, label: "Announcements" },
                            { id: "audit", icon: ShieldCheck, label: "Audit Logs" },
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

                            {tab === "vouchers" && (
                                <motion.div key="vouchers-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} className="space-y-6">
                                    <AdminVouchers />
                                </motion.div>
                            )}

                            {/* Tab: Overview */}
                            {tab === "overview" && (
                                <motion.div key="overview-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={120} /></div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50 relative z-10">Total Nodes</h3>
                                            <div className="text-4xl font-mono text-[var(--accent)] font-bold relative z-10">{nodes.length}</div>
                                            <div className="text-[10px] text-white/30 uppercase tracking-widest relative z-10">Active Sovereign Citizens</div>
                                        </GlassCard>
                                        <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={120} /></div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50 relative z-10">Store Mode</h3>
                                            <div className="flex flex-col gap-2 relative z-10">
                                                <div className="text-xl font-mono text-[var(--accent)] font-bold">{commerceMode ? commerceMode.toUpperCase() : "SYNCING..."}</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {haltingProtocol && <span className="px-2 py-0.5 text-[9px] bg-red-500/20 text-red-500 border border-red-500/30 uppercase tracking-widest font-bold">Maintenance</span>}
                                                    {preLaunchMode && <span className="px-2 py-0.5 text-[9px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 uppercase tracking-widest font-bold">Early Access</span>}
                                                    {sandboxMode && <span className="px-2 py-0.5 text-[9px] bg-blue-500/20 text-blue-500 border border-blue-500/30 uppercase tracking-widest font-bold">Sandbox</span>}
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-white/30 uppercase tracking-widest relative z-10">{commerceMode === 'saas' ? `${pricingTiers.length} Active Tiers` : commerceMode === 'store' ? `${totalStoreProducts} Active Products` : "Current Substrate Posture"}</div>
                                        </GlassCard>
                                        <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldCheck size={120} /></div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50 relative z-10">Critical Actions</h3>
                                            <div className="text-4xl font-mono text-red-500 font-bold relative z-10">{traces.filter(t => t.severity === "CRIT").length}</div>
                                            <div className="text-[10px] text-white/30 uppercase tracking-widest relative z-10">Critical Audit Traces</div>
                                        </GlassCard>
                                    </div>
                                    <div className="bg-black/40 border border-white/5">
                                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Recent Audit Activity</h3>
                                            <button onClick={() => setTab("audit")} className="text-[10px] text-[var(--accent)] hover:text-white transition-colors tracking-widest uppercase font-bold">View All</button>
                                        </div>
                                        <div className="w-full overflow-x-auto admin-scrollbar">
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
                                                    {traces.slice(0, 5).map((trace, i) => (
                                                        <tr key={trace.id || i} className="hover:bg-white/5 transition-colors group">
                                                            <td className="p-4 text-white/40 whitespace-nowrap">{new Date(trace.timestamp).toLocaleString()}</td>
                                                            <td className="p-4 font-bold tracking-widest uppercase">{trace.action}</td>
                                                            <td className="p-4">
                                                                <div className={`text-[10px] px-3 py-1 min-w-[70px] uppercase tracking-widest font-black inline-block text-center ${trace.severity === 'FATAL' || trace.severity === 'ERROR' || trace.severity === 'CRIT' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : trace.severity === 'WARN' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                                                    {trace.severity}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-[var(--accent)] max-w-xs truncate">{trace.user}</td>
                                                            <td className="p-4 text-white/60 w-1/3 min-w-[200px] max-w-[400px]">
                                                                <div className="truncate">{trace.message}</div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

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
                                        <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] shrink-0">Active Users</h3>
                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <div className="relative w-full md:w-64">
                                                    <Input
                                                        type="text"
                                                        placeholder="SEARCH BY ID OR EMAIL..."
                                                        value={nodeSearch}
                                                        onChange={(e) => { setNodeSearch(e.target.value); setNodePage(1); }}
                                                        icon={<Search size={14} />}
                                                    />
                                                </div>
                                                <button onClick={exportNodesCSV} className="shrink-0 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 h-[54px] rounded text-[10px] font-black uppercase tracking-widest transition-colors text-white/70 hover:text-white">
                                                    <Download size={14} /> <span className="hidden sm:inline">Export</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="w-full max-h-[600px] overflow-y-auto overflow-x-auto admin-scrollbar">
                                            <table className="w-full min-w-[800px] text-left border-collapse text-xs font-mono">
                                                <thead>
                                                    <tr className="bg-white/5 text-white/50 sticky top-0 z-10 backdrop-blur-md">
                                                        <th className="p-4 font-normal tracking-widest uppercase">ID</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Name</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Email Address</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Role</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Status</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Auth Type</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase">Created</th>
                                                        <th className="p-4 font-normal tracking-widest uppercase text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {loading ? (
                                                        <tr><td colSpan={8} className="p-8 text-center text-white/30 animate-pulse">Loading users...</td></tr>
                                                    ) : nodes.length === 0 ? (
                                                        <tr><td colSpan={8} className="p-8 text-center text-white/30">No users found.</td></tr>
                                                    ) : (
                                                        paginatedNodes.map((node) => (
                                                            <tr key={node.uid} className="hover:bg-white/5 transition-colors group">
                                                                <td className="p-4 text-white/40 group-hover:text-[var(--accent)] transition-colors">{node.uid.substring(0, 8)}...</td>
                                                                <td className="p-4">{node.displayName}</td>
                                                                <td className="p-4 font-bold">{node.email}</td>
                                                                <td className="p-4">
                                                                    <div className="relative inline-block w-full max-w-[90px]">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                if (activeRoleNode === node.uid) {
                                                                                    setActiveRoleNode(null);
                                                                                } else {
                                                                                    setRoleDropdownRect(e.currentTarget.getBoundingClientRect());
                                                                                    setActiveRoleNode(node.uid);
                                                                                }
                                                                            }}
                                                                            className="bg-black/50 border border-white/10 text-[10px] px-3 py-2 outline-none focus:border-[var(--accent)] disabled:opacity-50 min-w-[70px] text-left uppercase tracking-widest font-black text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                                                                            disabled={updatingNode === node.uid || node.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || node.email === session?.user?.email}
                                                                        >
                                                                            {updatingNode === node.uid ? "SYNC..." : (node.customClaims?.role === "ADMIN" || node.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ? "ROOT" : "USER")}
                                                                        </button>
                                                                        {activeRoleNode === node.uid && roleDropdownRect && typeof document !== 'undefined' && createPortal(
                                                                            <>
                                                                                <div className="fixed inset-0 z-[1000] cursor-default" onClick={() => setActiveRoleNode(null)} />
                                                                                <div
                                                                                    className="fixed z-[1001] bg-black/90 backdrop-blur-xl border border-white/10 flex flex-col shadow-2xl p-1 gap-1 min-w-[70px]"
                                                                                    style={{
                                                                                        top: `${roleDropdownRect.bottom + 8}px`,
                                                                                        left: `${roleDropdownRect.left}px`
                                                                                    }}
                                                                                >
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
                                                                            </>,
                                                                            document.body
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="p-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleStatusChange(node.uid, node.disabled)}
                                                                        className={`text-[10px] px-3 py-1 outline-none min-w-[70px] uppercase tracking-widest font-black transition-colors ${node.disabled
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
                                                                <td className="p-4 text-right">
                                                                    <button
                                                                        type="button"
                                                                        title="Impersonate"
                                                                        onClick={() => {
                                                                            toast({ title: "God Mode Active", description: `Impersonating ${node.email}`, type: "success" });
                                                                            update({
                                                                                impersonateId: node.uid,
                                                                                impersonateEmail: node.email,
                                                                                impersonateName: node.displayName,
                                                                                impersonateRole: node.customClaims?.role || "USER"
                                                                            }).then(() => router.push('/'));
                                                                        }}
                                                                        className="bg-white/5 border border-white/10 text-[10px] px-3 py-2 uppercase font-bold tracking-widest hover:bg-[var(--accent)] hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-white"
                                                                        disabled={node.email === session?.user?.email || node.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL}
                                                                    >
                                                                        <Eye size={14} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        {totalNodePages > 1 && (
                                            <div className="p-4 border-t border-white/5 bg-white/5 flex justify-between items-center text-xs font-mono text-white/50">
                                                <div>Showing {(nodePage - 1) * 50 + 1}-{Math.min(nodePage * 50, filteredNodes.length)} of {filteredNodes.length}</div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setNodePage(p => Math.max(1, p - 1))} disabled={nodePage === 1} className="px-3 py-1 bg-black/50 border border-white/10 disabled:opacity-30 hover:bg-white/5 text-[10px] font-black tracking-widest uppercase text-white transition-colors">Prev</button>
                                                    <button onClick={() => setNodePage(p => Math.min(totalNodePages, p + 1))} disabled={nodePage === totalNodePages} className="px-3 py-1 bg-black/50 border border-white/10 disabled:opacity-30 hover:bg-white/5 text-[10px] font-black tracking-widest uppercase text-white transition-colors">Next</button>
                                                </div>
                                            </div>
                                        )}
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
                                        <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] shrink-0">System Audit Logs</h3>
                                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                                <div className="flex items-center gap-1 bg-black/50 border border-white/10 overflow-hidden">
                                                    {["ALL", "INFO", "WARN", "CRIT"].map(f => (
                                                        <button key={f} onClick={() => setAuditFilter(f as any)} className={`px-3 py-2 text-[10px] font-black tracking-widest uppercase transition-colors ${auditFilter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>{f}</button>
                                                    ))}
                                                </div>
                                                <div className="relative w-full md:w-48">
                                                    <Input
                                                        type="text"
                                                        placeholder="SEARCH LOGS..."
                                                        value={auditSearch}
                                                        onChange={(e) => setAuditSearch(e.target.value)}
                                                        icon={<Search size={14} />}
                                                    />
                                                </div>
                                                <button onClick={exportAuditCSV} className="shrink-0 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 h-[54px] rounded text-[10px] font-black uppercase tracking-widest transition-colors text-white/70 hover:text-white">
                                                    <Download size={14} /> <span className="hidden sm:inline">Export</span>
                                                </button>
                                            </div>
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
                                                    ) : paginatedTraces.length === 0 ? (
                                                        <tr><td colSpan={5} className="p-8 text-center text-white/30 truncate">No events logged matching filters.</td></tr>
                                                    ) : (
                                                        paginatedTraces.map((trace, i) => (
                                                            <tr key={trace.id || i} className="hover:bg-white/5 transition-colors">
                                                                <td className="p-4 text-white/40 whitespace-nowrap">{new Date(trace.timestamp).toLocaleString()}</td>
                                                                <td className="p-4 font-bold tracking-widest">{trace.action}</td>
                                                                <td className="p-4">
                                                                    <div className={`text-[10px] px-3 py-1 min-w-[70px] uppercase tracking-widest font-black inline-block text-center ${trace.severity === 'FATAL' || trace.severity === 'ERROR' || trace.severity === 'CRIT' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : trace.severity === 'WARN' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                                                        {trace.severity}
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 text-[var(--accent)] max-w-xs truncate">{trace.user}</td>
                                                                <td className="p-4 text-white/60">{trace.message}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        {totalAuditPages > 1 && (
                                            <div className="p-4 border-t border-white/5 bg-white/5 flex justify-between items-center text-xs font-mono text-white/50">
                                                <div>Showing {(auditPage - 1) * 50 + 1}-{Math.min(auditPage * 50, filteredTraces.length)} of {filteredTraces.length}</div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setAuditPage(p => Math.max(1, p - 1))} disabled={auditPage === 1} className="px-3 py-1 bg-black/50 border border-white/10 disabled:opacity-30 hover:bg-white/5 text-[10px] font-black tracking-widest uppercase text-white transition-colors">Prev</button>
                                                    <button onClick={() => setAuditPage(p => Math.min(totalAuditPages, p + 1))} disabled={auditPage === totalAuditPages} className="px-3 py-1 bg-black/50 border border-white/10 disabled:opacity-30 hover:bg-white/5 text-[10px] font-black tracking-widest uppercase text-white transition-colors">Next</button>
                                                </div>
                                            </div>
                                        )}
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

                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 relative">
                                        <div className="space-y-2 text-left">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Enforce Workspace MFA</h3>
                                            <p className="text-xs font-serif italic text-white/50">Requires all active workspace users to verify via Authenticator.</p>
                                        </div>
                                        <div className="flex w-full justify-start">
                                            <button
                                                onClick={async () => {
                                                    const newState = !mfaEnforced;
                                                    setMFAEnforced(newState);
                                                    await setMFAEnforcedAction(newState);
                                                    router.refresh();
                                                }}
                                                className={`w-12 h-6 rounded-full relative transition-colors border shrink-0 ${mfaEnforced ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white/10 border-white/20'}`}
                                                aria-pressed={mfaEnforced}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${mfaEnforced ? 'translate-x-6' : 'translate-x-1'}`} />
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
                                                    className={`border text-xs px-6 py-2 outline-none min-w-[100px] uppercase tracking-widest font-bold transition-colors shadow-2xl ${rateLimitMode === variant ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black/50 border-white/10 text-white/80 hover:bg-white/5 focus:border-[var(--accent)]'}`}
                                                >
                                                    {variant}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="text-xs text-white/70 bg-black/50 p-4 border border-white/5 font-mono mt-2">
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
                                            <Input
                                                type="text"
                                                placeholder="NOREPLY@DOMAIN.COM"
                                                value={resendFrom}
                                                onChange={(e) => setResendFromUI(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const res = await setResendFrom(resendFrom);
                                                    if (res.success) {
                                                        toast({ title: "Configuration Updated", description: "Email relay origin established.", type: "success" });
                                                        router.refresh();
                                                    }
                                                }}
                                                className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)]/40 hover:text-white"
                                            >
                                                Save Email
                                            </button>
                                        </div>
                                    </GlassCard>

                                    {/* EDGE FEATURE FLAGS REMINDER */}
                                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 blur-[50px] pointer-events-none rounded-full" />
                                        <div className="space-y-2 text-left z-10">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
                                                <Activity size={16} /> Edge Content Infrastructure
                                            </h3>
                                            <p className="text-xs font-serif italic text-white/50 leading-relaxed">
                                                Your Vanguard Substrate contains two powerful Edge integrations that do not require UI management here:<br /><br />
                                                <strong>1. Zero-Latency Feature Flags:</strong> Located natively in your Upstash Redis console. The Edge proxy pulls `flags:global` instantly before render.<br />
                                                <strong>2. Command Matrix (CMD+K):</strong> Embedded globally for all users. Type <code className="bg-white/10 px-1 text-[10px]">&quot;Galaxy&quot;</code> or <code className="bg-white/10 px-1 text-[10px]">&quot;None&quot;</code> to jump themes instantly.
                                            </p>
                                        </div>
                                        <div className="z-10 mt-2 p-3 bg-black/50 border border-white/10 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 shadow-inner">
                                            Manage Edge configurations directly in standard deployment consoles.
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
                                                    className={`border text-xs px-6 py-2 outline-none min-w-[100px] uppercase tracking-widest font-bold transition-colors shadow-2xl ${commerceMode === variant ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black/50 border-white/10 text-white/80 hover:bg-white/5 focus:border-[var(--accent)]'}`}
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
                                                                buttonText: "Get Access",
                                                                stripeLink: ""
                                                            }]);
                                                        }} className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/40 px-3 py-1 uppercase font-bold tracking-widest border border-[var(--accent)] ml-auto sm:ml-0 flex items-center gap-2">
                                                            <Plus size={12} /> Add Tier
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
                                                    <span className="text-xs font-mono text-white/50">Recommended:</span>
                                                    <div className="flex flex-wrap border border-white/10 overflow-hidden">
                                                        {pricingTiers.map(tier => (
                                                            <button key={tier.id} onClick={() => setRecommendedPlan(tier.id)} className={`px-3 py-1 text-xs font-bold uppercase ${recommendedPlan === tier.id ? 'bg-[var(--accent)] text-white' : 'bg-black/50 text-white/50 hover:bg-white/5'}`}>{tier.name || 'Tier'}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
                                                {pricingTiers.map((tier, tIdx) => (
                                                    <div key={tier.id} className={`space-y-4 bg-white/5 border p-5 relative flex flex-col ${recommendedPlan === tier.id ? 'border-[var(--accent)]/50 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]' : 'border-white/10'}`}>
                                                        {recommendedPlan === tier.id && <div className="absolute -top-2.5 right-4 bg-[var(--accent)] text-[10px] text-white px-2 py-0.5 font-bold uppercase tracking-widest">Recommended</div>}

                                                        <div className="text-xs font-bold text-white mb-2 uppercase tracking-widest flex justify-between items-center">
                                                            Tier {tIdx + 1}
                                                            <div className="flex gap-2">
                                                                <button onClick={() => {
                                                                    const newTiers = [...pricingTiers];
                                                                    newTiers[tIdx].hidden = !newTiers[tIdx].hidden;
                                                                    setPricingTiers(newTiers);
                                                                }} className={`p-1 ${tier.hidden ? 'text-white/30 hover:text-white/50' : 'text-green-500 hover:text-green-400'}`}>
                                                                    {tier.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                                                </button>
                                                                <button onClick={() => {
                                                                    setPricingTiers(pricingTiers.filter((_, i) => i !== tIdx));
                                                                    if (recommendedPlan === tier.id) setRecommendedPlan("");
                                                                }} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                                                            </div>
                                                        </div>

                                                        <Input type="text" placeholder="PLAN NAME" className="font-mono font-bold w-full" value={tier.name} onChange={(e) => {
                                                            const newTiers = [...pricingTiers];
                                                            newTiers[tIdx].name = e.target.value;
                                                            setPricingTiers(newTiers);
                                                        }} />

                                                        <Input type="text" placeholder="PRICE (E.G. 9)" className="font-mono text-lg w-full" value={tier.price} onChange={(e) => {
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
                                                                        }} className={`w-5 h-5 flex items-center justify-center shrink-0 border ${isActive ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black/50 border-white/20 text-transparent hover:border-white/40'}`}>
                                                                            <Check size={12} className={isActive ? 'opacity-100' : 'opacity-0'} />
                                                                        </button>
                                                                        <Input type="text" placeholder="FEATURE" className={`w-full font-mono ${isActive ? 'text-white' : 'text-white/30 line-through'}`} value={featureName} onChange={(e) => {
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
                                                                            }} className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/20 disabled:opacity-20 disabled:hover:bg-white/5"><ArrowUp size={10} /></button>
                                                                            <button disabled={fIdx === tier.features.length - 1} onClick={() => {
                                                                                const newTiers = [...pricingTiers];
                                                                                const temp = newTiers[tIdx].features[fIdx];
                                                                                newTiers[tIdx].features[fIdx] = newTiers[tIdx].features[fIdx + 1];
                                                                                newTiers[tIdx].features[fIdx + 1] = temp;
                                                                                setPricingTiers(newTiers);
                                                                            }} className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/20 disabled:opacity-20 disabled:hover:bg-white/5"><ArrowDown size={10} /></button>
                                                                        </div>
                                                                        <button onClick={() => {
                                                                            const newTiers = [...pricingTiers];
                                                                            newTiers[tIdx].features.splice(fIdx, 1);
                                                                            setPricingTiers(newTiers);
                                                                        }} className="w-5 h-5 flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 shrink-0"><Trash2 size={12} /></button>
                                                                    </div>
                                                                )
                                                            })}
                                                            <button onClick={() => {
                                                                const newTiers = [...pricingTiers];
                                                                newTiers[tIdx].features.push({ name: "", active: true });
                                                                setPricingTiers(newTiers);
                                                            }} className="w-full text-xs py-1.5 border border-dashed border-white/20 text-white/50 hover:bg-white/5 hover:text-white uppercase tracking-widest font-bold flex items-center justify-center gap-2 mt-1"><Plus size={12} /> Add Feature</button>
                                                        </div>

                                                        <Input type="text" placeholder="STRIPE CHECKOUT LINK" className="font-mono mt-auto w-full" value={tier.stripeLink || ""} onChange={(e) => {
                                                            const newTiers = [...pricingTiers];
                                                            newTiers[tIdx].stripeLink = e.target.value;
                                                            setPricingTiers(newTiers);
                                                        }} />

                                                        <Input type="text" placeholder="BUTTON TEXT" className="font-mono w-full" value={tier.buttonText} onChange={(e) => {
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
                                                            toast({ title: "Matrix Updated", description: "Pricing arrays recalibrated.", type: "success" });
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
                                        <div className="flex flex-col gap-4 md:col-span-2">
                                            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col gap-4">
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                                                    <div className="space-y-2 text-left">
                                                        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Product Catalog Matrix</h3>
                                                        <p className="text-xs font-serif italic text-white/50">Manage physical or digital store entities. Scale-hardened.</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="relative group">
                                                            <div className="flex bg-[var(--accent)] text-black font-bold uppercase tracking-widest text-xs h-[54px] rounded border border-[var(--accent)]/50 items-stretch">
                                                                <button
                                                                    onClick={() => { setIsEditingProduct(false); setProductForm({ id: "", name: "", description: "", price: "", imageUrl: "", stripeLink: "" }); setIsStoreModalOpen(true); }}
                                                                    className="px-6 flex items-center justify-center gap-2 hover:bg-white/20 transition-colors h-full text-black hover:text-black"
                                                                >
                                                                    <Plus size={14} /> Add Product
                                                                </button>
                                                                <div className="w-[1px] bg-black/20" />
                                                                <button
                                                                    onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                                                                    className="px-4 flex items-center justify-center hover:bg-white/20 transition-colors h-full text-black hover:text-black"
                                                                >
                                                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isStoreDropdownOpen ? 'rotate-180' : ''}`} />
                                                                </button>
                                                            </div>
                                                            <AnimatePresence>
                                                                {isStoreDropdownOpen && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                                                                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                                                        exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                                                                        className="absolute right-0 top-[60px] z-50 w-48 bg-black border border-white/10 shadow-2xl flex flex-col items-start origin-top-right overflow-hidden rounded"
                                                                    >
                                                                        <label className="w-full text-left px-4 py-4 text-[10px] technical tracking-widest hover:bg-white/5 cursor-pointer uppercase text-white/70 hover:text-white transition-colors flex items-center gap-2">
                                                                            <ArrowUp size={14} /> Import CSV
                                                                            <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                                                                                setIsStoreDropdownOpen(false);
                                                                                if (!e.target.files?.[0]) return;
                                                                                const text = await e.target.files[0].text();
                                                                                const rows = text.split("\n").slice(1).filter(r => r.trim());
                                                                                const prods = rows.map(Math.random() /* trigger reparse */ ? r => {
                                                                                    const parts = r.split(",");
                                                                                    const name = parts[0]?.replace(/"/g, '');
                                                                                    const price = parseFloat(parts[1]) || 0;
                                                                                    return { name, price, description: parts[2] || '', imageUrl: parts[3] || '', stripeLink: parts[4] || '' };
                                                                                } : () => ({}));
                                                                                if (confirm(`Bulk import ${prods.length} products?`)) {
                                                                                    setLoadingProducts(true);
                                                                                    const res = await bulkImportStoreProducts(prods);
                                                                                    if (res.success) {
                                                                                        toast({ title: "Import Successful", description: `Imported ${prods.length} products.`, type: "success" });
                                                                                        setStorePage(1);
                                                                                        const fresh = await getStoreProducts(storeSearch, 50, 0);
                                                                                        setStoreProducts(fresh.items);
                                                                                        setTotalStoreProducts(fresh.totalCount);
                                                                                        setLoadingProducts(false);
                                                                                    }
                                                                                }
                                                                                e.target.value = '';
                                                                            }} />
                                                                        </label>
                                                                        <button
                                                                            onClick={async () => {
                                                                                setIsStoreDropdownOpen(false);
                                                                                const exportData = await getStoreProducts("", 10000, 0);
                                                                                const csvContent = "data:text/csv;charset=utf-8,Name,Price,Description,ImageUrl,StripeLink\n" + exportData.items.map((p: any) => `"${p.name || ''}",${p.price || 0},"${p.description || ''}","${p.imageUrl || ''}","${p.stripeLink || ''}"`).join("\n");
                                                                                const encodedUri = encodeURI(csvContent);
                                                                                const link = document.createElement("a");
                                                                                link.setAttribute("href", encodedUri);
                                                                                link.setAttribute("download", `store_export_${new Date().toISOString()}.csv`);
                                                                                document.body.appendChild(link);
                                                                                link.click();
                                                                                document.body.removeChild(link);
                                                                            }}
                                                                            className="w-full text-left px-4 py-4 text-[10px] technical tracking-widest hover:bg-white/5 uppercase text-white/70 hover:text-white transition-colors flex items-center gap-2 border-t border-white/5"
                                                                        >
                                                                            <Download size={14} /> Export CSV
                                                                        </button>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Matrix Filters */}
                                                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 border border-white/5">
                                                    <div className="relative w-full md:w-96 flex">
                                                        <Input
                                                            type="text"
                                                            placeholder="SEARCH PRODUCTS BY PREFIX..."
                                                            value={storeSearchInput}
                                                            onChange={(e) => setStoreSearchInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    setStorePage(1);
                                                                    setStoreSearch(storeSearchInput);
                                                                }
                                                            }}
                                                            icon={<Search size={14} />}
                                                        />
                                                    </div>
                                                    <div className="text-xs font-mono text-white/50">{totalStoreProducts} matching records</div>
                                                </div>

                                                {/* Dense Data Table */}
                                                <div className="overflow-x-auto border border-white/10 bg-black/40">
                                                    <table className="w-full text-left text-xs text-white/70">
                                                        <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/40 border-b border-white/10">
                                                            <tr>
                                                                <th className="px-4 py-3 font-medium">Product ID</th>
                                                                <th className="px-4 py-3 font-medium">Name</th>
                                                                <th className="px-4 py-3 font-medium">Price</th>
                                                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5 font-mono">
                                                            {loadingProducts ? (
                                                                <tr><td colSpan={4} className="px-4 py-8 text-center text-white/30">Syncing Substrate Matrix...</td></tr>
                                                            ) : storeProducts.length === 0 ? (
                                                                <tr><td colSpan={4} className="px-4 py-8 text-center text-white/30">No logic objects found.</td></tr>
                                                            ) : storeProducts.map((p: any) => (
                                                                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                                                    <td className="px-4 py-3 text-white/30 tracking-widest">{p.id?.slice(0, 8)}</td>
                                                                    <td className="px-4 py-3 text-white font-sans">{p.name}</td>
                                                                    <td className="px-4 py-3 text-[var(--accent)]">${p.price}</td>
                                                                    <td className="px-4 py-3 text-right">
                                                                        <div className="flex justify-end gap-2">
                                                                            <button onClick={() => { setIsEditingProduct(true); setProductForm(p); setIsStoreModalOpen(true); }} className="p-1.5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"><Edit2 size={14} /></button>
                                                                            <button onClick={async () => {
                                                                                if (!confirm("Are you sure?")) return;
                                                                                const res = await deleteStoreProduct(p.id);
                                                                                if (res.success) {
                                                                                    setStoreProducts(storeProducts.filter((prod: any) => prod.id !== p.id));
                                                                                    setTotalStoreProducts(prev => prev - 1);
                                                                                }
                                                                            }} className="p-1.5 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Pagination */}
                                                {totalStoreProducts > 0 && (
                                                    <div className="flex justify-between items-center p-4 border-t border-white/5 bg-white/5">
                                                        <div className="text-xs text-white/50 font-mono tracking-widest">
                                                            PAGE {storePage} OF {Math.max(1, Math.ceil(totalStoreProducts / 50))}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setStorePage(Math.max(1, storePage - 1))}
                                                                disabled={storePage === 1}
                                                                className="bg-black/50 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed p-2 text-white transition-colors"
                                                            >
                                                                <ArrowLeft size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setStorePage(Math.min(Math.ceil(totalStoreProducts / 50), storePage + 1))}
                                                                disabled={storePage >= Math.ceil(totalStoreProducts / 50)}
                                                                className="bg-black/50 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed p-2 text-white transition-colors"
                                                            >
                                                                <ArrowRight size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </GlassCard>

                                            {/* Modal Editor */}
                                            {isStoreModalOpen && (
                                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                                    <GlassCard className="w-full max-w-2xl border border-white/10 bg-black p-6 flex flex-col gap-6 relative shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                                                        <button onClick={() => setIsStoreModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20} /></button>
                                                        <div>
                                                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{isEditingProduct ? "Edit Logistics Node" : "Instantiate New Node"}</h3>
                                                        </div>

                                                        <div className="flex flex-col gap-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <Input
                                                                    type="text"
                                                                    placeholder="PRODUCT NAME"
                                                                    value={productForm.name}
                                                                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder="PRICE (E.G. 19.99)"
                                                                    value={productForm.price}
                                                                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                                                />
                                                                <div className="md:col-span-2">
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="PRODUCT IMAGE URL"
                                                                        value={productForm.imageUrl}
                                                                        onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="DESCRIPTION"
                                                                        value={productForm.description}
                                                                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="STRIPE CHECKOUT LINK"
                                                                        value={productForm.stripeLink}
                                                                        onChange={e => setProductForm({ ...productForm, stripeLink: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!productForm.name || !productForm.price) return toast({ title: "Validation Error", description: "Name and price required", type: "error" });
                                                                    if (isEditingProduct && productForm.id) {
                                                                        const res = await updateStoreProduct(productForm.id, productForm);
                                                                        if (res.success) {
                                                                            setStoreProducts(storeProducts.map((p: any) => p.id === productForm.id ? productForm : p));
                                                                            setIsEditingProduct(false);
                                                                            setProductForm({ id: "", name: "", description: "", price: "", imageUrl: "", stripeLink: "" });
                                                                            setIsStoreModalOpen(false);
                                                                        }
                                                                    } else {
                                                                        const res = await createStoreProduct(productForm);
                                                                        if (res.success) {
                                                                            setStoreProducts([...storeProducts, { ...productForm, id: res.id }]);
                                                                            setProductForm({ id: "", name: "", description: "", price: "", imageUrl: "", stripeLink: "" });
                                                                            setTotalStoreProducts(prev => prev + 1);
                                                                            setIsStoreModalOpen(false);
                                                                        }
                                                                    }
                                                                }}
                                                                className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-3 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)] hover:text-black w-full"
                                                            >
                                                                {isEditingProduct ? "Update Logic Node" : "Commit Node"}
                                                            </button>
                                                        </div>
                                                    </GlassCard>
                                                </div>
                                            )}
                                        </div>
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
                                            <Input
                                                type="text"
                                                placeholder="ENTER ANNOUNCEMENT MESSAGE..."
                                                value={broadcastMessage}
                                                onChange={(e) => setBroadcastMessage(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const res = await setGlobalBroadcast(broadcastMessage);
                                                    if (res.success) {
                                                        toast({ title: "Broadcast Active", description: "Broadcast injected globally.", type: "success" });
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
                                            <Input
                                                type="text"
                                                placeholder="NEXUS VANGUARD"
                                                value={siteTitle}
                                                onChange={(e) => setSiteTitleUI(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const res = await setSiteTitle(siteTitle);
                                                    if (res.success) {
                                                        toast({ title: "Branding Updated", description: "Site Title override established.", type: "success" });
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
                                            <Input
                                                type="text"
                                                placeholder="THE ULTIMATE SOVEREIGN IDENTITY MATRIX."
                                                value={typographyOverride}
                                                onChange={(e) => setTypographyOverride(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const res = await setContentOverride(typographyOverride);
                                                    if (res.success) {
                                                        toast({ title: "Branding Updated", description: "Typography override established.", type: "success" });
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
                                            <Input
                                                type="text"
                                                placeholder="HI+NEXTJS@BOILER.CLICK"
                                                value={contactEmail}
                                                onChange={(e) => setContactEmailUI(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const res = await setContactEmail(contactEmail);
                                                    if (res.success) {
                                                        toast({ title: "Configuration Updated", description: "Support Relay vector established.", type: "success" });
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
                                            <Input
                                                type="text"
                                                placeholder="#A855F7"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColorUI(e.target.value)}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const res = await setPrimaryColor(primaryColor);
                                                    if (res.success) {
                                                        toast({ title: "Branding Updated", description: "Global Accent Hue established.", type: "success" });
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
                                        <div className="flex flex-col gap-4 w-full">
                                            <Textarea
                                                placeholder="WEBSITE META DESCRIPTION"
                                                value={seoDescription}
                                                onChange={(e) => setSeoDescriptionUI(e.target.value)}
                                            />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                                <Input
                                                    type="text"
                                                    placeholder="SEO KEYWORDS (COMMA SEPARATED)"
                                                    value={seoKeywords}
                                                    onChange={(e) => setSeoKeywordsUI(e.target.value)}
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="SOCIAL SHARE IMAGE URL (E.G. /OG.PNG)"
                                                    value={seoOgImage}
                                                    onChange={(e) => setSeoOgImageUI(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex w-full justify-start">
                                            <button
                                                onClick={async () => {
                                                    const res = await setSEOMetadata({ description: seoDescription, keywords: seoKeywords, ogUrl: seoOgImage });
                                                    if (res.success) {
                                                        toast({ title: "Configuration Updated", description: "Search Index Protocols synchronized.", type: "success" });
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
                                            <Input
                                                type="text"
                                                placeholder="X / TWITTER URL"
                                                value={socialX}
                                                onChange={(e) => setSocialXUI(e.target.value)}
                                            />
                                            <Input
                                                type="text"
                                                placeholder="GITHUB URL"
                                                value={socialGithub}
                                                onChange={(e) => setSocialGithubUI(e.target.value)}
                                            />
                                            <Input
                                                type="text"
                                                placeholder="DISCORD URL"
                                                value={socialDiscord}
                                                onChange={(e) => setSocialDiscordUI(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex w-full justify-start">
                                            <button
                                                onClick={async () => {
                                                    const res = await setSocialLinks({ socialX, socialGithub, socialDiscord });
                                                    if (res.success) {
                                                        toast({ title: "Configuration Updated", description: "Social Relays synchronized.", type: "success" });
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
                                                    className={`border text-xs px-6 py-2 outline-none min-w-[100px] uppercase tracking-widest font-bold transition-colors shadow-2xl ${webglVariantUI === variant ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black/50 border-white/10 text-white/80 hover:bg-white/5 focus:border-[var(--accent)]'}`}
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

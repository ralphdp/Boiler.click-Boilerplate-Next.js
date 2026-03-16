"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
    ShieldAlert,
    Users,
    Activity,
    Settings,
    ArrowLeft,
    Radio,
    ShoppingCart,
    ShieldCheck,
    Palette,
    LayoutDashboard,
    Ticket,
    FileCode,
    BarChart3,
    Globe
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

// Core Actions
import {
    getGlobalOverrides,
    getSovereignNodes,
    getAuditTraces,
    getTelemetryData,
    setNodeRole,
    setNodeStatus,
    getStoreProducts
} from "@/core/actions/admin";

// Extracted Components
import { AdminOverview } from "./components/AdminOverview";
import { AdminNodes } from "./components/AdminNodes";
import { AdminAudit } from "./components/AdminAudit";
import { AdminTelemetry } from "./components/AdminTelemetry";
import { AdminVFS } from "./components/AdminVFS";
import { AdminConfig } from "./components/AdminConfig";
import { AdminBranding } from "./components/AdminBranding";
import { AdminBroadcast } from "./components/AdminBroadcast";
import { AdminSEO } from "./components/AdminSEO";
import { AdminStore } from "./components/AdminStore";
import { AdminVouchers } from "./components/AdminVouchers";
import { AdminAnalytics } from "./components/AdminAnalytics";

export default function AdminPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { data: session, update } = useSession();
    const { t, language } = useTranslation();

    // Tab State
    const [tab, setTab] = useState<"overview" | "nodes" | "audit" | "telemetry" | "config" | "branding" | "broadcast" | "store" | "vouchers" | "vfs" | "analytics" | "seo">("overview");

    // Unified Global Overrides State
    const [loadingOverrides, setLoadingOverrides] = useState(true);

    // Data States for specific tabs
    const [nodes, setNodes] = useState<any[]>([]);
    const [traces, setTraces] = useState<any[]>([]);
    const [telemetry, setTelemetry] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(false);

    // UI State for Overrides (Sync with server)
    const [haltingProtocol, setHaltingProtocol] = useState(false);
    const [preLaunchMode, setPreLaunchMode] = useState(false);
    const [mfaEnforced, setMFAEnforced] = useState(false);
    const [sandboxMode, setSandboxMode] = useState(false);
    const [commerceMode, setCommerceModeUI] = useState("");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [siteTitle, setSiteTitleUI] = useState("");
    const [contactEmail, setContactEmailUI] = useState("");
    const [primaryColor, setPrimaryColorUI] = useState("");
    const [typographyOverride, setTypographyOverride] = useState("");
    const [resendFrom, setResendFromUI] = useState("");
    const [seoDescription, setSeoDescriptionUI] = useState("");
    const [seoKeywords, setSeoKeywordsUI] = useState("");
    const [seoOgImage, setSeoOgImageUI] = useState("");
    const [socialX, setSocialXUI] = useState("");
    const [socialGithub, setSocialGithubUI] = useState("");
    const [socialDiscord, setSocialDiscordUI] = useState("");
    const [webglVariantUI, setWebglVariantUI] = useState("fire");
    const [rateLimitMode, setRateLimitModeUI] = useState("standard");
    const [pricingTiers, setPricingTiers] = useState<any[]>([]);
    const [recommendedPlan, setRecommendedPlan] = useState("");
    const [totalStoreProducts, setTotalStoreProducts] = useState(0);
    const [domainShield, setDomainShieldUI] = useState(false);
    const [gaId, setGaIdUI] = useState("");
    const [gaPropertyId, setGaPropertyIdUI] = useState("");
    const [posthogId, setPosthogIdUI] = useState("");
    const [modules, setModules] = useState<any>({
        vfs: true,
        vouchers: true,
        store: true,
        workspaces: true,
        api: true,
        socialAuth: true,
        publicAnalytics: true,
        auditVisibility: true,
        aiSupport: true
    });

    // Read inbound hash on initial render
    useEffect(() => {
        if (typeof window !== "undefined") {
            const hash = window.location.hash.replace("#", "") as any;
            if (["overview", "nodes", "audit", "telemetry", "config", "branding", "broadcast", "store", "vouchers", "vfs", "analytics", "seo"].includes(hash)) {
                setTab(hash);
            }
        }
    }, []);

    const handleTabChange = (newTab: typeof tab) => {
        setTab(newTab);
        window.history.replaceState(null, "", `#${newTab}`);
    };

    // Load Overrides
    useEffect(() => {
        setLoadingOverrides(true);
        getGlobalOverrides()
            .then(res => {
                setHaltingProtocol(res.haltingProtocol);
                setPreLaunchMode(res.preLaunchMode);
                setMFAEnforced(res.mfaEnforced);
                setSandboxMode(res.sandboxMode);
                setCommerceModeUI(res.commerceMode);
                setBroadcastMessage(res.broadcast);
                setSiteTitleUI(res.siteTitle);
                setContactEmailUI(res.contactEmail);
                setPrimaryColorUI(res.primaryColor);
                setTypographyOverride(res.typography);
                setResendFromUI(res.resendFrom);
                setSeoDescriptionUI(res.seoDescription);
                setSeoKeywordsUI(res.seoKeywords);
                setSeoOgImageUI(res.seoOgImage);
                setSocialXUI(res.socialX);
                setSocialGithubUI(res.socialGithub);
                setSocialDiscordUI(res.socialDiscord);
                setWebglVariantUI(res.webglVariant);
                setRateLimitModeUI(res.rateLimitMode);
                setPricingTiers(res.pricingTiers || []);
                setRecommendedPlan(res.recommendedPlan || "");
                setDomainShieldUI(res.domainShield || false);
                setGaIdUI(res.gaId || "");
                setGaPropertyIdUI(res.gaPropertyId || "");
                setPosthogIdUI(res.posthogId || "");
                if (res.modules) setModules(res.modules);
            })
            .catch(e => {
                console.error("Failed to load overrides", e);
                toast({ title: "System Error", description: "Could not fetch global overrides.", type: "error" });
            })
            .finally(() => setLoadingOverrides(false));
    }, [toast]);

    // Tab-specific data fetching
    useEffect(() => {
        let telemetryInterval: NodeJS.Timeout;

        if (tab === "nodes" || tab === "overview") {
            setLoadingData(true);
            getSovereignNodes(500)
                .then(setNodes)
                .finally(() => setLoadingData(false));
        }

        if (tab === "audit" || tab === "overview") {
            setLoadingData(true);
            getAuditTraces(100)
                .then(setTraces)
                .finally(() => setLoadingData(false));
        }

        if (tab === "store" || tab === "overview") {
            getStoreProducts("", 1, 0).then(res => setTotalStoreProducts(res.totalCount));
        }

        if (tab === "telemetry" || tab === "overview") {
            const fetchTelemetry = () => {
                getTelemetryData()
                    .then(setTelemetry)
                    .catch(e => console.error("Telemetry failed", e));
            };
            fetchTelemetry();
            telemetryInterval = setInterval(fetchTelemetry, 2500);
        }

        return () => {
            if (telemetryInterval) clearInterval(telemetryInterval);
        };
    }, [tab]);

    const [updatingNode, setUpdatingNode] = useState<string | null>(null);

    const handleRoleChange = async (uid: string, newRole: "ADMIN" | "USER") => {
        setUpdatingNode(uid);
        const res = await setNodeRole(uid, newRole);
        if (res.success) {
            setNodes(nodes.map(n => n.uid === uid ? { ...n, customClaims: { ...n.customClaims, role: newRole } } : n));
            toast({ title: t.admin.users.roleUpdated, type: "success" });
        } else {
            toast({ title: "Role Update Failed", description: res.message, type: "error" });
        }
        setUpdatingNode(null);
    };

    const handleStatusChange = async (uid: string, currentlyDisabled: boolean) => {
        setUpdatingNode(uid);
        const res = await setNodeStatus(uid, !currentlyDisabled);
        if (res.success) {
            setNodes(nodes.map(n => n.uid === uid ? { ...n, disabled: !currentlyDisabled } : n));
            toast({ title: t.admin.users.statusUpdated, type: "success" });
        } else {
            toast({ title: "Status Update Failed", description: res.message, type: "error" });
        }
        setUpdatingNode(null);
    };

    const onImpersonate = async (node: any) => {
        toast({ title: t.admin.overview.godModeActive, description: `${t.admin.overview.impersonating} ${node.email}`, type: "success" });
        await update({
            impersonateId: node.uid,
            impersonateEmail: node.email,
            impersonateName: node.displayName,
            impersonateRole: node.customClaims?.role || "USER"
        });
        router.push('/');
    };

    const stats = {
        totalNodes: nodes.length,
        commerceMode: commerceMode,
        haltingProtocol: haltingProtocol,
        recentTraces: traces.slice(0, 5)
    };

    return (
        <main className="relative min-h-screen p-6 text-white overflow-y-auto">
            <div className="w-full max-w-5xl mx-auto space-y-6 pt-12 pb-24">

                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <Button as={Link} href={`/${language}/dashboard`} variant="ghost" className="w-fit text-white/50 px-0 hover:text-white">
                        <ArrowLeft size={16} className="mr-2" />
                        {t.admin.return}
                    </Button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-2xl font-black uppercase tracking-widest text-[var(--accent)] font-mono flex items-center gap-3">
                            <ShieldAlert size={24} />
                            {t.admin.title}
                        </h1>
                        <div className="text-[10px] font-mono tracking-widest px-4 py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)]">
                            {t.admin.loggedInAs} {session?.user?.email}
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-[var(--accent)]/50 via-[var(--accent)]/10 to-transparent" />

                {/* Vertical Split Layout */}
                <div className="flex flex-col md:flex-row gap-6 items-start w-full">
                    {/* Tabs Sidebar */}
                    <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible w-full md:w-56 shrink-0 gap-1 border-b md:border-b-0 md:border-r border-white/5 pb-2 md:pb-0 md:pr-4 select-none admin-scrollbar">
                        {([
                            { id: "overview", icon: LayoutDashboard, label: t.admin.tabs.overview },
                            { id: "branding", icon: Palette, label: t.admin.tabs.branding },
                            { id: "nodes", icon: Users, label: t.admin.tabs.users },
                            { id: "store", icon: ShoppingCart, label: t.admin.tabs.store },
                            { id: "config", icon: Settings, label: t.admin.tabs.config },
                            { id: "broadcast", icon: Radio, label: t.admin.tabs.broadcast },
                            { id: "analytics", icon: BarChart3, label: t.admin.tabs.analytics || "Analytics" },
                            { id: "vouchers", icon: Ticket, label: t.admin.tabs.vouchers || "Vouchers" },
                            { id: "seo", icon: Globe, label: t.admin.tabs.seo || "SEO Matrix" },
                            { id: "vfs", icon: FileCode, label: t.admin.tabs.vfs || "VFS Auditor" },
                            { id: "audit", icon: ShieldCheck, label: t.admin.tabs.audit },
                            { id: "telemetry", icon: Activity, label: t.admin.tabs.telemetry }
                        ].filter(tabItem => {
                            if (tabItem.id === "vfs") return modules.vfs;
                            if (tabItem.id === "vouchers") return modules.vouchers;
                            if (tabItem.id === "store") return modules.store;
                            if (tabItem.id === "analytics") return modules.publicAnalytics || session?.user?.role === "ADMIN";
                            return true;
                        }) as any).map(({ id, icon: Icon, label }: any) => (
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
                            {tab === "overview" && (
                                <AdminOverview
                                    t={t}
                                    nodes={nodes}
                                    traces={traces}
                                    commerceMode={commerceMode}
                                    haltingProtocol={haltingProtocol}
                                    preLaunchMode={preLaunchMode}
                                    sandboxMode={sandboxMode}
                                    pricingTiers={pricingTiers}
                                    totalStoreProducts={totalStoreProducts}
                                    telemetry={telemetry}
                                    setTab={setTab}
                                />
                            )}
                            {tab === "nodes" && (
                                <AdminNodes
                                    t={t}
                                    nodes={nodes}
                                    loading={loadingData}
                                    session={session}
                                    updatingNode={updatingNode}
                                    handleRoleChange={handleRoleChange}
                                    handleStatusChange={handleStatusChange}
                                    onImpersonate={onImpersonate}
                                    superAdminEmail={process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL}
                                />
                            )}
                            {tab === "vouchers" && modules.vouchers && <AdminVouchers t={t} />}
                            {tab === "seo" && <AdminSEO t={t} />}
                            {tab === "audit" && <AdminAudit t={t} traces={traces} loading={loadingData} />}
                            {tab === "telemetry" && <AdminTelemetry t={t} telemetry={telemetry} />}
                            {tab === "config" && (
                                <AdminConfig
                                    t={t}
                                    haltingProtocol={haltingProtocol} setHaltingProtocol={setHaltingProtocol}
                                    preLaunchMode={preLaunchMode} setPreLaunchMode={setPreLaunchMode}
                                    mfaEnforced={mfaEnforced} setMFAEnforced={setMFAEnforced}
                                    rateLimitMode={rateLimitMode} setRateLimitModeUI={setRateLimitModeUI}
                                    resendFrom={resendFrom} setResendFromUI={setResendFromUI}
                                    sandboxMode={sandboxMode} setSandboxMode={setSandboxMode}
                                    domainShield={domainShield} setDomainShieldUI={setDomainShieldUI}
                                    gaId={gaId} setGaIdUI={setGaIdUI}
                                    gaPropertyId={gaPropertyId} setGaPropertyIdUI={setGaPropertyIdUI}
                                    posthogId={posthogId} setPosthogIdUI={setPosthogIdUI}
                                    modules={modules} setModules={setModules}
                                />
                            )}
                            {tab === "branding" && (
                                <AdminBranding
                                    t={t}
                                    siteTitle={siteTitle} setSiteTitleUI={setSiteTitleUI}
                                    typographyOverride={typographyOverride} setTypographyOverride={setTypographyOverride}
                                    contactEmail={contactEmail} setContactEmailUI={setContactEmailUI}
                                    primaryColor={primaryColor} setPrimaryColorUI={setPrimaryColorUI}
                                    seoDescription={seoDescription} setSeoDescriptionUI={setSeoDescriptionUI}
                                    seoKeywords={seoKeywords} setSeoKeywordsUI={setSeoKeywordsUI}
                                    seoOgImage={seoOgImage} setSeoOgImageUI={setSeoOgImageUI}
                                    socialX={socialX} setSocialXUI={setSocialXUI}
                                    socialGithub={socialGithub} setSocialGithubUI={setSocialGithubUI}
                                    socialDiscord={socialDiscord} setSocialDiscordUI={setSocialDiscordUI}
                                    webglVariantUI={webglVariantUI} setWebglVariantUI={setWebglVariantUI}
                                />
                            )}
                            {tab === "broadcast" && <AdminBroadcast t={t} broadcastMessage={broadcastMessage} setBroadcastMessage={setBroadcastMessage} />}
                            {tab === "store" && modules.store && (
                                <AdminStore
                                    t={t}
                                    commerceMode={commerceMode} setCommerceModeUI={setCommerceModeUI}
                                    pricingTiers={pricingTiers} setPricingTiers={setPricingTiers}
                                    recommendedPlan={recommendedPlan} setRecommendedPlan={setRecommendedPlan}
                                    sandboxMode={sandboxMode} setSandboxMode={setSandboxMode}
                                />
                            )}
                            {tab === "analytics" && <AdminAnalytics t={t} />}
                            {tab === "vfs" && modules.vfs && (
                                <motion.div key="vfs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <AdminVFS />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>

            {/* Grid Backdrop (Accent Tinted) */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

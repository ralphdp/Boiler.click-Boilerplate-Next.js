"use client";

import { useSession } from "next-auth/react";
import { ACTIVE_THEME } from "@/theme/config";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Settings, CreditCard, ArrowLeft, ShieldAlert, KeyRound, LayoutGrid, Clock } from "lucide-react";
import { OnboardingTour } from "@/components/ui/OnboardingTour";

import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useFeatureFlags } from "@/core/hooks/useFeatureFlags";

export default function DashboardPage() {
    const { data: session } = useSession();
    const { language, t } = useTranslation();
    const name = session?.user?.name || session?.user?.email || "ARCHITECT";
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    const { modules, loading } = useFeatureFlags();

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            <OnboardingTour userId={session?.user?.id} />

            <div className="w-full max-w-xl mb-6">
                <Button as={Link} href={`/${language}`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={16} />
                    {t.dashboard.backToHome}
                </Button>
            </div>

            <GlassCard className="w-full max-w-xl space-y-6">
                <div className="space-y-2 text-center md:text-left">
                    <h1 className="text-3xl font-black technical tracking-[0.2em] uppercase">{t.dashboard.title}</h1>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--accent)]">
                        {t.dashboard.accessAuthorized}
                    </p>
                </div>

                <div className="w-full h-px bg-white/5" />

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center font-bold text-[var(--accent)] bg-[var(--accent)]/10 overflow-hidden shrink-0">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="text-left">
                            <p className="font-bold tracking-widest uppercase">{name}</p>
                            <p className="text-xs text-white/50 uppercase tracking-widest opacity-80">{session?.user?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full overflow-hidden">
                    <Button
                        as={Link}
                        href={`/${language}/dashboard/settings`}
                        variant="glass"
                        className="justify-start pl-6"
                        tooltip="Configure your architecture preferences and identity handshake."
                        tooltipTerm="PREFERENCES"
                    >
                        <Settings size={16} className="text-white/50" />
                        {t.dashboard.accountSettings}
                    </Button>
                    {(modules.store || isAdmin) && (
                        <Button
                            as={Link}
                            href={`/${language}/dashboard/billing`}
                            variant="glass"
                            className="justify-start pl-6"
                            tooltip="Manage your commerce matrices and payment protocols."
                            tooltipTerm="COMMERCE"
                        >
                            <CreditCard size={16} className="text-white/50" />
                            {t.dashboard.billingIdentity}
                        </Button>
                    )}
                    {(modules.auditVisibility || isAdmin) && (
                        <Button
                            as={Link}
                            href={`/${language}/dashboard/activity`}
                            variant="glass"
                            className="justify-start pl-6"
                            tooltip="Review the temporal audit trace of all systemic actions."
                            tooltipTerm="TELEMETRY"
                        >
                            <Clock size={16} className="text-white/50" />
                            {t.dashboard.activityLogs}
                        </Button>
                    )}
                    {(modules.workspaces || isAdmin) && (
                        <Button
                            as={Link}
                            href={`/${language}/dashboard/workspaces`}
                            variant="glass"
                            className="justify-start pl-6 border-[var(--accent)]/30 text-white/70"
                            tooltip="Initialize and govern distributed collaborative nodes."
                            tooltipTerm="NODES"
                        >
                            <LayoutGrid size={16} className="text-[var(--accent)]" />
                            {t.dashboard.manageWorkspaces}
                        </Button>
                    )}
                    {(modules.api || isAdmin) && (
                        <Button
                            as={Link}
                            href={`/${language}/dashboard/developer`}
                            variant="glass"
                            className="justify-start pl-6 border-[var(--accent)]/30 text-white/70"
                            tooltip="Configure programmatic bridge access and secure ciphers."
                            tooltipTerm="API_CONFIG"
                        >
                            <KeyRound size={16} className="text-[var(--accent)]" />
                            {t.dashboard.developerApi}
                        </Button>
                    )}
                </div>

                {isAdmin && (
                    <div className="pt-2 flex w-full animate-in fade-in">
                        <Button
                            as={Link}
                            href={`/${language}/admin`}
                            variant="glass"
                            className="w-full justify-start pl-6 border-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/50"
                            tooltip="Full-spectrum governance of the underlying administrative substrate."
                            tooltipTerm="ROOT_ADMIN"
                        >
                            <ShieldAlert size={16} />
                            {t.dashboard.rootAdmin}
                        </Button>
                    </div>
                )}

                <div className="pt-8 text-[8px] text-white/20 tracking-widest uppercase font-mono mt-8">
                    &gt; {t.dashboard.handshakeConfirmed}: {new Date().toISOString()}
                </div>
            </GlassCard>

            {/* Grid Backdrop */}
            <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

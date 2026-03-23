"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { SolidCard } from "@/components/ui/SolidCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Clock, ShieldCheck, Activity } from "lucide-react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { getUserAuditTraces } from "@/core/actions/nodes";
import { useFeatureFlags } from "@/core/hooks/useFeatureFlags";
import { ShieldAlert } from "lucide-react";

export default function ActivityLogsPage() {
    const { data: session } = useSession();
    const { language, t } = useTranslation();
    const { modules, loading: flagsLoading } = useFeatureFlags();
    const [traces, setTraces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    useEffect(() => {
        if (!flagsLoading && (modules.auditVisibility || isAdmin)) {
            getUserAuditTraces(100)
                .then(setTraces)
                .finally(() => setLoading(false));
        } else if (!flagsLoading) {
            setLoading(false);
        }
    }, [flagsLoading, modules.auditVisibility, isAdmin]);

    if (flagsLoading || loading) return null;

    if (!modules.auditVisibility && !isAdmin) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
                <ShieldAlert size={64} className="text-red-500 opacity-50" />
                <h1 className="text-2xl font-bold tracking-normal">Access Restricted</h1>
                <p className="text-white/50 text-sm max-w-sm text-center">
                    Citizen Audit Visibility has been deactivated by the system administrator.
                </p>
                <Button as={Link} href={`/${language}/dashboard`} variant="solid">
                    Return to Dashboard
                </Button>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen flex flex-col items-center p-6 text-white overflow-y-auto pt-24 pb-32">
            <div className="w-full max-w-2xl space-y-6">
                <Button as={Link} href={`/${language}/dashboard`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={14} className="mr-2" />
                    {t.dashboard.backToDashboard || "Back to Dashboard"}
                </Button>

                <SolidCard className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-normal flex items-center gap-3">
                                <Activity size={24} className="text-[var(--accent)]" />
                                Activity Logs
                            </h1>
                            <p className="text-sm font-semibold text-white/50">
                                Personal Audit Trace History
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    <div className="space-y-3">
                        {traces.length > 0 ? traces.map((trace) => (
                            <div key={trace.id} className="p-4 bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${trace.severity === 'WARN' ? 'bg-yellow-500/20 text-yellow-500' :
                                            trace.severity === 'ERROR' ? 'bg-red-500/20 text-red-500' :
                                                'bg-blue-500/20 text-blue-500'
                                            }`}>
                                            {trace.severity}
                                        </span>
                                        <span className="font-semibold text-sm text-white">{trace.action}</span>
                                    </div>
                                    <p className="text-xs text-white/50 font-mono mt-1">{trace.message}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/40 whitespace-nowrap">
                                    <Clock size={10} />
                                    {new Date(trace.timestamp).toLocaleString()}
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 text-center text-white/40 text-sm border border-dashed border-white/10">
                                No activity recorded yet.
                            </div>
                        )}
                    </div>
                </SolidCard>
            </div>

            {/* Grid Backdrop */}
            <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

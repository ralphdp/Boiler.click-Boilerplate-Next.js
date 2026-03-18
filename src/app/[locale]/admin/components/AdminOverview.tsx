"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Users, Activity, ShieldCheck, ArrowRight } from "lucide-react";
import { AdminPulse } from "./AdminPulse";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";

interface AdminOverviewProps {
    t: any;
    nodes: any[];
    traces: any[];
    commerceMode: string;
    haltingProtocol: boolean;
    preLaunchMode: boolean;
    sandboxMode: boolean;
    pricingTiers: any[];
    totalStoreProducts: number;
    telemetry?: any;
    setTab: (tab: any) => void;
}

export function AdminOverview({
    t,
    nodes,
    traces,
    commerceMode,
    haltingProtocol,
    preLaunchMode,
    sandboxMode,
    pricingTiers,
    totalStoreProducts,
    telemetry,
    setTab
}: AdminOverviewProps) {
    return (
        <motion.div
            key="overview-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <AdminPulse
                traces={traces}
                nodesCount={nodes.length}
                haltingProtocol={haltingProtocol}
                telemetry={telemetry}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={120} /></div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50 relative z-10">{t.admin.overview.totalNodes}</h3>
                    <div className="text-4xl font-mono text-[var(--accent)] font-bold relative z-10">{nodes.length}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest relative z-10">{t.admin.overview.activeCitizens}</div>
                </GlassCard>
                <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={120} /></div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50 relative z-10">{t.admin.overview.storeMode}</h3>
                    <div className="flex flex-col gap-2 relative z-10">
                        <div className="text-xl font-mono text-[var(--accent)] font-bold">{commerceMode ? commerceMode.toUpperCase() : t.admin.overview.syncing}</div>
                        <div className="flex flex-wrap gap-2">
                            {haltingProtocol && <span className="px-2 py-0.5 text-[9px] bg-red-500/20 text-red-500 border border-red-500/30 uppercase tracking-widest font-bold">{t.admin.overview.maintenance}</span>}
                            {preLaunchMode && <span className="px-2 py-0.5 text-[9px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 uppercase tracking-widest font-bold">{t.admin.overview.earlyAccess}</span>}
                            {sandboxMode && <span className="px-2 py-0.5 text-[9px] bg-blue-500/20 text-blue-500 border border-blue-500/30 uppercase tracking-widest font-bold">{t.admin.overview.sandbox}</span>}
                        </div>
                    </div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest relative z-10">{commerceMode === 'saas' ? `${pricingTiers.length} ${t.admin.overview.activeTiers}` : commerceMode === 'store' ? `${totalStoreProducts} ${t.admin.overview.activeProducts}` : t.admin.overview.currentPosture}</div>
                </GlassCard>
                <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldCheck size={120} /></div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50 relative z-10">{t.admin.overview.criticalActions}</h3>
                    <div className="text-4xl font-mono text-red-500 font-bold relative z-10">{traces.filter(t => t.severity === "CRIT").length}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest relative z-10">{t.admin.overview.criticalTraces}</div>
                </GlassCard>
            </div>
            <div className="bg-black/40 border border-white/5">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">{t.admin.overview.recentAudit}</h3>
                    <Button
                        variant="glass"
                        onClick={() => setTab("audit")}
                        className="text-[10px] text-[var(--accent)] hover:text-white transition-colors tracking-widest uppercase font-bold border-none bg-transparent hover:bg-white/5"
                        tooltip="Access the comprehensive audit vault for full telemetry history."
                        tooltipTerm="AUDIT_VAULT_ACCESS"
                    >
                        {t.admin.overview.viewAll}
                    </Button>
                </div>
                <div className="w-full overflow-x-auto admin-scrollbar">
                    <table className="w-full min-w-[800px] text-left border-collapse text-xs font-mono">
                        <thead>
                            <tr className="bg-white/5 text-white/50 sticky top-0 z-10 backdrop-blur-md">
                                <th className="p-4 font-normal tracking-widest uppercase">{t.admin.overview.colTime}</th>
                                <th className="p-4 font-normal tracking-widest uppercase">{t.admin.overview.colAction}</th>
                                <th className="p-4 font-normal tracking-widest uppercase">{t.admin.overview.colSeverity}</th>
                                <th className="p-4 font-normal tracking-widest uppercase">{t.admin.overview.colUser}</th>
                                <th className="p-4 font-normal tracking-widest uppercase">{t.admin.overview.colDetails}</th>
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
    );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface AdminAuditProps {
    t: any;
    traces: any[];
    loading: boolean;
}

export function AdminAudit({
    t,
    traces,
    loading
}: AdminAuditProps) {
    const [auditSearch, setAuditSearch] = useState("");
    const [auditFilter, setAuditFilter] = useState<"ALL" | "INFO" | "WARN" | "CRIT">("ALL");
    const [auditPage, setAuditPage] = useState(1);

    const filteredTraces = traces.filter(t =>
        (auditFilter === "ALL" || t.severity === auditFilter) &&
        (t.message.toLowerCase().includes(auditSearch.toLowerCase()) ||
            t.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
            t.action.toLowerCase().includes(auditSearch.toLowerCase()))
    );
    const paginatedTraces = filteredTraces.slice((auditPage - 1) * 50, auditPage * 50);
    const totalAuditPages = Math.ceil(filteredTraces.length / 50);

    const exportAuditCSV = () => {
        const header = ["ID", "Timestamp", "Action", "Severity", "Origin User", "Details"];
        const rows = filteredTraces.map(tr => [
            tr.id,
            new Date(tr.timestamp).toLocaleString(),
            tr.action,
            tr.severity,
            tr.user,
            tr.message
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div
            key="audit-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="bg-black/40 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent opacity-30" />

                <div className="p-4 md:p-6 border-b border-white/5 bg-white/5">
                    <div className="flex flex-col gap-1 shrink-0">
                        <h3 className="text-xs font-semibold tracking-normal] text-[var(--accent)] flex items-center gap-2">
                            Sovereign Audit Log
                        </h3>
                        <span className="text-[8px] font-mono text-white/30 tracking-normal]">Temporal Trace & Canon Audit Matrix</span>
                    </div>
                </div>

                <div className="p-4 md:p-6 border-b border-white/5 bg-black/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch lg:items-center gap-3 w-full lg:w-auto">
                        <div className="sm:w-48">
                            <Select
                                options={[
                                    { label: "All severities", value: "ALL" },
                                    { label: "Info - transmission", value: "INFO" },
                                    { label: "Warn - anomaly", value: "WARN" },
                                    { label: "Crit - breach", value: "CRIT" },
                                ]}
                                value={auditFilter}
                                onChange={(val) => { setAuditFilter(val as any); setAuditPage(1); }}
                                className="w-full"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 lg:w-96">
                            <div className="relative flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search traces or nodes..."
                                    value={auditSearch}
                                    onChange={(e) => { setAuditSearch(e.target.value); setAuditPage(1); }}
                                    icon={<Search size={14} />}
                                    className="h-[54px]"
                                />
                            </div>
                            <Button
                                onClick={exportAuditCSV}
                                className="shrink-0 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 h-[54px] text-xs font-semibold tracking-normal transition-colors text-white/70 hover:text-white"
                                tooltip="Export the current audit trace snapshot to a CSV local buffer."
                                tooltipTerm="AUDIT_EXPORT"
                            >
                                <Download size={14} /> <span>Export Traces</span>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="w-full max-h-[600px] overflow-y-auto overflow-x-auto admin-scrollbar">
                    <table className="w-full min-w-[800px] text-left border-collapse text-xs font-mono">
                        <thead>
                            <tr className="bg-white/5 text-white/50 sticky top-0 z-10 backdrop-blur-md">
                                <th className="p-4 font-normal tracking-normal">{t.admin.overview.colTime}</th>
                                <th className="p-4 font-normal tracking-normal">{t.admin.overview.colAction}</th>
                                <th className="p-4 font-normal tracking-normal">{t.admin.overview.colSeverity}</th>
                                <th className="p-4 font-normal tracking-normal">CANON</th>
                                <th className="p-4 font-normal tracking-normal">{t.admin.overview.colUser}</th>
                                <th className="p-4 font-normal tracking-normal">{t.admin.overview.colDetails}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 focus:outline-none">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-white/30 animate-pulse">{t.admin.audit.loading}</td></tr>
                            ) : paginatedTraces.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-white/30 truncate">{t.admin.audit.notFound}</td></tr>
                            ) : (
                                paginatedTraces.map((trace, i) => (
                                    <tr key={trace.id || i} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white/40 whitespace-nowrap">{new Date(trace.timestamp).toLocaleString()}</td>
                                        <td className="p-4 font-bold tracking-normal">{trace.action}</td>
                                        <td className="p-4">
                                            <div className={`text-[10px] px-3 py-1 min-w-[70px] uppercase tracking-widest font-black inline-block text-center ${trace.severity === 'FATAL' || trace.severity === 'ERROR' || trace.severity === 'CRIT' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : trace.severity === 'WARN' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                                {trace.severity}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className={`text-[10px] px-2 py-0.5 rounded-full border bg-white/5 uppercase tracking-tighter font-black ${trace.canon === 'RECURSION' ? 'border-purple-500/50 text-purple-400' : trace.canon === 'PARSIMONY' ? 'border-yellow-500/50 text-yellow-400' : 'border-blue-500/50 text-blue-400'}`}>
                                                {trace.canon || 'UNITY'}
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
                        <div>{t.admin.overview.showing} {(auditPage - 1) * 50 + 1}-{Math.min(auditPage * 50, filteredTraces.length)} {t.admin.overview.of} {filteredTraces.length}</div>
                        <div className="flex gap-2">
                            <button onClick={() => setAuditPage(p => Math.max(1, p - 1))} disabled={auditPage === 1} className="px-3 py-1 bg-black/50 border border-white/10 disabled:opacity-30 hover:bg-white/5 text-[10px] font-semibold tracking-normal text-white transition-colors">{t.admin.overview.prev}</button>
                            <button onClick={() => setAuditPage(p => Math.min(totalAuditPages, p + 1))} disabled={auditPage === totalAuditPages} className="px-3 py-1 bg-black/50 border border-white/10 disabled:opacity-30 hover:bg-white/5 text-[10px] font-semibold tracking-normal text-white transition-colors">{t.admin.overview.next}</button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

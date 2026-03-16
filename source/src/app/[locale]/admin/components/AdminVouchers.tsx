"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ShieldAlert,
    RefreshCw,
    Trash2,
    Plus,
    Download,
    Loader2,
    Search,
    Ticket,
    Calendar,
    ChevronDown,
    Activity
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CipherGate } from "@/components/ui/CipherGate";
import { useToast } from "@/components/ui/Toast";
import { getVouchers, createVoucher, revokeVoucher, exportVouchersCSV, VoucherType } from "@/core/actions/vouchers";

export function AdminVouchers({ t }: { t: any }) {
    const { toast } = useToast();
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");

    // Form state for minting
    const [isMinting, setIsMinting] = useState(false);
    const [type, setType] = useState<VoucherType>('PLAN_UNLOCK');
    const [planId, setPlanId] = useState("pro");
    const [duration, setDuration] = useState("12");
    const [value, setValue] = useState(0);
    const [maxRedemptions, setMaxRedemptions] = useState(1);
    const [expiryDate, setExpiryDate] = useState<string>("");
    const [limit, setLimit] = useState(1);

    // Secure Actions State
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        description: string;
        variant: 'danger' | 'warning' | 'info';
        action: () => void;
        requireCipher?: boolean;
    }>({ open: false, title: "", description: "", variant: "info", action: () => { } });

    const [cipherAction, setCipherAction] = useState<{ open: boolean, onConfirm: () => void } | null>(null);

    const closeConfirm = () => setConfirmModal(prev => ({ ...prev, open: false }));

    const loadVouchers = async () => {
        setLoading(true);
        try {
            const data = await getVouchers();
            setVouchers(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVouchers();
    }, []);

    const handleCreate = async (verified: boolean = false) => {
        if (!verified && limit > 10) {
            setConfirmModal({
                open: true,
                title: t.admin.vouchers.mintBulkTitle,
                description: t.admin.vouchers.mintBulkDesc,
                variant: "warning",
                requireCipher: true,
                action: () => handleCreate(true)
            });
            return;
        }

        setGenerating(true);
        try {
            await createVoucher(
                planId,
                parseInt(duration, 10),
                limit,
                type,
                value,
                maxRedemptions,
                expiryDate ? new Date(expiryDate).getTime() : undefined
            );
            await loadVouchers();
            setLimit(1);
            setIsMinting(false);
            toast({ title: t.admin.vouchers.mintedSuccess, description: t.admin.vouchers.mintedSuccessDesc, type: "success" });
        } catch (error) {
            toast({ title: t.admin.vouchers.mintFailed, type: "error" });
        } finally {
            setGenerating(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await exportVouchersCSV();
            if (res.success && res.csv) {
                const blob = new Blob([res.csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('href', url);
                a.setAttribute('download', `vouchers_audit_${Date.now()}.csv`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (error) {
            toast({ title: "Export Failed", type: "error" });
        } finally {
            setExporting(false);
        }
    };

    const handleRevoke = async (code: string) => {
        setConfirmModal({
            open: true,
            title: t.admin.vouchers.revokeTitle,
            description: t.admin.vouchers.revokeDesc,
            variant: "danger",
            action: async () => {
                try {
                    await revokeVoucher(code);
                    await loadVouchers();
                    toast({ title: t.admin.vouchers.codeSevered, type: "success" });
                } catch (error) { }
            }
        });
    };

    const filteredVouchers = vouchers.filter(v => {
        const matchesSearch = v.id.toLowerCase().includes(search.toLowerCase()) ||
            (v.planId || "").toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "ALL" || v.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Minting Controller */}
            <div className={`overflow-hidden transition-all duration-500 ease-vanguard ${isMinting ? 'max-h-[800px] mb-6' : 'max-h-0'}`}>
                <GlassCard className="border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] flex items-center gap-2">
                            Voucher Initialization Terminal
                        </h3>
                        <button onClick={() => setIsMinting(false)} className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                            Close Terminal
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="col-span-1">
                            <Select
                                label="AUTHORIZATION TYPE"
                                options={[
                                    { value: "PLAN_UNLOCK", label: "Plan Unlock" },
                                    { value: "PERCENTAGE", label: "Percentage %" },
                                    { value: "CREDIT", label: "Fixed Credit $" }
                                ]}
                                value={type}
                                onChange={(val) => setType(val as VoucherType)}
                            />
                        </div>
                        {type === 'PLAN_UNLOCK' ? (
                            <>
                                <div className="col-span-1">
                                    <Input
                                        label="TARGET PLAN ID"
                                        placeholder="pro"
                                        value={planId}
                                        onChange={(e) => setPlanId(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <Select
                                        label="TERM DURATION"
                                        options={[
                                            { value: "1", label: `1 MONTH` },
                                            { value: "12", label: `1 YEAR (12M)` },
                                            { value: "-1", label: "LIFETIME (INF)" }
                                        ]}
                                        value={duration}
                                        onChange={(val) => setDuration(val)}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="col-span-2">
                                <Input
                                    label="VALUE MAGNITUDE"
                                    type="number"
                                    value={value}
                                    onChange={(e) => setValue(parseFloat(e.target.value))}
                                />
                            </div>
                        )}
                        <div className="col-span-1">
                            <Input
                                label="INITIAL QUANTITY"
                                type="number"
                                min={1}
                                max={100}
                                value={limit}
                                onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                            />
                        </div>
                        <div className="col-span-1">
                            <Input
                                label="MAX REDEMPTIONS"
                                type="number"
                                value={maxRedemptions}
                                onChange={(e) => setMaxRedemptions(parseInt(e.target.value, 10))}
                            />
                        </div>
                        <div className="col-span-1">
                            <Input
                                label="EXPIRY TARGET"
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <button
                                onClick={() => handleCreate()}
                                disabled={generating}
                                className="w-full bg-[var(--accent)] border border-[var(--accent)]/50 text-[10px] font-black uppercase tracking-widest text-black h-[54px] hover:brightness-110 transition-all flex items-center justify-center gap-2"
                            >
                                {generating ? <Loader2 className="animate-spin" size={14} /> : <><Plus size={14} /> Initialize Vouchers</>}
                            </button>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Audit View */}
            <div className="bg-black/40 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent opacity-30" />

                <div className="p-4 md:p-6 border-b border-white/5 bg-white/5">
                    <div className="flex flex-col gap-1 shrink-0">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)] flex items-center gap-2">
                            Sovereign Voucher Vault
                        </h3>
                        <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.3em]">Authorization & Access Matrix Stewardship</span>
                    </div>
                </div>

                <div className="p-4 md:p-6 border-b border-white/5 bg-black/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch lg:items-center gap-3 w-full lg:w-auto">
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                            <button
                                onClick={() => setIsMinting(!isMinting)}
                                className="h-[54px] px-6 bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[var(--accent)]/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> Mint
                            </button>
                            <Select
                                options={[
                                    { label: "ALL TYPES", value: "ALL" },
                                    { label: "PLAN UNLOCK", value: "PLAN_UNLOCK" },
                                    { label: "PERCENTAGE", value: "PERCENTAGE" },
                                    { label: "CREDIT", value: "CREDIT" },
                                ]}
                                value={typeFilter}
                                onChange={(val) => setTypeFilter(val)}
                                className="w-full sm:w-36"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 lg:w-96">
                            <div className="relative flex-1">
                                <Input
                                    type="text"
                                    placeholder="SEARCH CODES..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    icon={<Search size={14} />}
                                    className="h-[54px]"
                                />
                            </div>
                            <button
                                onClick={handleExport}
                                disabled={exporting}
                                className="shrink-0 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 h-[54px] text-[10px] font-black uppercase tracking-widest transition-colors text-white/70 hover:text-white"
                            >
                                <Download size={14} className={exporting ? 'animate-pulse' : ''} /> <span>Export Audit</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full max-h-[600px] overflow-y-auto overflow-x-auto admin-scrollbar">
                    <table className="w-full min-w-[800px] text-left border-collapse text-xs font-mono">
                        <thead>
                            <tr className="bg-white/5 text-white/50 sticky top-0 z-10 backdrop-blur-md">
                                <th className="p-4 font-normal tracking-widest uppercase">Secret Cipher</th>
                                <th className="p-4 font-normal tracking-widest uppercase">Auth Type</th>
                                <th className="p-4 font-normal tracking-widest uppercase">Value / Plan</th>
                                <th className="p-4 font-normal tracking-widest uppercase">Redemptions</th>
                                <th className="p-4 font-normal tracking-widest uppercase">Health</th>
                                <th className="p-4 font-normal tracking-widest uppercase">Timestamp</th>
                                <th className="p-4 font-normal text-right tracking-widest uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && vouchers.length === 0 ? (
                                <tr><td colSpan={7} className="p-12 text-center text-white/20 animate-pulse uppercase tracking-[0.3em] font-black">Syncing Substrate...</td></tr>
                            ) : filteredVouchers.length === 0 ? (
                                <tr><td colSpan={7} className="p-12 text-center text-white/10 uppercase tracking-[0.3em] font-black h-[200px]">Vault Vacant</td></tr>
                            ) : filteredVouchers.map((v) => (
                                <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 font-bold text-[var(--accent)] tracking-widest">{v.id}</td>
                                    <td className="p-4 text-white/40">{v.type || 'PLAN_UNLOCK'}</td>
                                    <td className="p-4 font-black">
                                        {v.type === 'PERCENTAGE' ? `${v.value}%` :
                                            v.type === 'CREDIT' ? `$${v.value}` :
                                                (v.planId || 'DEFAULT').toUpperCase()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1 bg-white/5 relative overflow-hidden">
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-[var(--accent)] opacity-50 transition-all duration-1000"
                                                    style={{ width: `${v.maxRedemptions === -1 ? 100 : Math.min(100, (v.redemptionCount / v.maxRedemptions) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-white/50">{v.redemptionCount || 0} / {v.maxRedemptions === -1 ? '∞' : v.maxRedemptions}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-colors ${v.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            v.status === 'REDEEMED' || v.status === 'MAXED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white/30">{new Date(v.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        {v.status === 'ACTIVE' && (
                                            <button onClick={() => handleRevoke(v.id)} className="text-white/20 hover:text-red-500 p-2 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.open}
                title={confirmModal.title}
                description={confirmModal.description}
                variant={confirmModal.variant}
                onConfirm={() => {
                    if (confirmModal.requireCipher) {
                        setConfirmModal(prev => ({ ...prev, open: false }));
                        setCipherAction({ open: true, onConfirm: confirmModal.action });
                    } else {
                        confirmModal.action();
                        closeConfirm();
                    }
                }}
                onCancel={closeConfirm}
            />

            {cipherAction?.open && (
                <CipherGate
                    t={t}
                    onSuccess={() => {
                        cipherAction.onConfirm();
                        setCipherAction(null);
                    }}
                    onCancel={() => setCipherAction(null)}
                />
            )}
        </motion.div>
    );
}

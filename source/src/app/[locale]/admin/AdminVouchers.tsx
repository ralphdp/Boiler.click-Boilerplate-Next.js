"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ShieldAlert, RefreshCw, Trash2, Plus, Download, Loader2 } from "lucide-react";
import { getVouchers, createVoucher, revokeVoucher, exportVouchersCSV, VoucherType } from "@/core/actions/vouchers";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CipherGate } from "@/components/ui/CipherGate";
import { useToast } from "@/components/ui/Toast";

export function AdminVouchers({ t }: { t: any }) {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Form state
    const [type, setType] = useState<VoucherType>('PLAN_UNLOCK');
    const [planId, setPlanId] = useState("pro");
    const [duration, setDuration] = useState("12"); // months
    const [value, setValue] = useState(0);
    const [maxRedemptions, setMaxRedemptions] = useState(1);
    const [expiryDate, setExpiryDate] = useState<string>("");
    const [limit, setLimit] = useState(1);

    const { toast } = useToast();

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
            setLimit(1); // Reset
            toast({ title: t.admin.vouchers.mintedSuccess, description: t.admin.vouchers.mintedSuccessDesc, type: "success" });
        } catch (error) {
            console.error(error);
            toast({ title: t.admin.vouchers.mintFailed, description: t.admin.vouchers.mintFailedDesc, type: "error" });
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
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', `vouchers_audit_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error(error);
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
                    toast({ title: t.admin.vouchers.codeSevered, description: t.admin.vouchers.codeSeveredDesc, type: "success" });
                } catch (error) {
                    console.error(error);
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            <GlassCard className="border border-white/5 bg-black/40 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <h2 className="text-[var(--accent)] font-bold uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert size={16} /> {t.admin.vouchers.title}
                        </h2>
                        <p className="text-xs text-white/50 font-serif italic mt-1">
                            {t.admin.vouchers.desc}
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button onClick={handleExport} disabled={exporting} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-[var(--accent)]/10 border border-white/10 px-6 h-[54px] text-[10px] font-black uppercase tracking-widest transition-all text-white/70 hover:text-[var(--accent)]">
                            <Download size={14} className={exporting ? "animate-pulse" : ""} />
                            {t.admin.vouchers.exportAudit}
                        </button>
                        <button onClick={loadVouchers} disabled={loading} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 h-[54px] text-[10px] font-black uppercase tracking-widest transition-colors text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                            <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''}`} />
                            {t.admin.vouchers.refreshMatrix}
                        </button>
                    </div>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-8 p-6 bg-white/5 border border-white/10">
                    <div className="col-span-1">
                        <Select
                            label={t.admin.vouchers.vType}
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
                                    label={t.admin.vouchers.targetPlan}
                                    type="text"
                                    required
                                    value={planId}
                                    onChange={(e) => setPlanId(e.target.value)}
                                />
                            </div>
                            <div className="col-span-1">
                                <Select
                                    label={t.admin.vouchers.duration}
                                    options={[
                                        { value: "1", label: `1 ${t.admin.vouchers.month}` },
                                        { value: "12", label: `1 ${t.admin.vouchers.year} (12M)` },
                                        { value: "-1", label: t.admin.vouchers.lifetime }
                                    ]}
                                    value={duration}
                                    onChange={(val) => setDuration(val)}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="col-span-2">
                            <Input
                                label={t.admin.vouchers.vValue}
                                type="number"
                                required
                                value={value}
                                onChange={(e) => setValue(parseFloat(e.target.value))}
                            />
                        </div>
                    )}

                    <div className="col-span-1">
                        <Input
                            label={t.admin.vouchers.quantity}
                            type="number"
                            required
                            min={1}
                            max={100}
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                        />
                    </div>

                    <div className="col-span-1">
                        <Input
                            label={t.admin.vouchers.vMaxRedemptions}
                            type="number"
                            required
                            value={maxRedemptions}
                            onChange={(e) => setMaxRedemptions(parseInt(e.target.value, 10))}
                        />
                    </div>

                    <div className="col-span-1">
                        <Input
                            label={t.admin.vouchers.vExpiry}
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                        />
                    </div>

                    <div className="col-span-2 pb-1">
                        <Button type="button" onClick={() => handleCreate()} disabled={generating} className="w-full relative h-[52px]">
                            {generating ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                                <>
                                    <Plus size={14} /> {t.admin.vouchers.mintBtn}
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                <div className="bg-black/40 border border-white/5 mt-8">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] shrink-0">{t.admin.vouchers.mintedTitle}</h3>
                    </div>
                    <div className="w-full max-h-[600px] overflow-y-auto overflow-x-auto admin-scrollbar">
                        <table className="w-full min-w-[800px] text-left border-collapse text-xs font-mono">
                            <thead>
                                <tr className="bg-white/5 text-white/50 sticky top-0 z-10 backdrop-blur-md">
                                    <th className="p-4 font-normal tracking-widest uppercase">{t.admin.vouchers.colSecret}</th>
                                    <th className="p-4 font-normal tracking-widest uppercase">{t.admin.vouchers.colType}</th>
                                    <th className="p-4 font-normal tracking-widest uppercase">{t.admin.vouchers.colValue} / {t.admin.vouchers.colPlan}</th>
                                    <th className="p-4 font-normal tracking-widest uppercase">{t.admin.vouchers.colUsed}</th>
                                    <th className="p-4 font-normal tracking-widest uppercase">{t.admin.vouchers.colStatus}</th>
                                    <th className="p-4 font-normal tracking-widest uppercase">{t.admin.vouchers.colCreated}</th>
                                    <th className="p-4 font-normal text-right tracking-widest uppercase">{t.admin.users.colActions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading && vouchers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-white/30 animate-pulse uppercase tracking-widest">{t.admin.vouchers.loading}</td>
                                    </tr>
                                ) : vouchers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-white/30 uppercase tracking-widest">{t.admin.vouchers.notFound}</td>
                                    </tr>
                                ) : vouchers.map((v) => (
                                    <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-bold text-[var(--accent)]">{v.id}</td>
                                        <td className="p-4 opacity-50">{v.type || 'PLAN_UNLOCK'}</td>
                                        <td className="p-4 font-bold">
                                            {v.type === 'PERCENTAGE' ? `${v.value}%` :
                                                v.type === 'CREDIT' ? `$${v.value}` :
                                                    v.planId}
                                        </td>
                                        <td className="p-4">
                                            {v.redemptionCount || 0} / {v.maxRedemptions === -1 ? '∞' : v.maxRedemptions}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-widest ${v.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' :
                                                    v.status === 'REDEEMED' || v.status === 'MAXED' ? 'bg-blue-500/20 text-blue-500' :
                                                        v.status === 'EXPIRED' ? 'bg-yellow-500/20 text-yellow-500' :
                                                            'bg-red-500/20 text-red-500'
                                                }`}>
                                                {v.status === 'ACTIVE' ? t.admin.vouchers.vStatusActive :
                                                    v.status === 'REDEEMED' ? t.admin.vouchers.vStatusRedeemed :
                                                        v.status === 'MAXED' ? t.admin.vouchers.vStatusMaxed :
                                                            v.status === 'EXPIRED' ? t.admin.vouchers.vStatusExpired :
                                                                t.admin.vouchers.vStatusRevoked}
                                            </span>
                                        </td>
                                        <td className="p-4 text-white/50">{new Date(v.createdAt).toLocaleString()}</td>
                                        <td className="p-4 text-right">
                                            {v.status === 'ACTIVE' && (
                                                <button onClick={() => handleRevoke(v.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 transition-colors inline-flex items-center justify-center">
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
            </GlassCard>

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
        </div>
    );
}

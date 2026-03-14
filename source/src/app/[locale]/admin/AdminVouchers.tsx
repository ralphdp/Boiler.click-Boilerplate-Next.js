"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ShieldAlert, RefreshCw, Trash2, Plus, Users, Loader2, ChevronDown } from "lucide-react";
import { getVouchers, createVoucher, revokeVoucher } from "@/core/actions/vouchers";

export function AdminVouchers() {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Form state
    const [planId, setPlanId] = useState("pro");
    const [duration, setDuration] = useState("12"); // months
    const [limit, setLimit] = useState(1);

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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        try {
            await createVoucher(planId, parseInt(duration, 10), limit);
            await loadVouchers();
            setLimit(1); // Reset
        } catch (error) {
            console.error(error);
        } finally {
            setGenerating(false);
        }
    };

    const handleRevoke = async (code: string) => {
        if (!confirm(`Are you sure you want to revoke voucher ${code}?`)) return;
        try {
            await revokeVoucher(code);
            await loadVouchers();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <GlassCard className="border border-white/5 bg-black/40 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <h2 className="text-[var(--accent)] font-bold uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert size={16} /> Vanguard Hardware Licensing & Vouchers
                        </h2>
                        <p className="text-xs text-white/50 font-serif italic mt-1">
                            Mint offline licenses or subscription bypass codes for B2B distribution.
                        </p>
                    </div>
                    <Button variant="outline" className="text-xs px-3 py-1" onClick={loadVouchers} disabled={loading}>
                        <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Matrix
                    </Button>
                </div>

                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-8 p-4 bg-white/5 border border-white/10">
                    <div className="col-span-1">
                        <Input
                            label="Target Plan (ID)"
                            type="text"
                            required
                            value={planId}
                            onChange={(e) => setPlanId(e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <Select
                            label="Duration (Months)"
                            options={[
                                { value: "1", label: "1 Month" },
                                { value: "12", label: "1 Year (12M)" },
                                { value: "-1", label: "LIFETIME" }
                            ]}
                            value={duration}
                            onChange={(val) => setDuration(val)}
                        />
                    </div>
                    <div className="col-span-1">
                        <Input
                            label="Quantity"
                            type="number"
                            required
                            min={1}
                            max={100}
                            value={limit}
                            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                        />
                    </div>
                    <div className="col-span-1 pb-1">
                        <Button type="submit" disabled={generating} className="w-full relative h-[52px]">
                            {generating ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                                <>
                                    <Plus size={14} /> MINT VOUCHER(S)
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                <div className="bg-black/40 border border-white/5 mt-8">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] shrink-0">Minted Vouchers</h3>
                    </div>
                    <div className="w-full max-h-[600px] overflow-y-auto overflow-x-auto admin-scrollbar">
                        <table className="w-full min-w-[800px] text-left border-collapse text-xs font-mono">
                            <thead>
                                <tr className="bg-white/5 text-white/50 sticky top-0 z-10 backdrop-blur-md">
                                    <th className="p-4 font-normal tracking-widest uppercase">Secret Code</th>
                                    <th className="p-4 font-normal tracking-widest uppercase">Plan</th>
                                    <th className="p-4 font-normal tracking-widest uppercase">Duration</th>
                                    <th className="p-4 font-normal tracking-widest uppercase">Status</th>
                                    <th className="p-4 font-normal tracking-widest uppercase">Created At</th>
                                    <th className="p-4 font-normal text-right tracking-widest uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading && vouchers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-white/30 animate-pulse uppercase tracking-widest">Loading vouchers...</td>
                                    </tr>
                                ) : vouchers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-white/30 uppercase tracking-widest">No vouchers minted yet.</td>
                                    </tr>
                                ) : vouchers.map((v) => (
                                    <tr key={v.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-bold text-[var(--accent)]">{v.id}</td>
                                        <td className="p-4 font-bold">{v.planId}</td>
                                        <td className="p-4">{v.durationMonths === -1 ? <span className="text-yellow-500">LIFETIME</span> : `${v.durationMonths} MONTH(S)`}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-widest ${v.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' :
                                                v.status === 'REDEEMED' ? 'bg-blue-500/20 text-blue-500' :
                                                    'bg-red-500/20 text-red-500'
                                                }`}>
                                                {v.status}
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
        </div>
    );
}

"use client";

import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { ArrowLeft, CreditCard, ShieldAlert, Sparkles, CheckCircle } from "lucide-react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useEffect, useState } from "react";
import { createCheckoutSession, createBillingPortal, getWorkspaceBilling } from "@/core/actions/billing";
import { redeemVoucher } from "@/core/actions/vouchers";

// Note: In an actual SaaS, these price IDs would be dynamically pulled or hidden behind .env
const STRIPE_PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_1xxxxxxxxxxxxx";

export default function BillingPage() {
    const { data: session } = useSession();
    const { language } = useTranslation();
    const [billingData, setBillingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherLoading, setVoucherLoading] = useState(false);

    const activeWorkspace = (session?.user as any)?.activeWorkspace;

    useEffect(() => {
        if (activeWorkspace) {
            loadBilling();
        } else {
            setLoading(false);
        }
    }, [activeWorkspace]);

    const loadBilling = async () => {
        setLoading(true);
        const data = await getWorkspaceBilling(activeWorkspace);
        setBillingData(data);
        setLoading(false);
    };

    const handleUpgrade = async () => {
        setActionLoading(true);
        try {
            const res = await createCheckoutSession(activeWorkspace, STRIPE_PRO_PRICE_ID, language);
            if (res.url) window.location.href = res.url;
        } catch (e: any) {
            alert(e.message);
            setActionLoading(false); // Only set if failed, otherwise redirecting
        }
    };

    const handleManage = async () => {
        setActionLoading(true);
        try {
            const res = await createBillingPortal(activeWorkspace, language);
            if (res.url) window.location.href = res.url;
        } catch (e: any) {
            alert(e.message);
            setActionLoading(false);
        }
    };

    const handleRedeemVoucher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!voucherCode.trim()) return;
        setVoucherLoading(true);
        try {
            await redeemVoucher(activeWorkspace, voucherCode.trim().toUpperCase());
            alert("Hardware License / Voucher Redeemed Successfully. Your context has been upgraded.");
            setVoucherCode("");
            await loadBilling();
        } catch (e: any) {
            alert(`Voucher Redemption Failed: ${e.message}`);
        } finally {
            setVoucherLoading(false);
        }
    };

    if (!activeWorkspace) {
        return (
            <main className="relative min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden">
                <GlassCard className="w-full max-w-2xl text-center space-y-6">
                    <ShieldAlert size={48} className="mx-auto text-red-500/50" />
                    <h1 className="text-xl font-black uppercase tracking-widest text-[var(--accent)]">No Active Context</h1>
                    <p className="text-xs uppercase font-mono tracking-widest text-white/50">You must execute `Enter Context` on a Workspace before manipulating billing matrices.</p>
                    <Button as={Link} href={`/${language}/dashboard/workspaces`} variant="glass-accent">
                        RETURN TO WORKSPACES
                    </Button>
                </GlassCard>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            <div className="w-full max-w-4xl mb-6">
                <Button as={Link} href={`/${language}/dashboard`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={14} className="mr-2" />
                    Back to Terminal
                </Button>
            </div>

            <GlassCard className="w-full max-w-4xl space-y-8">
                <div className="space-y-2 text-left">
                    <h1 className="text-2xl font-black uppercase tracking-widest text-[var(--accent)] flex items-center gap-3">
                        <CreditCard size={24} />
                        WORKSPACE BILLING MATRIX
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
                        Context: {activeWorkspace}
                    </p>
                </div>

                <div className="w-full h-px bg-white/5" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left side: Subscription Status */}
                    <div className="space-y-6">
                        <h2 className="text-[10px] font-bold tracking-widest uppercase text-white/70">Current Infrastructure</h2>

                        {loading ? (
                            <p className="text-white/30 text-xs font-mono uppercase tracking-widest animate-pulse">Scanning matrix...</p>
                        ) : (
                            <div className="p-6 bg-black/50 border border-white/10 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                                {billingData?.billingStatus === 'active' && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E676]/10 blur-[50px] pointer-events-none rounded-full" />
                                )}
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-xl mb-1 flex items-center gap-2">
                                        {billingData?.billingStatus === 'active' ? 'VANGUARD SECURE' : 'FREE TIER'}
                                    </h3>
                                    <p className="text-[10px] uppercase font-mono text-white/50">
                                        Status: <span className={billingData?.billingStatus === 'active' ? 'text-[#00E676]' : 'text-white/70'}>{billingData?.billingStatus || "none"}</span>
                                    </p>
                                </div>

                                {billingData?.billingStatus === 'active' ? (
                                    <Button variant="outline" onClick={handleManage} disabled={actionLoading} className="w-full mt-6 text-xs border-white/20">
                                        Open Stellar Portal
                                    </Button>
                                ) : (
                                    <p className="text-[9px] uppercase tracking-widest text-white/30 mt-6 font-bold leading-relaxed">
                                        Your workspace is currently operating on unhardened infrastructure, limiting your execution rate and storage capacity.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right side: Upgrade Option */}
                    <div className="space-y-6">
                        <h2 className="text-[10px] font-bold tracking-widest uppercase text-white/70">Upgrade Path</h2>

                        <div className="p-6 bg-[var(--accent)]/5 border border-[var(--accent)]/20 relative flex flex-col justify-between min-h-[160px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 blur-[50px] pointer-events-none rounded-full" />
                            <div>
                                <h3 className="font-black uppercase tracking-widest text-xl text-[var(--accent)] flex items-center gap-2 mb-4">
                                    <Sparkles size={18} /> OMNI VANGUARD
                                </h3>
                                <ul className="space-y-2 text-xs uppercase tracking-widest font-mono text-white/70 mb-6">
                                    <li className="flex items-center gap-2"><CheckCircle size={10} className="text-[#00E676]" /> 1,000,000 Edge Computations</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={10} className="text-[#00E676]" /> 50GB Master Storage</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={10} className="text-[#00E676]" /> Real-time Outbound Webhooks</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={10} className="text-[#00E676]" /> Priority Logic Matrix</li>
                                </ul>
                            </div>

                            <Button variant="glass-accent" onClick={handleUpgrade} disabled={actionLoading || billingData?.billingStatus === 'active'} className="w-full py-6 font-bold uppercase tracking-[0.2em]">
                                {billingData?.billingStatus === 'active' ? 'ACTIVE' : 'INITIALIZE PROTOCOL ($199/MO)'}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                <div className="space-y-4">
                    <h2 className="text-[10px] font-bold tracking-widest uppercase text-white/70">Hardware Licensing</h2>
                    <form onSubmit={handleRedeemVoucher} className="flex flex-col sm:flex-row gap-4 max-w-xl items-center">
                        <div className="flex-1 w-full">
                            <Input
                                type="text"
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value)}
                                placeholder="VGRD-XXXX-XXXX"
                                className="tracking-[0.2em] font-mono text-white h-[52px]"
                            />
                        </div>
                        <Button type="submit" variant="glass" disabled={voucherLoading || !voucherCode.trim()} className="whitespace-nowrap cursor-pointer h-[52px]">
                            {voucherLoading ? "VERIFYING CRYPTOGRAPHY..." : "REDEEM VOUCHER"}
                        </Button>
                    </form>
                    <p className="text-[9px] uppercase tracking-widest text-white/30 text-left font-serif italic">
                        Input a 12-character cryptographic license key to bypass the Stripe Matrix.
                    </p>
                </div>
            </GlassCard>

            <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

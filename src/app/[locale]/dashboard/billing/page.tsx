"use client";

import { useSession } from "next-auth/react";
import { SolidCard } from "@/components/ui/SolidCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { ArrowLeft, CreditCard, ShieldAlert, Sparkles, CheckCircle } from "lucide-react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useEffect, useState } from "react";
import { createCheckoutSession, createBillingPortal, getWorkspaceBilling } from "@/core/actions/billing";
import { redeemVoucher } from "@/core/actions/vouchers";
import { useToast } from "@/components/ui/Toast";

// Note: In an actual SaaS, these price IDs would be dynamically pulled or hidden behind .env
const STRIPE_PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_1xxxxxxxxxxxxx";

export default function BillingPage() {
    const { data: session } = useSession();
    const { language, t } = useTranslation();
    const [billingData, setBillingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
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
            toast({ title: "Checkout Fault", description: e.message, type: "error" });
            setActionLoading(false); // Only set if failed, otherwise redirecting
        }
    };

    const handleManage = async () => {
        setActionLoading(true);
        try {
            const res = await createBillingPortal(activeWorkspace, language);
            if (res.url) window.location.href = res.url;
        } catch (e: any) {
            toast({ title: "Portal Fault", description: e.message, type: "error" });
            setActionLoading(false);
        }
    };

    const handleRedeemVoucher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!voucherCode.trim()) return;
        setVoucherLoading(true);
        try {
            await redeemVoucher(activeWorkspace, voucherCode.trim().toUpperCase());
            toast({ title: "License Authenticated", description: "Hardware License / Voucher Redeemed Successfully. Your context has been upgraded.", type: "success" });
            setVoucherCode("");
            await loadBilling();
        } catch (e: any) {
            toast({ title: "Redemption Fault", description: `Voucher Redemption Failed: ${e.message}`, type: "error" });
        } finally {
            setVoucherLoading(false);
        }
    };

    if (!activeWorkspace) {
        return (
            <main className="relative min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden">
                <SolidCard className="w-full max-w-2xl text-center space-y-6">
                    <ShieldAlert size={48} className="mx-auto text-red-500/50" />
                    <h1 className="text-xl font-bold tracking-normal text-[var(--accent)]">{t.billing.noContext}</h1>
                    <p className="text-sm text-white/50">{t.billing.noContextDesc}</p>
                    <Button as={Link} href={`/${language}/dashboard/workspaces`} variant="solid-accent">
                        {t.billing.returnToWorkspaces}
                    </Button>
                </SolidCard>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            <div className="w-full max-w-4xl mb-6">
                <Button as={Link} href={`/${language}/dashboard`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={14} className="mr-2" />
                    {t.settings.backToTerminal}
                </Button>
            </div>

            <SolidCard className="w-full max-w-4xl space-y-8">
                <div className="space-y-2 text-left">
                    <h1 className="text-2xl font-bold tracking-normal text-white flex items-center gap-3">
                        <CreditCard size={24} className="text-[var(--accent)]" />
                        {t.billing.title}
                    </h1>
                    <p className="text-sm text-white/50">
                        {t.billing.context} {activeWorkspace}
                    </p>
                </div>

                <div className="w-full h-px bg-white/5" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left side: Subscription Status */}
                    <div className="space-y-6 text-left">
                        <h2 className="text-xs font-semibold text-white/70 mb-4">{t.billing.currentInfra}</h2>

                        {loading ? (
                            <p className="text-white/50 text-sm animate-pulse">{t.billing.scanning}</p>
                        ) : (
                            <div className="p-6 bg-[#0a0a0a] border border-white/10 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                                <div>
                                    <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                                        {billingData?.billingStatus === 'active' ? t.billing.vanguardSecure : t.billing.freeTier}
                                    </h3>
                                    <p className="text-xs font-mono text-white/50">
                                        {t.billing.status} <span className={billingData?.billingStatus === 'active' ? 'text-[#00E676]' : 'text-white/70'}>{billingData?.billingStatus || t.billing.noneStatus}</span>
                                    </p>
                                </div>

                                {billingData?.billingStatus === 'active' ? (
                                    <Button variant="outline" onClick={handleManage} disabled={actionLoading} className="w-full mt-6 text-sm border-white/20">
                                        {t.billing.openPortal}
                                    </Button>
                                ) : (
                                    <p className="text-xs text-white/50 mt-6 leading-relaxed">
                                        {t.billing.unhardenedWarning}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right side: Upgrade Option */}
                    <div className="space-y-6 text-left">
                        <h2 className="text-xs font-semibold text-white/70 mb-4">{t.billing.upgradePath}</h2>

                        <div className="p-6 bg-[#0a0a0a] border border-[var(--accent)]/30 relative flex flex-col justify-between min-h-[160px]">
                            <div>
                                <h3 className="font-bold text-xl text-[var(--accent)] flex items-center gap-2 mb-4">
                                    <Sparkles size={18} /> {t.billing.omniVanguard}
                                </h3>
                                <ul className="space-y-2 text-sm text-white/70 mb-6">
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#00E676]" /> {t.billing.edgeComputations}</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#00E676]" /> {t.billing.masterStorage}</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#00E676]" /> {t.billing.outboundWebhooks}</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#00E676]" /> {t.billing.priorityLogic}</li>
                                </ul>
                            </div>

                            <Button variant="solid-accent" onClick={handleUpgrade} disabled={actionLoading || billingData?.billingStatus === 'active'} className="w-full py-6 font-bold">
                                {billingData?.billingStatus === 'active' ? t.billing.activeStatus : t.billing.initializeProtocol}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                <div className="space-y-4 text-left">
                    <h2 className="text-xs font-semibold text-white/70 mb-4">{t.billing.hardwareLicensing}</h2>
                    <form onSubmit={handleRedeemVoucher} className="flex flex-col sm:flex-row gap-4 max-w-xl items-center">
                        <div className="flex-1 w-full">
                            <Input
                                type="text"
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value)}
                                placeholder={t.billing.voucherPlaceholder}
                                className="font-mono text-white h-[52px]"
                            />
                        </div>
                        <Button type="submit" variant="solid" disabled={voucherLoading || !voucherCode.trim()} className="whitespace-nowrap cursor-pointer h-[52px]">
                            {voucherLoading ? t.billing.verifyingCrypto : t.billing.redeemVoucher}
                        </Button>
                    </form>
                    <p className="text-xs text-white/40 text-left mt-2 italic">
                        {t.billing.voucherHint}
                    </p>
                </div>
            </SolidCard>

            <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

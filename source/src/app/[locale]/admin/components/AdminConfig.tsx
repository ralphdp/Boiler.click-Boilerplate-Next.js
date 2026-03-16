"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Activity } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setPreLaunchMode as setPreLaunchModeAction, setHaltingProtocol as setHaltingProtocolAction, setMFAEnforced as setMFAEnforcedAction, setRateLimitMode, setResendFrom, setSandboxMode as setSandboxModeAction, setDomainShield as setDomainShieldAction, setTelemetryKeys } from "@/core/actions/admin";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CipherGate } from "@/components/ui/CipherGate";

interface AdminConfigProps {
    t: any;
    preLaunchMode: boolean;
    setPreLaunchMode: (val: boolean) => void;
    haltingProtocol: boolean;
    setHaltingProtocol: (val: boolean) => void;
    mfaEnforced: boolean;
    setMFAEnforced: (val: boolean) => void;
    rateLimitMode: string;
    setRateLimitModeUI: (val: string) => void;
    resendFrom: string;
    setResendFromUI: (val: string) => void;
    sandboxMode: boolean;
    setSandboxMode: (val: boolean) => void;
    domainShield: boolean;
    setDomainShieldUI: (val: boolean) => void;
}

export function AdminConfig({
    t,
    preLaunchMode,
    setPreLaunchMode,
    haltingProtocol,
    setHaltingProtocol,
    mfaEnforced,
    setMFAEnforced,
    rateLimitMode,
    setRateLimitModeUI,
    resendFrom,
    setResendFromUI,
    sandboxMode,
    setSandboxMode,
    domainShield,
    setDomainShieldUI,
}: AdminConfigProps) {
    const { toast } = useToast();
    const router = useRouter();

    const [showHaltModal, setShowHaltModal] = useState(false);
    const [showCipherGate, setShowCipherGate] = useState(false);

    const handleHaltToggle = async (verified: boolean = false) => {
        const newState = !haltingProtocol;

        if (!verified && newState) {
            setShowHaltModal(true);
            return;
        }

        setHaltingProtocol(newState);
        await setHaltingProtocolAction(newState);
        router.refresh();
        setShowCipherGate(false);
        if (newState) {
            toast({ title: "SYSTEM HALTED", description: "Kernel execution restricted to administrators.", type: "success" });
        }
    };

    return (
        <motion.div
            key="config-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{t.admin.config.earlyAccess}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.config.earlyAccessDesc}</p>
                </div>
                <div className="flex w-full justify-start">
                    <button
                        onClick={async () => {
                            const newState = !preLaunchMode;
                            setPreLaunchMode(newState);
                            await setPreLaunchModeAction(newState);
                            router.refresh();
                        }}
                        className={`w-12 h-6 rounded-full relative transition-colors border shrink-0 ${preLaunchMode ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white/10 border-white/20'}`}
                        aria-pressed={preLaunchMode}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preLaunchMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </GlassCard>

            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{t.admin.config.maintenance}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.config.maintenanceDesc}</p>
                </div>
                <div className="flex w-full justify-start">
                    <button
                        onClick={() => handleHaltToggle()}
                        className={`w-12 h-6 rounded-full relative transition-colors border shrink-0 ${haltingProtocol ? 'bg-red-500 border-red-500' : 'bg-white/10 border-white/20'}`}
                        aria-pressed={haltingProtocol}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${haltingProtocol ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </GlassCard>

            <ConfirmationModal
                isOpen={showHaltModal}
                title="ACTIVATE HALTING PROTOCOL?"
                description="This will instantly sever access for all non-administrative nodes. The system will enter a read-only state for standard users."
                onConfirm={() => {
                    setShowHaltModal(false);
                    setShowCipherGate(true);
                }}
                onCancel={() => setShowHaltModal(false)}
                variant="danger"
            />

            {showCipherGate && (
                <CipherGate
                    t={t}
                    onSuccess={() => handleHaltToggle(true)}
                    onCancel={() => setShowCipherGate(false)}
                />
            )}

            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 relative">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{t.admin.config.mfa}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.config.mfaDesc}</p>
                </div>
                <div className="flex w-full justify-start">
                    <button
                        onClick={async () => {
                            const newState = !mfaEnforced;
                            setMFAEnforced(newState);
                            await setMFAEnforcedAction(newState);
                            router.refresh();
                        }}
                        className={`w-12 h-6 rounded-full relative transition-colors border shrink-0 ${mfaEnforced ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white/10 border-white/20'}`}
                        aria-pressed={mfaEnforced}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${mfaEnforced ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </GlassCard>

            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{t.admin.overview.sandbox}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.config.sandboxDesc}</p>
                </div>
                <div className="flex w-full justify-start">
                    <button
                        onClick={async () => {
                            const newState = !sandboxMode;
                            setSandboxMode(newState);
                            await setSandboxModeAction(newState);
                            router.refresh();
                        }}
                        className={`w-12 h-6 rounded-full relative transition-colors border shrink-0 ${sandboxMode ? 'bg-blue-500 border-blue-500' : 'bg-white/10 border-white/20'}`}
                        aria-pressed={sandboxMode}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${sandboxMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </GlassCard>

            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{t.admin.config.domainShield}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.config.domainShieldDesc}</p>
                </div>
                <div className="flex w-full justify-start">
                    <button
                        onClick={async () => {
                            const newState = !domainShield;
                            setDomainShieldUI(newState);
                            await setDomainShieldAction(newState);
                            router.refresh();
                        }}
                        className={`w-12 h-6 rounded-full relative transition-colors border shrink-0 ${domainShield ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white/10 border-white/20'}`}
                        aria-pressed={domainShield}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${domainShield ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </GlassCard>

            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{t.admin.config.rateLimit}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.config.rateLimitDesc}</p>
                </div>
                <div className="flex flex-wrap w-full justify-start gap-4">
                    {['relaxed', 'standard', 'strict', 'lockdown'].map((variant) => (
                        <button
                            key={variant}
                            onClick={async () => {
                                const res = await setRateLimitMode(variant);
                                if (res.success) {
                                    setRateLimitModeUI(variant);
                                    router.refresh();
                                }
                            }}
                            className={`border text-xs px-6 py-2 outline-none min-w-[100px] uppercase tracking-widest font-bold transition-colors shadow-2xl ${rateLimitMode === variant ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black/50 border-white/10 text-white/80 hover:bg-white/5 focus:border-[var(--accent)]'}`}
                        >
                            {variant}
                        </button>
                    ))}
                </div>
                <div className="text-xs text-white/70 bg-black/50 p-4 border border-white/5 font-mono mt-2">
                    {rateLimitMode === 'relaxed' && t.admin.config.rlRelaxed}
                    {rateLimitMode === 'standard' && t.admin.config.rlStandard}
                    {rateLimitMode === 'strict' && t.admin.config.rlStrict}
                    {rateLimitMode === 'lockdown' && t.admin.config.rlLockdown}
                </div>
            </GlassCard>

            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{t.admin.config.senderEmail}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.config.senderEmailDesc}</p>
                </div>
                <div className="flex flex-col gap-3 w-full justify-start">
                    <Input
                        type="text"
                        placeholder={t.admin.config.senderEmailPlace || "NOREPLY@DOMAIN.COM"}
                        value={resendFrom}
                        onChange={(e) => setResendFromUI(e.target.value)}
                    />
                    <button
                        onClick={async () => {
                            const res = await setResendFrom(resendFrom);
                            if (res.success) {
                                toast({ title: t.admin.config.saveSuccess, description: t.admin.config.saveSuccessDesc, type: "success" });
                                router.refresh();
                            }
                        }}
                        className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)]/40 hover:text-white"
                    >
                        {t.admin.config.saveEmail}
                    </button>
                </div>
            </GlassCard>

            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">Sovereign Telemetry Gates</h3>
                    <p className="text-xs font-serif italic text-white/50">Configure external behavioral monitoring identifiers. Changes propagate to all nodes on next mount.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">GA4 Measurement ID</label>
                        <Input
                            type="text"
                            placeholder="G-XXXXXXXXXX"
                            defaultValue={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
                            onBlur={async (e) => {
                                if (e.target.value) {
                                    await setTelemetryKeys({ gaId: e.target.value });
                                    toast({ title: "GA4 Bridge Synchronized", description: "Telemetry identifier updated.", type: "success" });
                                }
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">GA4 Property ID</label>
                        <Input
                            type="text"
                            placeholder="528435699"
                            defaultValue={process.env.GA_PROPERTY_ID}
                            onBlur={async (e) => {
                                if (e.target.value) {
                                    await setTelemetryKeys({ gaPropertyId: e.target.value });
                                    toast({ title: "GA4 Property Hardened", description: "Reporting bridge updated.", type: "success" });
                                }
                            }}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30">PostHog API Key</label>
                        <Input
                            type="text"
                            placeholder="PHC_XXXXXXXXXX"
                            onBlur={async (e) => {
                                if (e.target.value) {
                                    await setTelemetryKeys({ posthogId: e.target.value });
                                    toast({ title: "PostHog Matrix Initialized", description: "Behavioral pulse key updated.", type: "success" });
                                }
                            }}
                        />
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 blur-[50px] pointer-events-none rounded-full" />
                <div className="space-y-2 text-left z-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
                        <Activity size={16} /> {t.admin.config.edgeFlags}
                    </h3>
                    <p className="text-xs font-serif italic text-white/50 leading-relaxed">
                        {t.admin.config.edgeFlagsDesc1}<br /><br />
                        <strong>1. {t.admin.config.edgeFlagsDesc2}</strong> {t.admin.config.edgeFlagsDesc3}<br />
                        <strong>2. {t.admin.config.edgeFlagsDesc4}</strong> {t.admin.config.edgeFlagsDesc5}
                    </p>
                </div>
                <div className="z-10 mt-2 p-3 bg-black/50 border border-white/10 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 shadow-inner">
                    {t.admin.config.edgeFlagsDesc6}
                </div>
            </GlassCard>
        </motion.div >
    );
}

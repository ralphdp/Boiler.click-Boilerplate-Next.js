"use client";

import { useSession } from "next-auth/react";
import { SolidCard } from "@/components/ui/SolidCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { ArrowLeft, Save, LogOut, Upload, KeyRound, ShieldAlert, Smartphone, Loader2, X, ServerCrash } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { auth, storage } from "@/core/firebase/client";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInWithEmailAndPassword } from "firebase/auth";
import QRCode from "react-qr-code";
import { sendCustomPasswordResetEmail, generateSovereignCustomToken, revokeAllSessions } from "@/core/actions/auth";
import { generateMFASecret, verifyAndEnableMFA, disableMFA } from "@/core/actions/mfa";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveSessions, revokeSession } from "@/core/actions/auth";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CipherGate } from "@/components/ui/CipherGate";

function SessionList({ sessions, loading, onRevoke }: { sessions: any[], loading: boolean, onRevoke: (id: string) => any }) {
    if (loading) return <div className="text-sm text-white/50 animate-pulse">Scanning active nodes...</div>;
    if (sessions.length === 0) return <div className="text-sm text-white/50">No sibling sessions detected.</div>;

    return (
        <div className="space-y-2 text-left">
            {sessions.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-white/5 group hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                            <Smartphone size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">
                                {s.userAgent.includes("Macintosh") || s.userAgent.includes("Mac OS X") ? "Apple Silicon Node" :
                                    s.userAgent.includes("iPhone") || s.userAgent.includes("iPad") ? "iOS Mobile Node" :
                                        s.userAgent.includes("Windows") ? "Win64 Matrix" :
                                            s.userAgent.includes("Linux") ? "Linux Kernel Node" :
                                                "Unknown Substrate"}
                            </span>
                            <span className="text-xs text-white/50">
                                {new Date(s.lastSeen).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => onRevoke(s.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-md"
                    >
                        Revoke
                    </button>
                </div>
            ))}
        </div>
    );
}

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const { language, t } = useTranslation();
    const [name, setName] = useState(session?.user?.name || "");
    const [loading, setLoading] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);

    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session?.user?.name]);

    const [activeModal, setActiveModal] = useState<"TOTP" | "SMS" | null>(null);
    const [mfaStep, setMfaStep] = useState<"INIT" | "SCAN_QR" | "DONE">("INIT");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [totpSecret, setTotpSecret] = useState<any>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationId, setVerificationId] = useState("");
    const [reAuthPassword, setReAuthPassword] = useState("");
    const [mfaError, setMfaError] = useState("");
    const [sessions, setSessions] = useState<any[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const refreshSessions = async () => {
        setSessionsLoading(true);
        const s = await getActiveSessions();
        setSessions(s);
        setSessionsLoading(false);
    };

    useEffect(() => {
        refreshSessions();
    }, []);

    const handleRevokeSingle = async (id: string) => {
        setConfirmModal({
            open: true,
            title: "De-authorize Identity Node",
            description: "Are you sure you want to de-authorize this specific identity node? This will immediately sever terminal access for that session.",
            variant: "danger",
            requireCipher: true,
            action: async () => {
                const res = await revokeSession(id);
                if (res.success) {
                    setSessions(prev => prev.filter(s => s.id !== id));
                    toast({ title: "Node De-authorized", description: "Identity session successfully severed.", type: "success" });
                } else {
                    toast({ title: "Revocation Fault", description: "Could not sever remote session.", type: "error" });
                }
            }
        });
    };

    const isOAuth = (session?.user as any)?.provider && (session?.user as any)?.provider !== "credentials";

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Note: For the Omnibus Boilerplate, actual mutation would be handled by a strict Server Action hitting the OmniAdapter.
        // For now, we update the client session natively.
        await update({ name });
        setLoading(false);
    };

    const handlePasswordReset = async () => {
        if (!session?.user?.email) return;
        try {
            await sendCustomPasswordResetEmail(session.user.email, language);
            toast({ title: "Pulse Sent", description: "Check your email for a secure password reset link.", type: "success" });
        } catch (e: any) {
            console.error("Reset Failed:", e);
            toast({ title: "Pulse Fault", description: "MFA Matrix Failure. Ensure Resend API is configured.", type: "error" });
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !session?.user?.id) return;

        setAvatarUploading(true);
        try {
            const fileRef = storageRef(storage, `avatars/${session.user.id}_${Date.now()}`);
            await uploadBytes(fileRef, file);
            const downloadUrl = await getDownloadURL(fileRef);

            // Push the new image globally to NextAuth state
            await update({ image: downloadUrl });
            toast({ title: "Gravatar Uplinked", description: "Identity image successfully synchronized with the Firebase matrix.", type: "success" });
        } catch (e) {
            console.error("Upload Matrix Fault:", e);
            toast({ title: "Uplink Fault", description: "Storage access denied. Verify Firebase permissions.", type: "error" });
        } finally {
            setAvatarUploading(false);
        }
    };

    const initiateMfaEnrollment = async () => {
        setLoading(true);
        setMfaError("");
        try {
            if (activeModal === "TOTP") {
                const { qrCodeUrl, secret } = await generateMFASecret();
                setQrCodeUrl(qrCodeUrl);
                setMfaStep("SCAN_QR");
            } else {
                setMfaError("SMS Matrix Binding is currently deprecated. Recommend TOTP.");
            }
        } catch (e: any) {
            console.error("MFA Generation Failed:", e);
            setMfaError(e.message || "Failed to generate cryptographic matrix.");
        } finally {
            setLoading(false);
        }
    }

    const verifyAndEnrollTotp = async () => {
        setLoading(true);
        setMfaError("");
        try {
            if (activeModal === "TOTP") {
                const res = await verifyAndEnableMFA(verificationCode);
                if (res.success) {
                    setMfaStep("DONE");
                    await update({ mfaEnabled: true });
                } else {
                    setMfaError(res.error || "Cryptographic Verification Failed");
                }
            } else {
                setMfaError("SMS Relay not supported.");
            }
        } catch (e: any) {
            console.error("MFA Enrollment Failed:", e);
            setMfaError(e.message || "Execution Failed.");
        } finally {
            setLoading(false);
        }
    };

    // Dynamic Alignment Jitter Subsystem
    const [alignment, setAlignment] = useState(98.6);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setAlignment(prev => {
                const jitter = (Math.random() * 0.2) - 0.1;
                const next = prev + jitter;
                return Math.min(99.9, Math.max(98.4, next));
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const isMfaActive = isOAuth || (session?.user as any)?.mfaEnabled;

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            <div className="w-full max-w-xl mb-6">
                <Button as={Link} href={`/${language}/dashboard`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={14} />
                    {t.settings.backToTerminal}
                </Button>
            </div>

            <SolidCard className="w-full max-w-xl space-y-8">
                <div className="space-y-2 text-left">
                    <h1 className="text-2xl font-bold tracking-normal text-white">{t.settings.title}</h1>
                    <p className="text-sm text-white/50">
                        {t.settings.subtitle}
                    </p>
                </div>

                <div className="w-full h-px bg-white/5" />

                {/* STRUCTURAL CLEARANCE SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-[#0a0a0a] p-4 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-white/50">{t.settings.clearanceLevel}</span>
                            <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 border border-[var(--accent)]/20 rounded-sm">
                                {session?.user?.role || "USER"}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs text-white/50">
                                <span>{t.settings.logosAlignment}</span>
                                <span className="text-white">{alignment.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${alignment}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-[var(--accent)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] p-4 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-white/50">{t.settings.terminalAccess}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-sm transition-colors duration-200 ${isMfaActive ? "text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20" : "text-white/70 bg-white/10 border-white/20"}`}>
                                {isMfaActive ? "IDENTITY HARDENED" : "IDENTITY VERIFIED"}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => {
                                // OAuth accounts (Google/Github) are considered hardened at the service level.
                                const isFull = i <= 2 || isMfaActive || isOAuth;
                                return (
                                    <div
                                        key={i}
                                        className={`flex-1 h-1 bg-[var(--accent)] transition-all duration-1000 ${mounted && isFull ? 'opacity-100' : 'opacity-10'}`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-white/5" />

                <form onSubmit={handleSave} className="space-y-6 text-left">
                    <div className="space-y-4">
                        {/* AVATAR SUBSYSTEM */}
                        <div className="flex items-center gap-6 pb-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <div
                                onClick={() => !avatarUploading && fileInputRef.current?.click()}
                                className="w-16 h-16 bg-black/50 border border-white/20 flex items-center justify-center text-[var(--accent)] font-bold text-xl relative group overflow-hidden shrink-0 cursor-pointer hover:border-[var(--accent)] transition-colors"
                            >
                                {avatarUploading ? (
                                    <Loader2 className="animate-spin text-white/50" />
                                ) : session?.user?.image ? (
                                    <img src={session.user.image} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    name ? name.charAt(0) : "U"
                                )}
                                {!avatarUploading && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload size={16} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-sm font-semibold text-white">
                                    {t.settings.avatarTitle}
                                </label>
                                <p className="text-xs text-white/50">
                                    {t.settings.avatarSubtitle}
                                </p>
                            </div>
                        </div>

                        <div className="w-full h-px bg-white/5 my-4" />

                        <Input
                            label={t.settings.emailLabel}
                            type="text"
                            value={session?.user?.email || t.settings.unknownEmail}
                            disabled
                            className="opacity-50 cursor-not-allowed text-white/50"
                        />

                        <Input
                            label={t.settings.handleLabel}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.settings.handlePlaceholder}
                            className="text-white"
                        />

                        <div className="w-full h-px bg-white/5 my-4" />

                        {/* SECURITY & MFA MATRIX */}
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-white mb-4 block">
                                {t.settings.mfaTitle}
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button type="button" variant="outline" className="w-full justify-start pl-4" onClick={handlePasswordReset} disabled={!!isOAuth}>
                                    <KeyRound size={14} className="text-white/50" />
                                    {t.settings.resetPassword}
                                </Button>

                                <Button type="button" variant="outline" className="w-full justify-start pl-4" onClick={() => setActiveModal("TOTP")} disabled={!!isOAuth || (session?.user as any)?.mfaEnabled}>
                                    <ShieldAlert size={14} className="text-white/50" />
                                    {isMfaActive ? "MFA HARDENED" : t.settings.enableTotp}
                                </Button>

                                <Button type="button" variant="outline" className="w-full justify-start pl-4" onClick={() => setActiveModal("SMS")} disabled={!!isOAuth}>
                                    <Smartphone size={14} className="text-white/50" />
                                    {t.settings.bindSms}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start pl-4 border-red-500/30 text-red-500 hover:bg-red-500/10"
                                    onClick={async () => {
                                        setConfirmModal({
                                            open: true,
                                            title: "EXECUTE OVERWRITE PROTOCOL",
                                            description: "This will forcibly sever all active sessions linked to this root identity except your current one. Proceed with total cryptographic severance?",
                                            variant: "danger",
                                            requireCipher: true,
                                            action: async () => {
                                                setLoading(true);
                                                const res = await revokeAllSessions();
                                                if (res.success) {
                                                    toast({ title: "Severance Complete", description: "All secondary identity nodes have been neutralized.", type: "success" });
                                                    await refreshSessions();
                                                } else {
                                                    toast({ title: "Severance Fault", description: res.message, type: "error" });
                                                }
                                                setLoading(false);
                                            }
                                        });
                                    }}
                                    disabled={loading}
                                >
                                    <ServerCrash size={14} className="text-red-500/50" />
                                    {t.settings.revokeSessions}
                                </Button>
                            </div>

                            {/* ACTIVE SESSIONS TELEMETRY */}
                            <div className="pt-4 space-y-4">
                                <label className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Smartphone size={14} className="text-[var(--accent)]" />
                                    Active Node Connections
                                </label>

                                <div className="space-y-2">
                                    <SessionList
                                        sessions={sessions}
                                        loading={sessionsLoading}
                                        onRevoke={handleRevokeSingle}
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-white/40 text-left mt-4">
                                {t.settings.securityDisclaimer}
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex gap-4">
                        <Button type="submit" variant="solid-accent" className="flex-1" disabled={loading}>
                            {loading ? t.settings.committing : t.settings.commitChanges}
                            <Save size={14} />
                        </Button>
                    </div>
                </form>
            </SolidCard>

            <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            {/* MFA MODAL */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <SolidCard className="max-w-md w-full p-8 border-white/20 relative">
                        <button onClick={() => {
                            setActiveModal(null);
                            setMfaStep("INIT");
                            setVerificationCode("");
                            setReAuthPassword("");
                            setPhoneNumber("");
                            if ((window as any).recaptchaVerifier) {
                                (window as any).recaptchaVerifier.clear();
                                (window as any).recaptchaVerifier = null;
                            }
                        }} className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 p-1 rounded-md transition-colors">
                            <X size={20} />
                        </button>
                        <div className="flex justify-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-[#0a0a0a] border border-white/10 rounded-xl shadow-lg flex items-center justify-center border border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]">
                                {activeModal === "TOTP" ? <ShieldAlert size={20} /> : <Smartphone size={20} />}
                            </div>
                        </div>
                        <h2 className="text-xl font-bold tracking-normal text-white text-center mb-2">
                            {activeModal === "TOTP" ? "Authenticator MFA" : "SMS Relay Binding"}
                        </h2>

                        {mfaStep === "INIT" && (
                            <>
                                <p className="text-sm text-white/50 text-center mb-6 leading-relaxed">
                                    {activeModal === "TOTP"
                                        ? "Securely bind an Authenticator App (Google/Authy) to your Identity Matrix using native Server Actions. This overrides Firebase Auth MFA entirely."
                                        : "SMS functionality has been deprecated in favor of TOTP."}
                                </p>
                                <div className="space-y-4">
                                    <Button variant="solid" className="w-full" onClick={initiateMfaEnrollment} disabled={loading || activeModal === "SMS"}>
                                        {loading ? "Initializing..." : "Initiate Binding Protocol"}
                                    </Button>
                                </div>
                            </>
                        )}

                        {mfaStep === "SCAN_QR" && (
                            <div className="flex flex-col items-center space-y-6">
                                <p className="text-sm text-white/50 text-center leading-relaxed">
                                    {activeModal === "TOTP"
                                        ? "Scan this Matrix with your Authenticator App, then enter the 6-digit verification code below."
                                        : `We sent a cryptographic SMS pulse to ${phoneNumber}. Enter the 6-digit verification code below.`}
                                </p>

                                {activeModal === "TOTP" && (
                                    <div className="bg-white p-4 rounded-xl">
                                        <QRCode value={qrCodeUrl} size={150} />
                                    </div>
                                )}

                                <div className="w-full space-y-4">
                                    <Input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="000000"
                                        className="text-center text-xl tracking-normal] transition-colors text-white p-4"
                                        maxLength={6}
                                    />
                                    {mfaError && <p className="text-red-500 text-xs text-center">{mfaError}</p>}
                                    <Button variant="solid-accent" className="w-full" onClick={verifyAndEnrollTotp} disabled={loading || verificationCode.length !== 6}>
                                        {loading ? "Verifying..." : (activeModal === "TOTP" ? "Bind Authenticator" : "Bind SMS Relay")}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {mfaStep === "DONE" && (
                            <div className="flex flex-col items-center space-y-6">
                                <p className="text-sm text-[var(--accent)] text-center font-bold">
                                    {activeModal === "TOTP" ? "Authenticator Bound Successfully." : "SMS Relay Bound Successfully."}<br />Your identity is now cryptographically hardened.
                                </p>
                                <Button variant="ghost" className="w-full text-white/50 hover:text-white" onClick={() => {
                                    setActiveModal(null);
                                    setMfaStep("INIT");
                                    setVerificationCode("");
                                    setReAuthPassword("");
                                    setPhoneNumber("");
                                }}>
                                    Close Interface
                                </Button>
                            </div>
                        )}
                    </SolidCard>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmModal.open}
                title={confirmModal.title}
                description={confirmModal.description}
                variant={confirmModal.variant}
                onConfirm={() => {
                    if (confirmModal.requireCipher) {
                        setCipherAction({ open: true, onConfirm: confirmModal.action });
                        closeConfirm();
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
        </main>
    );
}

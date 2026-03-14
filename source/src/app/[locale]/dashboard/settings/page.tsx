"use client";

import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Save, LogOut, Upload, KeyRound, ShieldAlert, Smartphone, Loader2, X, ServerCrash } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { auth, storage } from "@/core/firebase/client";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInWithEmailAndPassword } from "firebase/auth";
import QRCode from "react-qr-code";
import { sendCustomPasswordResetEmail, generateSovereignCustomToken, revokeAllSessions } from "@/core/actions/auth";
import { generateMFASecret, verifyAndEnableMFA, disableMFA } from "@/core/actions/mfa";
import { ACTIVE_THEME } from "@/theme/config";
import { useTranslation } from "@/core/i18n/LanguageProvider";

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const { language } = useTranslation();
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
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            alert("Cryptographic Pulse Sent: Check your email for a secure password reset link.");
        } catch (e: any) {
            console.error("Reset Failed:", e);
            alert("MFA Matrix Failure. Ensure you set the RESEND_API_KEY environment variable correctly.");
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
            alert("Sovereign Gravatar Securely Uplinked to Firebase Matrix.");
        } catch (e) {
            console.error("Upload Matrix Fault:", e);
            alert("Storage Uplink Failed. Verify Firebase permissions.");
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

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            <div className="w-full max-w-xl mb-6">
                <Button as={Link} href={`/${language}/dashboard`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={14} className="mr-2" />
                    Back to Terminal
                </Button>
            </div>

            <GlassCard className="w-full max-w-xl space-y-8">
                <div className="space-y-2 text-left">
                    <h1 className="text-2xl font-black uppercase tracking-widest text-[var(--accent)]">SYSTEM CONFIGURATION</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
                        Manage Identity & Settings
                    </p>
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
                                className="w-16 h-16 bg-black/50 border border-white/20 flex items-center justify-center text-[var(--accent)] font-bold text-xl uppercase relative group overflow-hidden shrink-0 cursor-pointer hover:border-[var(--accent)] transition-colors"
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
                                <label className="text-[10px] font-bold tracking-widest uppercase text-white/70">
                                    Sovereign Avatar / Gravatar
                                </label>
                                <p className="text-[9px] text-white/40 uppercase tracking-widest">
                                    Click to upload native file to Storage Matrix.
                                </p>
                            </div>
                        </div>

                        <div className="w-full h-px bg-white/5 my-4" />

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-white/70">
                                Email
                            </label>
                            <input
                                type="text"
                                value={session?.user?.email || "UNKNOWN"}
                                disabled
                                className="w-full bg-white/5 border border-white/10 p-3 text-xs tracking-widest opacity-50 cursor-not-allowed outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)]">
                                Display Handle
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ENTER NEW HANDLE"
                                className="w-full bg-black/50 border border-white/20 p-3 text-xs uppercase tracking-widest hover:border-[var(--accent)] focus:border-[var(--accent)] outline-none transition-colors text-white"
                            />
                        </div>

                        <div className="w-full h-px bg-white/5 my-4" />

                        {/* SECURITY & MFA MATRIX */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold tracking-widest uppercase text-white/70">
                                Cryptographic Security & MFA
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button type="button" variant="outline" className="w-full justify-start pl-4" onClick={handlePasswordReset} disabled={!!isOAuth}>
                                    <KeyRound size={14} className="mr-3 text-white/50" />
                                    Reset Password
                                </Button>

                                <Button type="button" variant="outline" className="w-full justify-start pl-4" onClick={() => setActiveModal("TOTP")} disabled={!!isOAuth}>
                                    <ShieldAlert size={14} className="mr-3 text-white/50" />
                                    Enable TOTP Auth
                                </Button>

                                <Button type="button" variant="outline" className="w-full justify-start pl-4" onClick={() => setActiveModal("SMS")} disabled={!!isOAuth}>
                                    <Smartphone size={14} className="mr-3 text-white/50" />
                                    Bind SMS Number
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start pl-4 border-red-500/30 text-red-500 hover:bg-red-500/10"
                                    onClick={async () => {
                                        if (confirm("Execute Overwrite Protocol? This will forcibly sever all active sessions linked to this root identity except your current one.")) {
                                            setLoading(true);
                                            const res = await revokeAllSessions();
                                            if (res.success) {
                                                alert("Cryptographic Reset Complete. sibling sessions terminated.");
                                            } else {
                                                alert(res.message);
                                            }
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    <ServerCrash size={14} className="mr-3 text-red-500/50" />
                                    Revoke Sibling Sessions
                                </Button>
                            </div>
                            <p className="text-[8px] text-white/30 uppercase tracking-widest text-left">
                                * Security actions require verified Email/Password context. OAuth overrides will bypass MFA protocols.
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex gap-4">
                        <Button type="submit" variant="glass-accent" className="flex-1" disabled={loading}>
                            {loading ? "COMMITTING..." : "COMMIT CHANGES"}
                            <Save size={14} className="ml-2" />
                        </Button>
                    </div>
                </form>
            </GlassCard>

            <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            {/* MFA MODAL */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <GlassCard className="max-w-md w-full p-8 border-white/20 relative">
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
                        }} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                        <div className="flex justify-center mb-6">
                            <div className="w-12 h-12 rounded-full glass flex items-center justify-center border border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]">
                                {activeModal === "TOTP" ? <ShieldAlert size={20} /> : <Smartphone size={20} />}
                            </div>
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-widest text-center mb-2">
                            {activeModal === "TOTP" ? "AUTHENTICATOR MFA" : "SMS RELAY BINDING"}
                        </h2>

                        {mfaStep === "INIT" && (
                            <>
                                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] text-center mb-6 leading-relaxed">
                                    {activeModal === "TOTP"
                                        ? "Securely bind an Authenticator App (Google/Authy) to your Identity Matrix using native Server Actions. This overrides Firebase Auth MFA entirely."
                                        : "SMS functionality has been deprecated in favor of TOTP."}
                                </p>
                                <div className="space-y-4">
                                    <Button variant="glass" className="w-full" onClick={initiateMfaEnrollment} disabled={loading || activeModal === "SMS"}>
                                        {loading ? "INITIALIZING MATRIX..." : "INITIATE BINDING PROTOCOL"}
                                    </Button>
                                </div>
                            </>
                        )}

                        {mfaStep === "SCAN_QR" && (
                            <div className="flex flex-col items-center space-y-6">
                                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] text-center leading-relaxed">
                                    {activeModal === "TOTP"
                                        ? "Scan this cryptographic matrix with your Authenticator App, then enter the 6-digit verification code below."
                                        : `We sent a cryptographic SMS pulse to ${phoneNumber}. Enter the 6-digit verification code below.`}
                                </p>

                                {activeModal === "TOTP" && (
                                    <div className="bg-white p-4 rounded-xl">
                                        <QRCode value={qrCodeUrl} size={150} />
                                    </div>
                                )}

                                <div className="w-full space-y-4">
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="000000"
                                        className="w-full bg-black/50 border border-white/20 p-3 text-center text-xl tracking-[0.5em] hover:border-[var(--accent)] focus:border-[var(--accent)] outline-none transition-colors text-white"
                                        maxLength={6}
                                    />
                                    {mfaError && <p className="text-red-500 text-[10px] uppercase tracking-widest text-center">{mfaError}</p>}
                                    <Button variant="glass-accent" className="w-full" onClick={verifyAndEnrollTotp} disabled={loading || verificationCode.length !== 6}>
                                        {loading ? "VERIFYING CRYPTOGRAPHY..." : (activeModal === "TOTP" ? "BIND AUTHENTICATOR" : "BIND SMS RELAY")}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {mfaStep === "DONE" && (
                            <div className="flex flex-col items-center space-y-6">
                                <p className="text-[10px] text-[var(--accent)] uppercase tracking-[0.2em] text-center font-bold">
                                    {activeModal === "TOTP" ? "Authenticator Bound Successfully." : "SMS Relay Bound Successfully."}<br />Your identity is now cryptographically hardened.
                                </p>
                                <Button variant="glass" className="w-full" onClick={() => {
                                    setActiveModal(null);
                                    setMfaStep("INIT");
                                    setVerificationCode("");
                                    setReAuthPassword("");
                                    setPhoneNumber("");
                                }}>
                                    CLOSE INTERFACE
                                </Button>
                            </div>
                        )}
                    </GlassCard>
                </div>
            )}
        </main>
    );
}

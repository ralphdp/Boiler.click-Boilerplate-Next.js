"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "@/core/firebase/client";
import { SolidCard } from "@/components/ui/SolidCard";
import { Button } from "@/components/ui/Button";
import { KeyRound, ArrowRight } from "lucide-react";
import { ACTIVE_THEME } from "@/theme/config";
import { useTranslation } from "@/core/i18n/LanguageProvider";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const oobCode = searchParams.get("oobCode");

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oobCode || !password) return;

        setLoading(true);
        try {
            // Confirm the code is valid
            await verifyPasswordResetCode(auth, oobCode);
            // Execute the cipher override
            await confirmPasswordReset(auth, oobCode, password);
            setStatus("SUCCESS");
        } catch (error) {
            console.error(`${t.auth.resetFail}:`, error);
            setStatus("ERROR");
        } finally {
            setLoading(false);
        }
    };

    if (!oobCode) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6 text-white text-center">
                <SolidCard className="max-w-md w-full p-8 border-red-500/30">
                    <h1 className="text-xl font-bold text-red-500 mb-4">{t.auth.resetInvalid}</h1>
                    <p className="text-sm text-white/50 mb-8">{t.auth.resetNoToken}</p>
                    <Button onClick={() => router.push("/")} className="w-full">{t.auth.resetReturn}</Button>
                </SolidCard>
            </main>
        );
    }

    if (status === "SUCCESS") {
        return (
            <main className="min-h-screen flex items-center justify-center p-6 text-white text-center">
                <SolidCard className="max-w-md w-full p-8 border-green-500/30">
                    <h1 className="text-xl font-bold text-green-500 mb-4">{t.auth.resetSuccessTitle}</h1>
                    <p className="text-sm text-white/50 mb-8">{t.auth.resetSuccessDesc}</p>
                    <Button onClick={() => router.push("/")} className="w-full">{t.auth.resetEstablish}</Button>
                </SolidCard>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6 text-white text-center relative overflow-hidden">
            <SolidCard className="max-w-md w-full p-8 border-white/10 relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-[#0a0a0a] border border-white/10 rounded-xl shadow-lg flex items-center justify-center border border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]">
                        <KeyRound size={20} />
                    </div>
                </div>

                <h1 className="text-2xl font-bold tracking-normal mb-2">{t.auth.resetTitle}</h1>
                <p className="text-sm text-white/50 mb-8">{t.auth.resetSubtitle}</p>

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-2 text-left">
                        <label className="text-sm font-semibold text-[var(--accent)]">
                            {t.auth.resetNewPass}
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-black/50 border border-white/20 p-3 text-lg font-mono tracking-normal hover:border-[var(--accent)] focus:border-[var(--accent)] outline-none transition-colors text-white text-center"
                        />
                    </div>

                    {status === "ERROR" && (
                        <p className="text-xs text-red-500 font-semibold text-center">
                            {t.auth.resetExpired}
                        </p>
                    )}

                    <Button type="submit" variant="solid-accent" className="w-full flex justify-between px-6" disabled={loading || !password}>
                        {loading ? t.auth.resetExec : t.auth.resetBtn}
                        {!loading && <ArrowRight size={14} className="ml-2" />}
                    </Button>
                </form>
            </SolidCard>
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white"><p className="text-xs tracking-normal opacity-50">{t.auth.resetVerifying}</p></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}

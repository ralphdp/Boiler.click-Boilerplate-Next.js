"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyLoginMFA } from "@/core/actions/mfa";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { Loader2 } from "lucide-react";
import { ShieldCheck } from "lucide-react";

export default function MFAChallengePage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { t, language } = useTranslation();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await verifyLoginMFA(code);
            if (result.success) {
                router.push(`/${language}/dashboard`);
            } else {
                setError(result.error || t.auth.mfaInvalid);
            }
        } catch (err: any) {
            setError(err.message || t.auth.mfaUnexpected);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent text-white relative overflow-hidden font-sans">
            {/* Ambient Substrate Glow */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-1/4 -right-20 w-80 h-80 bg-accent/10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/10 blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-sm z-10 bg-[#050505]/60 border border-white/10 p-10 backdrop-blur-2xl rounded-2xl relative shadow-[0_0_100px_rgba(0,0,0,0.8)]">

                <div className="flex flex-col items-center mb-10">
                    <ShieldCheck className="w-16 h-16 text-accent mb-6" />
                    <h2 className="text-2xl font-black italic text-center leading-none">
                        {t.auth.mfaTitle.split(' ')[0]} <span className="text-accent">{t.auth.mfaTitle.split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <p className="text-[10px] text-white/40 mt-4 text-center">
                        {t.auth.mfaDesc}
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-white/50">{t.auth.mfaAuthCode}</label>
                        <input
                            type="text"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-black/50 border border-white/10 px-4 py-4 text-center text-2xl tracking-[1em] font-mono focus:outline-none focus:border-accent rounded-xl transition-all"
                            placeholder="000000"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold text-center rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || code.length < 6}
                        className="w-full py-4 bg-accent text-white font-black text-[12px] uppercase tracking-wider hover:bg-accent/80 transition-all rounded-xl shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)] disabled:opacity-50 flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.auth.mfaVerifyBtn}
                    </button>

                    <div className="pt-6 mt-6 border-t border-white/10 flex justify-center text-[10px] font-mono text-white/30 hidden">
                        {t.auth.mfaBindingCheck}
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Key } from "lucide-react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { registerSovereignNode } from "@/core/actions/auth";

export function CredentialsForm({ markLastUsed }: { markLastUsed?: () => void }) {
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        if (searchParams?.get("error") === "CredentialsSignin") {
            setError(t.auth.invalidMatch);
        }
    }, [searchParams, t.auth.invalidMatch]);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        markLastUsed?.();

        if (isRegistering) {
            // Flow: Create Node -> then automatically login
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);

            const result = await registerSovereignNode(formData);

            if (result.error) {
                setError(result.message || t.auth.registrationError);
                setLoading(false);
                return;
            }

            // If success, flow naturally into NextAuth SignIn to establish the session.
        }

        // Establish the handshake via NextAuth Session
        const result = await signIn("credentials", {
            email,
            password,
            redirect: true,
            callbackUrl: "/",
        });

        if (result?.error) {
            setError(t.auth.invalidMatch);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleAuthAction} className="pt-4 space-y-6 text-left" id="credentials-form">
            <Input
                id="email"
                type="email"
                label={t.auth.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.placeholderEmail}
                icon={<Mail size={16} />}
                required
            />

            <Input
                id="password"
                type="password"
                label={t.auth.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Key size={16} />}
                required
            />

            {error && (
                <p className="text-[8px] text-red-500 uppercase font-black tracking-widest text-center" aria-live="polite">
                    {error}
                </p>
            )}

            <Button
                type="submit"
                variant="glass-accent"
                disabled={loading}
                className="w-full py-4 uppercase"
            >
                {loading
                    ? t.auth.initializing
                    : (isRegistering ? t.auth.registerIdentity : t.auth.confirmIdentity)}
            </Button>

            <div className="pt-2 text-center text-[10px] uppercase font-bold tracking-[0.15em]">
                <button
                    type="button"
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError("");
                    }}
                    className="text-white/40 hover:text-white transition-colors duration-300"
                >
                    {isRegistering ? t.auth.modeToggleLogin : t.auth.modeToggleRegister}
                </button>
            </div>
        </form>
    );
}

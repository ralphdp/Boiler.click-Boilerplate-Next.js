"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
    markLastUsed: () => void;
}

export const MagicLinkForm = ({ markLastUsed }: Props) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("IDLE");

        try {
            const res = await signIn("resend", {
                email,
                redirect: false,
                callbackUrl: "/en/dashboard",
            });

            if (res?.error) {
                setStatus("ERROR");
            } else {
                markLastUsed();
                setStatus("SUCCESS");
            }
        } catch (e) {
            setStatus("ERROR");
        } finally {
            setLoading(false);
        }
    };

    if (status === "SUCCESS") {
        return (
            <div className="p-4 mt-4 bg-green-500/10 border border-green-500/20 rounded-md text-center animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-green-400 font-medium tracking-wide">
                    SECURE LINK DISPATCHED
                </p>
                <p className="text-xs text-green-500/70 mt-1">
                    Check your email to authenticate.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleMagicLink} className="space-y-4 mt-4" id="magic-link-form">
            <div className="space-y-2">
                <input
                    type="email"
                    required
                    disabled={loading}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-[#111] border border-white/10 px-4 py-3 rounded-md text-white placeholder:text-white/30 outline-none focus:border-[var(--accent)] transition-colors text-sm"
                />
            </div>

            <Button
                variant="solid-accent"
                type="submit"
                disabled={loading || !email}
                className="w-full relative group overflow-hidden"
            >
                <span className="relative z-10 flex items-center justify-center gap-2 font-bold tracking-widest text-[11px] uppercase">
                    {loading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <>Request Magic Link <ArrowRight size={14} className="group-hover:translate-x-1 duration-300" /></>
                    )}
                </span>
            </Button>

            {status === "ERROR" && (
                <p className="text-xs text-red-400 text-center mt-2 font-medium tracking-wide">
                    Authentication error. Please try again.
                </p>
            )}
        </form>
    );
};

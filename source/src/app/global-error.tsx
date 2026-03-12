"use client";

import { useEffect } from "react";
import { ACTIVE_THEME } from "@/theme/config";
import SovereignBackground from "@/theme/shaders/SovereignBackground";
import { CopyX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Here we could pipe to Sentry or TokenAnalyticsVault
        console.error("[SOVEREIGN KERNEL PANIC]", error);
    }, [error]);

    return (
        <html lang="en" className="dark">
            <body className="font-sans bg-black text-white antialiased">
                <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-black">
                    <SovereignBackground />

                    <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

                    <div className="z-20 w-full max-w-md">
                        <GlassCard>
                            <header className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="p-4 rounded-full glass text-red-500">
                                        <CopyX size={32} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h1 className="text-2xl font-black technical tracking-[0.2em] text-red-500">CRITICAL FAILURE</h1>
                                    <p className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-bold mt-2">
                                        Substrate Execution Halted
                                    </p>
                                </div>
                            </header>

                            <div className="space-y-4 text-center mt-6">
                                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-md text-red-400 text-xs font-mono break-words text-left">
                                    {error.message || "An unknown architectural fracture occurred."}
                                    {error.digest && <div className="mt-2 text-[8px] opacity-50">Digest: {error.digest}</div>}
                                </div>

                                <Button
                                    variant="glass-accent"
                                    onClick={() => reset()}
                                    className="w-full mt-4 !border-red-500/50 hover:!bg-red-500/10"
                                >
                                    Reboot Local Substrate
                                </Button>
                            </div>
                        </GlassCard>
                    </div>
                </main>
            </body>
        </html>
    );
}

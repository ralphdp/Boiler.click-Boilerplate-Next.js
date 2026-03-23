"use client";

import { useEffect, useState } from "react";
import { ACTIVE_THEME } from "@/theme/config";
import SovereignBackground from "@/theme/shaders/SovereignBackground";
import { CopyX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SolidCard } from "@/components/ui/SolidCard";
import { dictionary, SUPPORTED_LOCALES, Language } from "@/core/i18n/translations";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [locale, setLocale] = useState<Language>('en');

    useEffect(() => {
        // Here we could pipe to Sentry or TokenAnalyticsVault
        console.error("[SOVEREIGN KERNEL PANIC]", error);

        try {
            const browserLocale = navigator.language.split('-')[0] as Language;
            if (SUPPORTED_LOCALES.includes(browserLocale)) {
                setLocale(browserLocale);
            }
        } catch (e) {
            // Ignore navigator language error
        }
    }, [error]);

    const t = dictionary[locale].globalError;

    return (
        <html lang={locale} className="dark">
            <body className="font-sans bg-black text-white antialiased">
                <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-black">
                    <SovereignBackground />

                    <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

                    <div className="z-20 w-full max-w-md">
                        <SolidCard>
                            <header className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="p-4 rounded-full bg-[#0a0a0a] border border-white/10 rounded-xl shadow-lg text-red-500">
                                        <CopyX size={32} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold tracking-normal] text-red-500">{t.title}</h1>
                                    <p className="text-[10px] text-white/50 tracking-normal] font-bold mt-2">
                                        {t.subtitle}
                                    </p>
                                </div>
                            </header>

                            <div className="space-y-4 text-center mt-6">
                                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-md text-red-400 text-xs font-mono break-words text-left">
                                    {error.message || t.body}
                                    {error.digest && <div className="mt-2 text-[8px] opacity-50">{t.digest} {error.digest}</div>}
                                </div>

                                <Button
                                    variant="solid-accent"
                                    onClick={() => reset()}
                                    className="w-full mt-4 !border-red-500/50 hover:!bg-red-500/10"
                                >
                                    {t.reboot}
                                </Button>
                            </div>
                        </SolidCard>
                    </div>
                </main>
            </body>
        </html>
    );
}

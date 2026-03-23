"use client";

import { ACTIVE_THEME } from "@/theme/config";
import Link from "next/link";
import { CopyX, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SolidCard } from "@/components/ui/SolidCard";
import { useTranslation } from "@/core/i18n/LanguageProvider";

export default function NotFound() {
    const { t, language } = useTranslation();

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden text-white font-sans">
            <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" aria-hidden="true" />

            <div className="z-20 w-full max-w-md">
                <SolidCard>
                    <header className="space-y-4">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-[#0a0a0a] border border-white/10 rounded-xl shadow-lg text-accent">
                                <CopyX size={32} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold tracking-normal]">{t["404"].title}</h1>
                            <p className="text-[10px] text-white/40 tracking-normal] font-bold mt-2">
                                {t["404"].subtitle}
                            </p>
                        </div>
                    </header>

                    <div className="space-y-4 text-center mt-6">
                        <p className="text-[10px] text-white/50 tracking-normal leading-loose max-w-[350px] mx-auto">
                            {t["404"].description}
                        </p>

                        <div className="pt-4 flex justify-center w-full">
                            <Button
                                as={Link}
                                href={`/${language}`}
                                variant="solid-accent"
                                className="w-full"
                            >
                                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform mr-1" />
                                {t["404"].return}
                            </Button>
                        </div>
                    </div>
                </SolidCard>
            </div>
        </main>
    );
}

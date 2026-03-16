"use client";

import { useTranslation } from "@/core/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

import { Github, Twitter, MessageSquare, BarChart3 } from "lucide-react";
import { useFeatureFlags } from "@/core/hooks/useFeatureFlags";
import Link from "next/link";

export function FooterTimestamp({ contactEmail, socials, activeAccentColor, modules: initialModules }: { contactEmail?: string, socials?: { socialX?: string, socialGithub?: string, socialDiscord?: string }, activeAccentColor?: string, modules?: any }) {
    const { t, language } = useTranslation();
    const { modules: hookedModules } = useFeatureFlags();
    const modules = initialModules || hookedModules;

    return (
        <div className="fixed bottom-8 left-8 right-8 z-[200] flex flex-row items-center justify-between pointer-events-none md:pointer-events-auto opacity-0 md:opacity-100 gap-4">
            <div className="flex items-center gap-6 pointer-events-auto">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">
                    {t.home.timestamp} // {new Date().getFullYear()}
                </p>
                {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="text-[10px] font-mono text-white/30 hover:text-white transition-colors">
                        {contactEmail}
                    </a>
                )}
                <div className="flex items-center gap-3 border-l border-white/5 pl-6">
                    {socials?.socialX && (
                        <a href={socials.socialX} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                            <Twitter size={14} />
                        </a>
                    )}
                    {socials?.socialGithub && (
                        <a href={socials.socialGithub} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                            <Github size={14} />
                        </a>
                    )}
                    {socials?.socialDiscord && (
                        <a href={socials.socialDiscord} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
                            <MessageSquare size={14} />
                        </a>
                    )}
                    {modules.publicAnalytics && (
                        <Link href={`/${language}/analytics`} className="text-[10px] uppercase font-black tracking-widest text-[var(--accent)]/50 hover:text-[var(--accent)] transition-colors flex items-center gap-2 border-l border-white/5 pl-4 ml-2">
                            <BarChart3 size={12} />
                            Public Pulse
                        </Link>
                    )}
                </div>
            </div>
            <div className="pointer-events-auto flex items-center gap-4">
                <ThemeSwitcher activeAccentColor={activeAccentColor} />
                <LanguageSwitcher />
            </div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import { SolidCard } from "@/components/ui/SolidCard";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { setSiteTitle, setContentOverride, setContactEmail, setPrimaryColor, setSEOMetadata, setSocialLinks, setSovereignWebGLVariant } from "@/core/actions/branding";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";

interface AdminBrandingProps {
    t: any;
    siteTitle: string;
    setSiteTitleUI: (val: string) => void;
    typographyOverride: string;
    setTypographyOverride: (val: string) => void;
    contactEmail: string;
    setContactEmailUI: (val: string) => void;
    primaryColor: string;
    setPrimaryColorUI: (val: string) => void;
    seoDescription: string;
    setSeoDescriptionUI: (val: string) => void;
    seoKeywords: string;
    setSeoKeywordsUI: (val: string) => void;
    seoOgImage: string;
    setSeoOgImageUI: (val: string) => void;
    socialX: string;
    setSocialXUI: (val: string) => void;
    socialGithub: string;
    setSocialGithubUI: (val: string) => void;
    socialDiscord: string;
    setSocialDiscordUI: (val: string) => void;
    webglVariantUI: string;
    setWebglVariantUI: (val: string) => void;
}

export function AdminBranding({
    t,
    siteTitle,
    setSiteTitleUI,
    typographyOverride,
    setTypographyOverride,
    contactEmail,
    setContactEmailUI,
    primaryColor,
    setPrimaryColorUI,
    seoDescription,
    setSeoDescriptionUI,
    seoKeywords,
    setSeoKeywordsUI,
    seoOgImage,
    setSeoOgImageUI,
    socialX,
    setSocialXUI,
    socialGithub,
    setSocialGithubUI,
    socialDiscord,
    setSocialDiscordUI,
    webglVariantUI,
    setWebglVariantUI
}: AdminBrandingProps) {
    const { toast } = useToast();
    const router = useRouter();

    return (
        <motion.div
            key="branding-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
            <SolidCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold tracking-normal text-[var(--accent)]">{t.admin.branding.siteTitle}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.branding.siteTitleDesc}</p>
                </div>
                <div className="flex flex-col gap-3 w-full justify-start">
                    <Input
                        type="text"
                        placeholder={t.admin.branding.siteTitlePlace}
                        value={siteTitle}
                        onChange={(e) => setSiteTitleUI(e.target.value)}
                        onBlur={async (e) => {
                            const res = await setSiteTitle(e.target.value);
                            if (res.success) {
                                toast({ title: t.admin.branding.titleOverride, description: t.admin.branding.titleOverrideDesc, type: "success" });
                                router.refresh();
                            }
                        }}
                    />
                </div>
            </SolidCard>

            <SolidCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold tracking-normal text-[var(--accent)]">{t.admin.branding.siteSubtitle}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.branding.siteSubtitleDesc}</p>
                </div>
                <div className="flex flex-col gap-3 w-full justify-start">
                    <Input
                        type="text"
                        placeholder={t.admin.branding.siteSubtitlePlace || "The ultimate sovereign identity matrix."}
                        value={typographyOverride}
                        onChange={(e) => setTypographyOverride(e.target.value)}
                        onBlur={async (e) => {
                            const res = await setContentOverride(e.target.value);
                            if (res.success) {
                                toast({ title: t.admin.branding.typographyOverride, description: t.admin.branding.typographyOverrideDesc, type: "success" });
                                router.refresh();
                            }
                        }}
                    />
                </div>
            </SolidCard>

            <SolidCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold tracking-normal text-[var(--accent)]">{t.admin.branding.supportEmail}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.branding.supportEmailDesc}</p>
                </div>
                <div className="flex flex-col gap-3 w-full justify-start">
                    <Input
                        type="text"
                        placeholder={t.admin.branding.supportEmailPlace}
                        value={contactEmail}
                        onChange={(e) => setContactEmailUI(e.target.value)}
                        onBlur={async (e) => {
                            const res = await setContactEmail(e.target.value);
                            if (res.success) {
                                toast({ title: t.admin.branding.configUpdated, description: t.admin.branding.supportVectorDesc, type: "success" });
                                router.refresh();
                            }
                        }}
                    />
                </div>
            </SolidCard>

            <SolidCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold tracking-normal text-[var(--accent)]">{t.admin.branding.primaryTheme}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.branding.primaryThemeDesc}</p>
                </div>
                <div className="flex flex-col gap-3 w-full justify-start">
                    <Input
                        type="text"
                        placeholder={t.admin.branding.primaryThemePlace}
                        value={primaryColor}
                        onChange={(e) => setPrimaryColorUI(e.target.value)}
                        onBlur={async (e) => {
                            const res = await setPrimaryColor(e.target.value);
                            if (res.success) {
                                toast({ title: t.admin.branding.titleOverride, description: t.admin.branding.globalAccentDesc, type: "success" });
                                router.refresh();
                            }
                        }}
                    />
                </div>
            </SolidCard>

            <SolidCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold tracking-normal text-[var(--accent)]">{t.admin.branding.seoTags}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.branding.seoTagsDesc}</p>
                </div>
                <div className="flex flex-col gap-4 w-full">
                    <Textarea
                        placeholder={t.admin.branding.siteDescription || "The definitive Next.js boilerplate for sovereign SaaS and localized commerce nodes."}
                        value={seoDescription}
                        onChange={(e) => setSeoDescriptionUI(e.target.value)}
                        onBlur={async () => {
                            const res = await setSEOMetadata({ description: seoDescription, keywords: seoKeywords, ogUrl: seoOgImage });
                            if (res.success) {
                                toast({ title: t.admin.branding.configUpdated, description: t.admin.branding.searchIndexDesc, type: "success" });
                                router.refresh();
                            }
                        }}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <Input
                            type="text"
                            placeholder={t.admin.branding.seoKeywordsPlace || "keywords, separated, by, commas"}
                            value={seoKeywords}
                            onChange={(e) => setSeoKeywordsUI(e.target.value)}

                            onBlur={async () => {
                                const res = await setSEOMetadata({ description: seoDescription, keywords: seoKeywords, ogUrl: seoOgImage });
                                if (res.success) {
                                    toast({ title: t.admin.branding.configUpdated, description: t.admin.branding.searchIndexDesc, type: "success" });
                                    router.refresh();
                                }
                            }}
                        />
                        <Input
                            type="text"
                            placeholder={t.admin.branding.seoOgPlace}
                            value={seoOgImage}
                            onChange={(e) => setSeoOgImageUI(e.target.value)}
                            onBlur={async () => {
                                const res = await setSEOMetadata({ description: seoDescription, keywords: seoKeywords, ogUrl: seoOgImage });
                                if (res.success) {
                                    toast({ title: t.admin.branding.configUpdated, description: t.admin.branding.searchIndexDesc, type: "success" });
                                    router.refresh();
                                }
                            }}
                        />
                    </div>
                </div>
            </SolidCard>

            <SolidCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold tracking-normal text-[var(--accent)]">{t.admin.branding.socialLinks}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.branding.socialLinksDesc}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <Input
                        type="text"
                        placeholder={t.admin.branding.xPlace}
                        value={socialX}
                        onChange={(e) => setSocialXUI(e.target.value)}
                        onBlur={async () => {
                            const res = await setSocialLinks({ socialX, socialGithub, socialDiscord });
                            if (res.success) {
                                toast({ title: t.admin.branding.configUpdated, description: t.admin.branding.socialRelaysDesc, type: "success" });
                                router.refresh();
                            }
                        }}
                    />
                    <Input
                        type="text"
                        placeholder={t.admin.branding.githubPlace}
                        value={socialGithub}
                        onChange={(e) => setSocialGithubUI(e.target.value)}
                        onBlur={async () => {
                            const res = await setSocialLinks({ socialX, socialGithub, socialDiscord });
                            if (res.success) {
                                toast({ title: t.admin.branding.configUpdated, description: t.admin.branding.socialRelaysDesc, type: "success" });
                                router.refresh();
                            }
                        }}
                    />
                    <Input
                        type="text"
                        placeholder={t.admin.branding.discordPlace}
                        value={socialDiscord}
                        onChange={(e) => setSocialDiscordUI(e.target.value)}
                        onBlur={async () => {
                            const res = await setSocialLinks({ socialX, socialGithub, socialDiscord });
                            if (res.success) {
                                toast({ title: t.admin.branding.configUpdated, description: t.admin.branding.socialRelaysDesc, type: "success" });
                                router.refresh();
                            }
                        }}
                    />
                </div>
            </SolidCard>
            <SolidCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold tracking-normal text-[var(--accent)]">{t.admin.branding.bgAnimation}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.branding.bgAnimationDesc}</p>
                </div>
                <div className="flex flex-wrap w-full justify-start gap-4">
                    {['fire', 'matrix', 'galaxy', 'tesseract', 'none'].map((variant) => {
                        const isActive = webglVariantUI?.toLowerCase() === variant.toLowerCase();
                        return (
                            <Button
                                key={variant}
                                variant={isActive ? "solid-accent" : "solid"}
                                onClick={async () => {
                                    setWebglVariantUI(variant); // Immediate UI update
                                    const res = await setSovereignWebGLVariant(variant as any);
                                    if (res.success) {
                                        toast({ title: t.admin.branding.configUpdated, description: `Background shader recalibrated to ${variant.toUpperCase()}.`, type: "success" });
                                        router.refresh();
                                    }
                                }}
                                className={`min-w-[100px] h-auto py-2 text-xs font-semibold tracking-normal transition-all ${isActive ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-white/10 text-white/40'}`}
                                tooltip={`Switch the background aesthetic protocol to ${variant.toUpperCase()}.`}
                                tooltipTerm="BG_VARIANT_SHIFT"
                            >
                                {variant.charAt(0).toUpperCase() + variant.slice(1)}
                            </Button>
                        );
                    })}
                </div>
            </SolidCard>
        </motion.div>
    );
}

"use client";

import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { ArrowLeft, KeyRound, Plus, Trash2, ShieldAlert, Webhook } from "lucide-react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useEffect, useState } from "react";
import { getUserAPIKeys, generateAPIKey, revokeAPIKey } from "@/core/actions/apikeys";
import { getWorkspaceWebhooks, registerWebhook } from "@/core/actions/webhooks";

export default function DeveloperPage() {
    const { data: session } = useSession();
    const { language } = useTranslation();
    const [keys, setKeys] = useState<any[]>([]);
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newKeyName, setNewKeyName] = useState("");
    const [newWebhookUrl, setNewWebhookUrl] = useState("");
    const [newWebhookDesc, setNewWebhookDesc] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [revealedKey, setRevealedKey] = useState<string | null>(null);

    const activeWorkspace = session?.user?.activeWorkspace;

    useEffect(() => {
        if (session) {
            loadKeys();
            if (activeWorkspace) {
                loadWebhooks();
            }
        }
    }, [session, activeWorkspace]);

    const loadWebhooks = async () => {
        if (!activeWorkspace) return;
        const w = await getWorkspaceWebhooks(activeWorkspace);
        setWebhooks(w);
    };

    const loadKeys = async () => {
        setLoading(true);
        const k = await getUserAPIKeys();
        setKeys(k);
        setLoading(false);
    };

    const handleGenerate = async () => {
        if (!newKeyName) return;
        setIsGenerating(true);
        const res = await generateAPIKey(newKeyName);
        if (res.success && res.apiKey) {
            setRevealedKey(res.apiKey);
            setNewKeyName("");
            await loadKeys();
        }
        setIsGenerating(false);
    };

    const handleRevoke = async (id: string, name: string) => {
        if (confirm(`SYSTEM WARNING: Are you sure you want to revoke key '${name}'? This action cannot be reversed.`)) {
            setIsGenerating(true);
            const res = await revokeAPIKey(id);
            if (res.success) {
                await loadKeys();
            }
            setIsGenerating(false);
        }
    };

    const handleRegisterWebhook = async () => {
        if (!newWebhookUrl || !newWebhookDesc || !activeWorkspace) return;
        setIsGenerating(true);
        const res = await registerWebhook(activeWorkspace, newWebhookUrl, newWebhookDesc);
        if (res.success) {
            setNewWebhookUrl("");
            setNewWebhookDesc("");
            await loadWebhooks();
        } else {
            alert(res.message);
        }
        setIsGenerating(false);
    };

    const handleCopy = () => {
        if (revealedKey) {
            navigator.clipboard.writeText(revealedKey);
            alert("Cryptographic Key copied to clipboard.");
        }
    };

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            <div className="w-full max-w-2xl mb-6">
                <Button as={Link} href={`/${language}/dashboard`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={14} className="mr-2" />
                    Back to Terminal
                </Button>
            </div>

            <GlassCard className="w-full max-w-2xl space-y-8">
                <div className="space-y-2 text-left">
                    <h1 className="text-2xl font-black uppercase tracking-widest text-[var(--accent)] flex items-center gap-3">
                        <KeyRound size={24} />
                        DEVELOPER API KEYS
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
                        Cryptographic Access Management
                    </p>
                </div>

                <div className="w-full h-px bg-white/5" />

                {revealedKey && (
                    <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/50 p-6 rounded-lg space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-[var(--accent)] font-bold text-sm tracking-widest uppercase">
                            <ShieldAlert size={16} /> NEW KEY GENERATED
                        </div>
                        <p className="text-[10px] uppercase font-mono text-white/70">
                            Please copy this key immediately. For security, it will never be displayed again.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <div className="flex-1 w-full">
                                <Input
                                    readOnly
                                    value={revealedKey}
                                    className="font-mono text-sm tracking-widest text-[var(--accent)] border-[var(--accent)]/30 h-[52px]"
                                />
                            </div>
                            <Button variant="glass-accent" onClick={handleCopy} className="shrink-0 h-[52px]">
                                COPY KEY
                            </Button>
                        </div>
                        <Button variant="ghost" onClick={() => setRevealedKey(null)} className="w-fit text-xs px-0 text-white/40 hover:text-white">
                            I HAVE SAVED IT DIRECTLY
                        </Button>
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <h2 className="text-[10px] font-bold tracking-widest uppercase text-white/70 mb-4">Provision New Client Key</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 w-full">
                                <Input
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="IDENTIFIER (E.G. PRODUCTION SUBSTRATE)"
                                    className="uppercase tracking-widest text-white h-[52px]"
                                />
                            </div>
                            <Button onClick={handleGenerate} disabled={!newKeyName || isGenerating} variant="glass-accent" className="shrink-0 h-[52px]">
                                <Plus size={14} className="mr-2" /> GENERATE
                            </Button>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    <div>
                        <h2 className="text-[10px] font-bold tracking-widest uppercase text-white/70 mb-4">Active API Keys</h2>

                        {loading ? (
                            <p className="text-white/30 text-xs font-mono uppercase tracking-widest animate-pulse">Decrypting matrix...</p>
                        ) : keys.length === 0 ? (
                            <p className="text-white/30 text-xs font-mono uppercase tracking-widest p-4 border border-dashed border-white/10 text-center">No active API keys found.</p>
                        ) : (
                            <div className="space-y-3">
                                {keys.map(k => (
                                    <div key={k.id} className="p-4 bg-white/5 border border-white/10 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold uppercase tracking-widest text-xs text-white p-1 bg-white/10">{k.name}</h3>
                                            <Button variant="ghost" onClick={() => handleRevoke(k.id, k.name)} disabled={isGenerating} className="shrink-0 text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 !p-0 rounded-full flex items-center justify-center">
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-between text-white/40 gap-4 w-full">
                                            <div className="bg-black/80 px-4 py-2 border border-white/5 font-mono text-sm tracking-widest w-full">
                                                {k.preview}
                                            </div>
                                            <div className="font-mono text-[9px] uppercase tracking-widest self-end whitespace-nowrap">
                                                {new Date(k.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full h-px bg-white/5" />

                {activeWorkspace && (
                    <div className="space-y-6">
                        <div className="space-y-2 text-left">
                            <h2 className="text-xl font-black uppercase tracking-widest text-[#00E676] flex items-center gap-3">
                                <Webhook size={20} />
                                CRYPTOGRAPHIC WEBHOOKS
                            </h2>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
                                Bind event streams to external URLs.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-[10px] font-bold tracking-widest uppercase text-white/70 mb-4">Mount New Webhook</h2>
                            <div className="flex flex-col space-y-4">
                                <Input
                                    value={newWebhookDesc}
                                    onChange={(e) => setNewWebhookDesc(e.target.value)}
                                    placeholder="DESCRIPTION (E.G. PRIMARY INGEST NODE)"
                                    className="uppercase tracking-widest text-white h-[52px]"
                                />
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 w-full">
                                        <Input
                                            value={newWebhookUrl}
                                            onChange={(e) => setNewWebhookUrl(e.target.value)}
                                            placeholder="HTTPS://..."
                                            className="font-mono text-white/80 focus:border-[#00E676] h-[52px]"
                                        />
                                    </div>
                                    <Button onClick={handleRegisterWebhook} disabled={!newWebhookUrl || !newWebhookDesc || isGenerating} variant="glass-accent" className="shrink-0 bg-[#00E676]/20 text-[#00E676] border-[#00E676]/50 hover:bg-[#00E676]/40 h-[52px]">
                                        <Plus size={14} className="mr-2" /> MOUNT
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-px bg-white/5" />

                        <div>
                            <h2 className="text-[10px] font-bold tracking-widest uppercase text-white/70 mb-4">Active Sinks</h2>

                            {webhooks.length === 0 ? (
                                <p className="text-white/30 text-xs font-mono uppercase tracking-widest p-4 border border-dashed border-white/10 text-center">No active webhooks mounted.</p>
                            ) : (
                                <div className="space-y-3">
                                    {webhooks.map(w => (
                                        <div key={w.id} className="p-4 bg-white/5 border border-white/10 flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold uppercase tracking-widest text-xs text-[#00E676] p-1 bg-[#00E676]/10">{w.description}</h3>
                                                <Button variant="ghost" disabled className="shrink-0 text-white/50 h-8 font-mono text-[9px] uppercase">
                                                    ACTIVE
                                                </Button>
                                            </div>
                                            <div className="flex flex-col justify-between text-white/40 gap-2 w-full">
                                                <div className="bg-black/80 px-4 py-2 border border-white/5 font-mono text-xs tracking-widest w-full truncate">
                                                    {w.url}
                                                </div>
                                                <div className="font-mono text-[9px] uppercase tracking-widest self-end whitespace-nowrap">
                                                    MOUNTED: {new Date(w.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeWorkspace && <div className="w-full h-px bg-white/5" />}
                <div className="space-y-4">
                    <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#00E676] mb-4 flex items-center gap-2">
                        <KeyRound size={12} /> API Integration Trace
                    </h2>
                    <p className="text-[10px] uppercase font-mono text-white/50">
                        Hit the ping route using the <span className="text-white">Authorization: Bearer</span> matrix to test your cryptocipher.
                    </p>
                    <div className="relative group p-4 bg-black/50 border border-white/10 overflow-x-auto">
                        <pre className="text-xs font-mono text-white/70">
                            <span className="text-[#00E676]">curl</span> -X GET \{"\n"}
                            {'  '}https://yourapi.com/api/v1/ping \{"\n"}
                            {'  '}-H <span className="text-[var(--accent)]">"Authorization: Bearer sk_van_YOUR_SECRET_KEY"</span>
                        </pre>
                    </div>
                </div>

            </GlassCard>

            <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

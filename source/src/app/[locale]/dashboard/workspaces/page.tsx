"use client";

import { useSession } from "next-auth/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { DataGrid } from "@/components/ui/DataGrid";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, Plus, Users, ShieldAlert, Activity, Webhook, FileText } from "lucide-react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { getUserWorkspaces, createWorkspace, inviteWorkspaceMember, getWorkspaceAuditLogs } from "@/core/actions/workspaces";
import { registerWebhook } from "@/core/actions/webhooks";

export default function WorkspacesPage() {
    const { data: session, update } = useSession();
    const { language, t } = useTranslation();
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [newWsName, setNewWsName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("VIEWER");
    const [activeWsIdForInvite, setActiveWsIdForInvite] = useState<string | null>(null);

    const [webhookUrl, setWebhookUrl] = useState("");
    const [webhookDesc, setWebhookDesc] = useState("");
    const [activeWsIdForWebhook, setActiveWsIdForWebhook] = useState<string | null>(null);

    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    const activeWorkspace = (session?.user as any)?.activeWorkspace;

    useEffect(() => {
        if (session) {
            loadWorkspaces();
            if (activeWorkspace) {
                loadAuditLogs();
            }
        }
    }, [session, activeWorkspace]);

    const loadAuditLogs = async () => {
        if (!activeWorkspace) return;
        const logs = await getWorkspaceAuditLogs(activeWorkspace);
        setAuditLogs(logs);
    };

    const loadWorkspaces = async () => {
        setLoading(true);
        const ws = await getUserWorkspaces();
        setWorkspaces(ws);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newWsName) return;
        setIsCreating(true);
        const res = await createWorkspace({ name: newWsName });
        if (res.success) {
            setNewWsName("");
            await loadWorkspaces();
        }
        setIsCreating(false);
    };

    const handleInvite = async (wsId: string) => {
        if (!inviteEmail) return;
        setIsCreating(true);
        const res = await inviteWorkspaceMember(wsId, inviteEmail, inviteRole);
        if (res.success) {
            toast({ title: "Invitation Pulsed", description: `${t.workspaces.invitationSent} ${inviteEmail}`, type: "success" });
            setInviteEmail("");
            setActiveWsIdForInvite(null);
        } else {
            toast({ title: "Handshake Fault", description: res.message, type: "error" });
        }
        setIsCreating(false);
    };

    const handleSwitchContext = async (ws: any) => {
        setLoading(true);
        await update({ activeWorkspace: ws.id });
        toast({ title: "Target Synchronized", description: `${t.workspaces.contextSwitched} ${ws.name}`, type: "success" });
        setLoading(false);
    };

    const handleExitContext = async () => {
        setLoading(true);
        await update({ activeWorkspace: null });
        toast({ title: "Context Severed", description: t.workspaces.contextSevered, type: "info" });
        setLoading(false);
    };

    const handleRegisterWebhook = async (wsId: string) => {
        if (!webhookUrl) return;
        setIsCreating(true);
        const res = await registerWebhook(wsId, webhookUrl, webhookDesc || "Sovereign Integration");
        if (res.success) {
            toast({ title: "Webhook Mounted", description: `${t.workspaces.webhookMounted} ${webhookUrl}`, type: "success" });
            setWebhookUrl("");
            setWebhookDesc("");
            setActiveWsIdForWebhook(null);
        } else {
            toast({ title: "Mounting Fault", description: res.message, type: "error" });
        }
        setIsCreating(false);
    };

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden">
            <div className="w-full max-w-2xl mb-6">
                <Button as={Link} href={`/${language}/dashboard`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={14} className="mr-2" />
                    {t.settings.backToTerminal}
                </Button>
            </div>

            <GlassCard className="w-full max-w-2xl space-y-8">
                <div className="space-y-2 text-left">
                    <h1 className="text-2xl font-black uppercase tracking-widest text-[var(--accent)] flex items-center gap-3">
                        <LayoutGrid size={24} />
                        {t.workspaces.title}
                    </h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
                        {t.workspaces.subtitle}
                    </p>
                </div>

                <div className="w-full h-px bg-white/5" />

                <div className="space-y-6">
                    <div>
                        <h2 className="text-[10px] font-bold tracking-widest uppercase text-white/70 mb-4">{t.workspaces.initNew}</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    value={newWsName}
                                    onChange={(e) => setNewWsName(e.target.value)}
                                    placeholder={t.workspaces.wsTitlePlaceholder}
                                    className="uppercase tracking-widest"
                                />
                            </div>
                            <Button onClick={handleCreate} disabled={!newWsName || isCreating} variant="glass-accent" className="shrink-0 h-[54px]">
                                <Plus size={14} className="mr-2" /> {t.workspaces.create}
                            </Button>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    <div>
                        <h2 className="text-[10px] font-bold tracking-widest uppercase text-white/70 mb-4 flex items-center justify-between">
                            {t.workspaces.activeDirs}
                            {(session?.user as any)?.activeWorkspace && (
                                <Button
                                    variant="outline"
                                    onClick={handleExitContext}
                                    disabled={loading}
                                    className="text-[9px] h-6 px-3 border-red-500/30 text-red-500 hover:bg-red-500/10"
                                >
                                    {t.workspaces.exitWorkspace}
                                </Button>
                            )}
                        </h2>

                        {loading ? (
                            <p className="text-white/30 text-xs font-mono uppercase tracking-widest animate-pulse">{t.workspaces.scanning}</p>
                        ) : workspaces.length === 0 ? (
                            <p className="text-white/30 text-xs font-mono uppercase tracking-widest p-4 border border-dashed border-white/10 text-center">{t.workspaces.noWorkspaces}</p>
                        ) : (
                            <div className="space-y-4">
                                {workspaces.map(ws => (
                                    <div key={ws.id} className="p-4 bg-white/5 border border-white/10 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                                        {ws.name}
                                                        {(session?.user as any)?.activeWorkspace === ws.id && (
                                                            <span className="text-[9px] bg-[var(--accent)] text-black px-2 py-0.5 rounded-sm">{t.workspaces.activeBadge}</span>
                                                        )}
                                                    </h3>
                                                    <p className="text-[10px] uppercase font-mono text-white/50 mt-1">{t.workspaces.idLabel} {ws.id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="px-3 py-1 bg-black text-[10px] font-bold font-mono text-white/50 border border-white/20">
                                                    {ws.role}
                                                </div>
                                                <Button
                                                    variant={(session?.user as any)?.activeWorkspace === ws.id ? "ghost" : "glass"}
                                                    onClick={() => handleSwitchContext(ws)}
                                                    className="w-10 h-10 !p-0 flex items-center justify-center rounded-sm text-[var(--accent)] border-[var(--accent)]/30 hover:bg-[var(--accent)]/10"
                                                    title={t.workspaces.enterContext}
                                                    disabled={loading || (session?.user as any)?.activeWorkspace === ws.id}
                                                >
                                                    <Activity size={18} />
                                                </Button>
                                            </div>
                                        </div>

                                        {['OWNER', 'ADMIN'].includes(ws.role) && (
                                            <div className="pt-4 border-t border-white/5 space-y-4">
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {activeWsIdForInvite !== ws.id && (
                                                        <Button variant="ghost" onClick={() => { setActiveWsIdForInvite(ws.id); setActiveWsIdForWebhook(null); }} className="w-fit border border-white/10 text-xs py-1.5 px-3">
                                                            <Users size={12} className="mr-2" /> {t.workspaces.inviteHandshake}
                                                        </Button>
                                                    )}
                                                    {activeWsIdForWebhook !== ws.id && ws.role === "OWNER" && (
                                                        <Button variant="ghost" onClick={() => { setActiveWsIdForWebhook(ws.id); setActiveWsIdForInvite(null); }} className="w-fit border border-white/10 text-xs py-1.5 px-3">
                                                            <Webhook size={12} className="mr-2" /> {t.workspaces.mountWebhook}
                                                        </Button>
                                                    )}
                                                </div>

                                                {activeWsIdForInvite === ws.id && (
                                                    <div className="flex flex-col sm:flex-row gap-2 animate-in fade-in slide-in-from-top-2 items-start">
                                                        <div className="flex-1 w-full">
                                                            <Input
                                                                type="email"
                                                                value={inviteEmail}
                                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                                placeholder={t.workspaces.targetEmail}
                                                                className="uppercase tracking-widest"
                                                            />
                                                        </div>
                                                        <div className="w-full sm:w-48">
                                                            <Select
                                                                options={[
                                                                    { value: "VIEWER", label: "VIEWER" },
                                                                    { value: "EDITOR", label: "EDITOR" },
                                                                    { value: "ADMIN", label: "ADMIN" }
                                                                ]}
                                                                value={inviteRole}
                                                                onChange={(val) => setInviteRole(val as any)}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                        <Button variant="glass" onClick={() => handleInvite(ws.id)} disabled={!inviteEmail || isCreating} className="text-xs shrink-0 py-[17px] border-[var(--accent)]/30 hover:border-[var(--accent)]">
                                                            {t.workspaces.send}
                                                        </Button>
                                                        <Button variant="ghost" onClick={() => setActiveWsIdForInvite(null)} className="shrink-0 px-2 py-[17px] text-white/50">
                                                            {t.workspaces.cancel}
                                                        </Button>
                                                    </div>
                                                )}

                                                {activeWsIdForWebhook === ws.id && ws.role === "OWNER" && (
                                                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 bg-black/50 border border-[var(--accent)]/30 p-4 relative">
                                                        <div className="text-[10px] uppercase tracking-widest text-[#00E676] font-bold mb-2 flex items-center gap-2">
                                                            <Webhook size={12} /> {t.workspaces.edgeEvent}
                                                        </div>
                                                        <Input
                                                            type="url"
                                                            value={webhookUrl}
                                                            onChange={(e) => setWebhookUrl(e.target.value)}
                                                            placeholder={t.workspaces.webhookPlaceholder}
                                                            className="font-mono tracking-widest"
                                                        />
                                                        <div className="flex flex-col sm:flex-row gap-2 items-start mt-2">
                                                            <div className="flex-1 w-full">
                                                                <Input
                                                                    type="text"
                                                                    value={webhookDesc}
                                                                    onChange={(e) => setWebhookDesc(e.target.value)}
                                                                    placeholder={t.workspaces.descOptional}
                                                                    className="uppercase tracking-widest"
                                                                />
                                                            </div>
                                                            <Button variant="glass-accent" onClick={() => handleRegisterWebhook(ws.id)} disabled={!webhookUrl || isCreating} className="text-xs shrink-0 h-[54px] px-6 hover:shadow-[0_0_15px_var(--accent)]">
                                                                {t.workspaces.bindWebhook}
                                                            </Button>
                                                            <Button variant="ghost" onClick={() => setActiveWsIdForWebhook(null)} className="shrink-0 px-2 h-[54px] text-white/50">
                                                                {t.workspaces.cancel}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {activeWorkspace && (
                        <>
                            <div className="w-full h-px bg-white/5" />
                            <div className="space-y-4">
                                <h2 className="text-[10px] font-bold tracking-widest uppercase text-white/70 flex items-center gap-2">
                                    <FileText size={14} /> {t.workspaces.auditLogTitle}
                                </h2>
                                <p className="text-[10px] uppercase font-mono text-white/50 mb-4">
                                    {t.workspaces.auditLogDesc}
                                </p>
                                <DataGrid
                                    data={auditLogs}
                                    columns={[
                                        { id: "timestamp", header: t.workspaces.gridTime, width: "15%", render: (row: any) => new Date(row.timestamp).toLocaleString() },
                                        { id: "action", header: t.workspaces.gridAction, width: "20%" },
                                        { id: "user", header: t.workspaces.gridUser, width: "25%", render: (row: any) => <span className="opacity-75">{row.user}</span> },
                                        { id: "details", header: t.workspaces.gridDetails, width: "40%", render: (row: any) => <span className="text-white/40">{row.details}</span> }
                                    ]}
                                    searchable={true}
                                />
                            </div>
                        </>
                    )}

                </div>
            </GlassCard>

            <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

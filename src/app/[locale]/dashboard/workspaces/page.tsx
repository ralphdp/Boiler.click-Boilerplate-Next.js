"use client";

import { useSession } from "next-auth/react";
import { SolidCard } from "@/components/ui/SolidCard";
import { Button } from "@/components/ui/Button";
import { DataGrid } from "@/components/ui/DataGrid";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Link from "next/link";
import { ArrowLeft, LayoutGrid, Plus, Users, ShieldAlert, Activity, Webhook, FileText } from "lucide-react";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { getUserWorkspaces, createWorkspace, inviteWorkspaceMember, getWorkspaceAuditLogs, softDeleteWorkspace } from "@/core/actions/workspaces";
import { registerWebhook } from "@/core/actions/webhooks";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/core/utils";
import { motion } from "framer-motion";
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
    const [isDeletingWs, setIsDeletingWs] = useState<string | null>(null);

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

    const handleDelete = async (wsId: string) => {
        setIsCreating(true);
        const res = await softDeleteWorkspace(wsId);
        if (res.success) {
            toast({ title: "Substrate Severed", description: "The workspace has been successfully deleted.", type: "success" });
            await loadWorkspaces();
        } else {
            toast({ title: "Deletion Fault", description: res.message, type: "error" });
        }
        setIsDeletingWs(null);
        setIsCreating(false);
    };

    return (
        <main className="relative min-h-[100dvh] flex flex-col items-center justify-start p-6 pt-24 text-white overflow-hidden pb-32">
            <div className="w-full max-w-4xl mb-6">
                <Button as={Link} href={`/${language}/dashboard`} variant="ghost" className="w-fit text-white/50 px-0 hover:text-white">
                    <ArrowLeft size={14} />
                    {t.settings.backToTerminal}
                </Button>
            </div>

            <div className="w-full max-w-4xl space-y-8">
                {/* Header Context */}
                <div className="space-y-2 text-left">
                    <h1 className="text-2xl font-bold tracking-normal text-white flex items-center gap-3">
                        <LayoutGrid size={24} className="text-[var(--accent)]" />
                        {t.workspaces.title}
                    </h1>
                    <p className="text-sm text-white/50">
                        {t.workspaces.subtitle}
                    </p>
                </div>

                {/* 1. Command Center SolidCard */}
                <SolidCard className="w-full p-6 text-left">
                    <h2 className="text-xs font-semibold text-white/70 mb-4">{t.workspaces.initNew}</h2>
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        <div className="flex-1">
                            <Input
                                type="text"
                                value={newWsName}
                                onChange={(e) => setNewWsName(e.target.value)}
                                placeholder={t.workspaces.wsTitlePlaceholder}
                                className="bg-[#0a0a0a]"
                            />
                        </div>
                        <Button
                            onClick={handleCreate}
                            disabled={!newWsName || isCreating}
                            variant="solid-accent"
                            className="sm:w-fit h-[54px] px-8 shrink-0"
                            tooltip="Initialize a new sovereign workspace node."
                            tooltipTerm="WS_INIT"
                        >
                            <Plus size={14} /> {t.workspaces.create}
                        </Button>
                    </div>
                </SolidCard>

                {/* 2. The Roster */}
                <SolidCard className="w-full p-6 space-y-6 text-left">
                    <h2 className="text-xs font-semibold text-white/70 flex items-center justify-between">
                        {t.workspaces.activeDirs}
                        {(session?.user as any)?.activeWorkspace && (
                            <Button
                                variant="outline"
                                onClick={handleExitContext}
                                disabled={loading}
                                className="text-[9px] h-6 px-3 border-red-500/30 text-red-500 hover:bg-red-500/10 w-fit"
                            >
                                {t.workspaces.exitWorkspace}
                            </Button>
                        )}
                    </h2>

                    {loading ? (
                        <p className="text-white/30 text-sm animate-pulse">{t.workspaces.scanning}</p>
                    ) : workspaces.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 border border-white/5 bg-[#0a0a0a] flex flex-col items-center justify-center space-y-3">
                            <div className="w-8 h-8 rounded-full border border-white/5 bg-white/5 flex items-center justify-center mb-2">
                                <LayoutGrid size={14} className="text-white/30" />
                            </div>
                            <p className="text-white/50 text-sm font-semibold">{t.workspaces.noWorkspaces}</p>
                            <p className="text-white/30 text-xs text-center max-w-xs">Initialize a new node via the Command Center above.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial="hidden"
                            animate="show"
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.1 }
                                }
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            {workspaces.map((ws, i) => {
                                const isActive = (session?.user as any)?.activeWorkspace === ws.id;
                                return (
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, y: 10 },
                                            show: { opacity: 1, y: 0 }
                                        }}
                                        key={ws.id}
                                        className={cn("p-5 bg-[#050505] border flex flex-col justify-between gap-6 transition-colors duration-200", isActive ? "border-[var(--accent)]" : "border-white/10 hover:border-white/20")}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                                    {ws.name}
                                                    {isActive && (
                                                        <span className="text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 font-bold px-2 py-0.5 rounded-sm">{t.workspaces.activeBadge}</span>
                                                    )}
                                                </h3>
                                                <p className="text-xs font-mono text-white/40 mt-1">{t.workspaces.idLabel} {ws.id}</p>
                                            </div>
                                            <div className="px-2.5 py-1 bg-black text-[10px] font-bold text-white/70 border border-white/10 rounded-sm">
                                                {ws.role}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                                            <Button
                                                variant={isActive ? "ghost" : "solid"}
                                                onClick={() => handleSwitchContext(ws)}
                                                className={cn("flex-1 h-10 text-[10px]", isActive && "text-[var(--accent)] opacity-50 cursor-default")}
                                                disabled={loading || isActive}
                                            >
                                                <Activity size={14} className="mr-2" /> {isActive ? 'Context Active' : t.workspaces.enterContext}
                                            </Button>

                                            {['OWNER', 'ADMIN'].includes(ws.role) && (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setActiveWsIdForInvite(ws.id)}
                                                    className="w-10 h-10 !p-0 flex items-center justify-center border border-white/10 hover:border-white/30 hover:bg-white/5"
                                                    title={t.workspaces.inviteHandshake}
                                                >
                                                    <Users size={14} />
                                                </Button>
                                            )}

                                            {ws.role === "OWNER" && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => setActiveWsIdForWebhook(ws.id)}
                                                        className="w-10 h-10 !p-0 flex items-center justify-center border border-[#00E676]/20 text-[#00E676]/50 hover:bg-[#00E676]/10 hover:border-[#00E676]/50 hover:text-[#00E676]"
                                                        title={t.workspaces.mountWebhook}
                                                    >
                                                        <Webhook size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => setIsDeletingWs(ws.id)}
                                                        className="w-10 h-10 !p-0 flex items-center justify-center text-red-500/50 hover:text-red-500 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/50"
                                                        title={t.workspaces.deleteSubstrate}
                                                        disabled={loading}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </SolidCard>

                {/* 3. Audit Substrate */}
                {activeWorkspace && (
                    <SolidCard className="w-full p-6 space-y-4 text-left">
                        <h2 className="text-xs font-semibold text-white/70 flex items-center gap-2">
                            <FileText size={14} /> {t.workspaces.auditLogTitle}
                        </h2>
                        <p className="text-sm text-white/50 mb-4">
                            {t.workspaces.auditLogDesc}
                        </p>
                        <DataGrid
                            data={auditLogs}
                            columns={[
                                { id: "timestamp", header: t.workspaces.gridTime, width: "15%", render: (row: any) => new Date(row.timestamp || Date.now()).toLocaleString() },
                                { id: "action", header: t.workspaces.gridAction, width: "20%" },
                                { id: "user", header: t.workspaces.gridUser, width: "25%", render: (row: any) => <span className="opacity-75">{row.actor?.email || row.user || "SYSTEM"}</span> },
                                { id: "details", header: t.workspaces.gridDetails, width: "40%", render: (row: any) => <span className="text-white/40">{row.description || row.details || row.message || "Automated operation."}</span> }
                            ]}
                            searchable={true}
                        />
                    </SolidCard>
                )}
            </div>

            <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={!!isDeletingWs}
                title={t.workspaces.confirmDeleteTitle}
                description={t.workspaces.confirmDeleteDesc}
                confirmText={t.workspaces.deleteSubstrate}
                onConfirm={() => isDeletingWs && handleDelete(isDeletingWs)}
                onCancel={() => setIsDeletingWs(null)}
                variant="danger"
            />

            <Modal
                isOpen={!!activeWsIdForInvite}
                onClose={() => setActiveWsIdForInvite(null)}
                title={t.workspaces.inviteHandshake}
                description="Transmit a membership invitation to the target identity."
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-normal font-bold text-white/50">{t.workspaces.targetEmail}</label>
                        <Input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="architect@ethos.log"
                            className="bg-black/40 h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-normal font-bold text-white/50">Node Clearance</label>
                        <Select
                            options={[
                                { value: "VIEWER", label: "VIEWER (READ ONLY)" },
                                { value: "EDITOR", label: "EDITOR (READ/WRITE)" },
                                { value: "ADMIN", label: "ADMIN (FULL ACCESS)" }
                            ]}
                            value={inviteRole}
                            onChange={(val) => setInviteRole(val as any)}
                            className="h-12"
                        />
                    </div>
                    <div className="pt-6 flex justify-end gap-3 border-t border-white/5">
                        <Button
                            variant="outline"
                            className="border-white/5 bg-white/5 hover:bg-white/10 px-8"
                            onClick={() => setActiveWsIdForInvite(null)}
                        >
                            {t.workspaces.cancel}
                        </Button>
                        <Button
                            variant="solid-accent"
                            className="px-8"
                            onClick={() => activeWsIdForInvite && handleInvite(activeWsIdForInvite)}
                            disabled={!inviteEmail || isCreating}
                        >
                            {t.workspaces.send}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={!!activeWsIdForWebhook}
                onClose={() => setActiveWsIdForWebhook(null)}
                title={t.workspaces.mountWebhook}
                description={t.workspaces.edgeEvent}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-normal font-bold text-[var(--accent)]">Target Endpoint URL</label>
                        <Input
                            type="url"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder={t.workspaces.webhookPlaceholder}
                            className="font-mono bg-black/60 border-[var(--accent)]/30 text-[var(--accent)] placeholder:text-[var(--accent)]/30 h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] tracking-normal font-bold text-white/50">{t.workspaces.descOptional}</label>
                        <Input
                            type="text"
                            value={webhookDesc}
                            onChange={(e) => setWebhookDesc(e.target.value)}
                            placeholder="e.g. Stripe Relay"
                            className="bg-black/40 h-12"
                        />
                    </div>
                    <div className="pt-6 flex justify-end gap-3 border-t border-white/5">
                        <Button
                            variant="outline"
                            className="border-white/5 bg-white/5 hover:bg-white/10 px-8"
                            onClick={() => setActiveWsIdForWebhook(null)}
                        >
                            {t.workspaces.cancel}
                        </Button>
                        <Button
                            variant="solid"
                            className="border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)]/10 px-8"
                            onClick={() => activeWsIdForWebhook && handleRegisterWebhook(activeWsIdForWebhook)}
                            disabled={!webhookUrl || isCreating}
                        >
                            {t.workspaces.bindWebhook}
                        </Button>
                    </div>
                </div>
            </Modal>

        </main>
    );
}

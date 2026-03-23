import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Eye, ShieldCheck, UserX, CheckSquare, Square } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CipherGate } from "@/components/ui/CipherGate";
import { useToast } from "@/components/ui/Toast";
import { exportSovereignNodesCSV, bulkUpdateNodeRoles, bulkUpdateNodeStatus } from "@/core/actions/nodes";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";

interface AdminNodesProps {
    t: any;
    nodes: any[];
    loading: boolean;
    updatingNode: string | null;
    handleRoleChange: (uid: string, newRole: "ADMIN" | "USER") => Promise<void>;
    handleStatusChange: (uid: string, currentlyDisabled: boolean) => Promise<void>;
    onImpersonate: (node: any) => void;
    session: any;
    superAdminEmail?: string;
}

export function AdminNodes({
    t,
    nodes,
    loading,
    updatingNode,
    handleRoleChange,
    handleStatusChange,
    onImpersonate,
    session,
    superAdminEmail
}: AdminNodesProps) {
    const { toast } = useToast();
    const [nodeSearch, setNodeSearch] = useState("");
    const [nodePage, setNodePage] = useState(1);
    const [activeRoleNode, setActiveRoleNode] = useState<string | null>(null);
    const [roleDropdownRect, setRoleDropdownRect] = useState<DOMRect | null>(null);

    // Selection & Filter State
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BANNED">("ALL");

    // Secure Actions State
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        description: string;
        variant: 'danger' | 'warning' | 'info';
        action: () => void;
        requireCipher?: boolean;
    }>({ open: false, title: "", description: "", variant: "info", action: () => { } });

    const [cipherAction, setCipherAction] = useState<{ open: boolean, onConfirm: () => void } | null>(null);

    const closeConfirm = () => setConfirmModal(prev => ({ ...prev, open: false }));

    const filteredNodes = nodes.filter(n => {
        const matchesSearch = (n.email || "").toLowerCase().includes(nodeSearch.toLowerCase()) ||
            (n.uid || "").toLowerCase().includes(nodeSearch.toLowerCase()) ||
            (n.displayName || "").toLowerCase().includes(nodeSearch.toLowerCase());

        const isNodeAdmin = n.customClaims?.role === "ADMIN" || n.email === superAdminEmail;

        let matchesRole = true;
        if (roleFilter === "ADMIN") matchesRole = isNodeAdmin;
        if (roleFilter === "USER") matchesRole = !isNodeAdmin;

        const matchesStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? !n.disabled : n.disabled);

        return matchesSearch && matchesRole && matchesStatus;
    });
    const paginatedNodes = filteredNodes.slice((nodePage - 1) * 50, nodePage * 50);
    const totalNodePages = Math.ceil(filteredNodes.length / 50);

    const handleExport = async () => {
        const res = await exportSovereignNodesCSV();
        if (res.success && res.csv) {
            const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `identity_audit_matrix_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "Audit Export Successful", description: "Identity Matrix transitioned to local storage.", type: "success" });
        } else {
            toast({ title: "Export Failed", description: res.message, type: "error" });
        }
    };

    const toggleSelectAll = () => {
        const selectableNodes = paginatedNodes.filter(n => n.email !== superAdminEmail && n.email !== session?.user?.email);

        if (selectedNodes.length === selectableNodes.length && selectableNodes.length > 0) {
            setSelectedNodes([]);
        } else {
            setSelectedNodes(selectableNodes.map(n => n.uid));
        }
    };

    const toggleSelectNode = (node: any) => {
        const isRestricted = node.email === superAdminEmail || node.email === session?.user?.email;
        if (isRestricted) return;

        setSelectedNodes(prev => prev.includes(node.uid) ? prev.filter(id => id !== node.uid) : [...prev, node.uid]);
    };

    const handleBulkRoleUpdate = async (role: "ADMIN" | "USER") => {
        const res = await bulkUpdateNodeRoles(selectedNodes, role);
        if (res.success) {
            toast({ title: "Bulk Update Complete", description: `Updated ${selectedNodes.length} nodes to ${role}.`, type: "success" });
            setSelectedNodes([]);
            window.location.reload();
        } else {
            toast({ title: "Bulk Update Failed", description: res.message, type: "error" });
        }
    }

    const handleBulkStatusUpdate = async (disabled: boolean) => {
        const res = await bulkUpdateNodeStatus(selectedNodes, disabled);
        if (res.success) {
            toast({ title: "Bulk Status Updated", description: `Updated ${selectedNodes.length} nodes to ${disabled ? 'BANNED' : 'ACTIVE'}.`, type: "success" });
            setSelectedNodes([]);
            window.location.reload();
        } else {
            toast({ title: "Bulk Status Update Failed", description: res.message, type: "error" });
        }
    }

    return (
        <motion.div
            key="nodes-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="bg-black/40 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent opacity-30" />

                <div className="p-4 md:p-6 border-b border-white/5 bg-white/5">
                    <div className="flex flex-col gap-1 shrink-0">
                        <h3 className="text-xs font-semibold tracking-normal] text-[var(--accent)] flex items-center gap-2">
                            Identity Audit Matrix
                        </h3>
                        <span className="text-[8px] font-mono text-white/30 tracking-normal]">Sovereign Node Governance Protocol</span>
                    </div>
                </div>

                <div className="p-4 md:p-6 border-b border-white/5 bg-black/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch lg:items-center gap-3 w-full lg:w-auto">
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                            <Select
                                options={[
                                    { label: "All Roles", value: "ALL" },
                                    { label: "Roots", value: "ADMIN" },
                                    { label: "Users", value: "USER" },
                                ]}
                                value={roleFilter}
                                onChange={(val) => { setRoleFilter(val as any); setNodePage(1); }}
                                className="w-full sm:w-36"
                            />

                            <Select
                                options={[
                                    { label: "All Status", value: "ALL" },
                                    { label: "Active", value: "ACTIVE" },
                                    { label: "Banned", value: "BANNED" },
                                ]}
                                value={statusFilter}
                                onChange={(val) => { setStatusFilter(val as any); setNodePage(1); }}
                                className="w-full sm:w-36"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 lg:w-96">
                            <div className="relative flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search by ID or email..."
                                    value={nodeSearch}
                                    onChange={(e) => { setNodeSearch(e.target.value); setNodePage(1); }}
                                    icon={<Search size={14} />}
                                    className="h-[54px]"
                                />
                            </div>
                            <Button
                                variant="solid"
                                onClick={handleExport}
                                className="shrink-0 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 h-[54px] text-xs font-semibold tracking-normal transition-colors text-white/70 hover:text-white"
                                tooltip="Export the entire identity audit matrix to a local CSV buffer."
                                tooltipTerm="EXPORT_AUDIT"
                            >
                                <Download size={14} /> <span>Export Audit</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {selectedNodes.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-[var(--accent)]/10 border-b border-[var(--accent)]/30 p-3 flex flex-wrap items-center justify-between px-4 z-20 gap-4"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold tracking-normal] text-[var(--accent)]">
                                    {selectedNodes.length} Nodes Selected
                                </span>
                                <span className="text-[8px] font-mono text-white/30 tracking-normal hidden sm:inline">| Bulk Management Mode Active</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="solid"
                                    onClick={() => handleBulkRoleUpdate("ADMIN")}
                                    className="bg-[var(--accent)]/20 hover:bg-[var(--accent)]/40 border-[var(--accent)]/50 text-[var(--accent)] text-xs font-semibold tracking-normal h-auto py-2"
                                    tooltip="Escalate all selected nodes to Root administrative status."
                                    tooltipTerm="BULK_ESCALATE"
                                >
                                    <ShieldCheck size={12} /> Escalate to Root
                                </Button>
                                <Button
                                    variant="solid"
                                    onClick={() => handleBulkRoleUpdate("USER")}
                                    className="border-white/10 text-white/70 text-xs font-semibold tracking-normal h-auto py-2"
                                    tooltip="Downgrade all selected nodes to standard User status."
                                    tooltipTerm="BULK_DOWNGRADE"
                                >
                                    Downgrade to User
                                </Button>
                                <div className="w-[1px] h-6 bg-white/10 mx-1 hidden sm:block" />
                                <Button
                                    variant="solid"
                                    onClick={() => handleBulkStatusUpdate(true)}
                                    className="bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-500 text-xs font-semibold tracking-normal h-auto py-2"
                                    tooltip="Instantly neutralize authorization for all selected nodes."
                                    tooltipTerm="BULK_NEUTRALIZE"
                                >
                                    <UserX size={12} /> Neutralize Nodes
                                </Button>
                                <Button
                                    variant="solid"
                                    onClick={() => handleBulkStatusUpdate(false)}
                                    className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-500 text-xs font-semibold tracking-normal h-auto py-2"
                                    tooltip="Restore authorization protocols for all selected nodes."
                                    tooltipTerm="BULK_RESTORE"
                                >
                                    Restore Authorization
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="w-full max-h-[600px] overflow-y-auto overflow-x-auto admin-scrollbar">
                    <table className="w-full min-w-[800px] text-left border-collapse text-xs font-mono">
                        <thead>
                            <tr className="bg-white/5 text-white/50 sticky top-0 z-10 backdrop-blur-md">
                                <th className="p-4 w-10">
                                    <button onClick={toggleSelectAll} className="text-white/30 hover:text-white transition-colors">
                                        {selectedNodes.length > 0 && selectedNodes.length === paginatedNodes.filter(n => n.email !== superAdminEmail && n.email !== session?.user?.email).length ? <CheckSquare size={16} className="text-[var(--accent)]" /> : <Square size={16} />}
                                    </button>
                                </th>
                                <th className="p-4 font-normal tracking-normal">{t.admin.users.colId}</th>
                                <th className="p-4 font-normal tracking-normal">{t.admin.users.colName}</th>
                                <th className="p-4 font-normal tracking-normal">{t.admin.users.colEmail}</th>
                                <th className="p-4 font-normal tracking-normal">{t.admin.users.colRole}</th>
                                <th className="p-4 font-normal tracking-normal">{t.admin.users.colStatus}</th>
                                <th className="p-4 font-normal tracking-normal">{t.admin.users.colAuthType}</th>
                                <th className="p-4 font-normal tracking-normal text-right">{t.admin.users.colActions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={8} className="p-8 text-center text-white/30 animate-pulse">{t.admin.users.loading}</td></tr>
                            ) : nodes.length === 0 ? (
                                <tr><td colSpan={8} className="p-8 text-center text-white/30">{t.admin.users.notFound}</td></tr>
                            ) : (
                                paginatedNodes.map((node) => (
                                    <tr key={node.uid} className={`hover:bg-white/5 transition-colors group ${selectedNodes.includes(node.uid) ? 'bg-[var(--accent)]/5' : ''}`}>
                                        <td className="p-4">
                                            <button
                                                onClick={() => toggleSelectNode(node)}
                                                className={`transition-colors ${(node.email === superAdminEmail || node.email === session?.user?.email) ? 'text-white/5 cursor-not-allowed' : 'text-white/30 hover:text-white'}`}
                                                disabled={node.email === superAdminEmail || node.email === session?.user?.email}
                                            >
                                                {selectedNodes.includes(node.uid) ? <CheckSquare size={16} className="text-[var(--accent)]" /> : <Square size={16} />}
                                            </button>
                                        </td>
                                        <td className="p-4 text-white/40 group-hover:text-[var(--accent)] transition-colors">{node.uid.substring(0, 8)}...</td>
                                        <td className="p-4">{node.displayName}</td>
                                        <td className="p-4 font-bold">{node.email}</td>
                                        <td className="p-4">
                                            <div className="relative inline-block w-full max-w-[90px]">
                                                <Button
                                                    variant="solid"
                                                    onClick={(e) => {
                                                        if (activeRoleNode === node.uid) {
                                                            setActiveRoleNode(null);
                                                        } else {
                                                            setRoleDropdownRect(e.currentTarget.getBoundingClientRect());
                                                            setActiveRoleNode(node.uid);
                                                        }
                                                    }}
                                                    className="border-white/10 text-[10px] h-auto py-2 min-w-[70px] text-left tracking-normal font-semibold text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                                                    disabled={updatingNode === node.uid || node.email === superAdminEmail || node.email === session?.user?.email}
                                                    tooltip="Modify the systemic authorization role for this node."
                                                    tooltipTerm="MODIFY_ROLE"
                                                >
                                                    {updatingNode === node.uid ? t.admin.users.syncing : (node.customClaims?.role === "ADMIN" || node.email === superAdminEmail ? t.admin.users.root : t.admin.users.user)}
                                                </Button>
                                                {activeRoleNode === node.uid && roleDropdownRect && typeof document !== 'undefined' && createPortal(
                                                    <>
                                                        <div className="fixed inset-0 z-[1000] cursor-default" onClick={() => setActiveRoleNode(null)} />
                                                        <div
                                                            className="fixed z-[1001] bg-black/99 backdrop-blur-2xl border border-white/10 flex flex-col shadow-2xl p-1 gap-1 min-w-[70px]"
                                                            style={{
                                                                top: `${roleDropdownRect.bottom + 8}px`,
                                                                left: `${roleDropdownRect.left}px`
                                                            }}
                                                        >
                                                            {["USER", "ADMIN"].map(roleOpt => (
                                                                <button
                                                                    type="button"
                                                                    key={roleOpt}
                                                                    onClick={() => {
                                                                        const isUpgrade = roleOpt === "ADMIN";
                                                                        setConfirmModal({
                                                                            open: true,
                                                                            title: isUpgrade ? t.admin.users.roleUpgradeTitle : t.admin.users.roleDowngradeTitle,
                                                                            description: isUpgrade ? t.admin.users.roleUpgradeDesc : t.admin.users.roleDowngradeDesc,
                                                                            variant: isUpgrade ? "warning" : "danger",
                                                                            requireCipher: isUpgrade,
                                                                            action: () => handleRoleChange(node.uid, roleOpt as "ADMIN" | "USER")
                                                                        });
                                                                        setActiveRoleNode(null);
                                                                    }}
                                                                    className={`px-3 py-2 text-[10px] font-black tracking-widest text-left transition-colors uppercase ${(node.customClaims?.role === "ADMIN" && roleOpt === "ADMIN") || (node.customClaims?.role !== "ADMIN" && roleOpt === "USER")
                                                                        ? 'bg-white/10 text-white'
                                                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                                                        }`}
                                                                >
                                                                    {roleOpt === "ADMIN" ? t.admin.users.root : t.admin.users.user}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>,
                                                    document.body
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Button
                                                variant="solid"
                                                onClick={() => {
                                                    setConfirmModal({
                                                        open: true,
                                                        title: node.disabled ? t.admin.users.unbanTitle : t.admin.users.banTitle,
                                                        description: node.disabled ? t.admin.users.unbanDesc : t.admin.users.banDesc,
                                                        variant: node.disabled ? "info" : "danger",
                                                        requireCipher: !node.disabled,
                                                        action: () => handleStatusChange(node.uid, node.disabled)
                                                    });
                                                }}
                                                className={`text-[10px] h-auto py-1 min-w-[70px] uppercase tracking-widest font-black transition-colors ${node.disabled
                                                    ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white"
                                                    : "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white"
                                                    }`}
                                                disabled={updatingNode === node.uid || node.email === superAdminEmail || node.email === session?.user?.email}
                                                tooltip={node.disabled ? "Restore authorization for this node." : "Instantly neutralize this node's access."}
                                                tooltipTerm={node.disabled ? "NODE_RESTORE" : "NODE_NEUTRALIZE"}
                                            >
                                                {updatingNode === node.uid ? t.admin.users.syncing : (node.disabled ? t.admin.users.banned : t.admin.users.active)}
                                            </Button>
                                        </td>
                                        <td className="p-4 text-white/50 capitalize">{node.provider.replace('.com', '')}</td>
                                        <td className="p-4 text-right">
                                            <Button
                                                variant="solid"
                                                onClick={() => onImpersonate(node)}
                                                className="border-white/10 text-[10px] h-auto py-2 font-bold tracking-normal hover:bg-[var(--accent)] hover:text-black transition-colors disabled:opacity-30"
                                                disabled={node.email === session?.user?.email || node.email === superAdminEmail}
                                                tooltip="Temporarily assume this node's identity for diagnostic observation."
                                                tooltipTerm="IMPERSONATE_NODE"
                                            >
                                                <Eye size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalNodePages > 1 && (
                    <div className="p-4 border-t border-white/5 bg-white/5 flex justify-between items-center text-xs font-mono text-white/50">
                        <div>{t.admin.overview.showing} {(nodePage - 1) * 50 + 1}-{Math.min(nodePage * 50, filteredNodes.length)} {t.admin.overview.of} {filteredNodes.length}</div>
                        <div className="flex gap-2">
                            <button onClick={() => setNodePage(p => Math.max(1, p - 1))} disabled={nodePage === 1} className="px-3 py-1 bg-black/50 border border-white/10 disabled:opacity-30 hover:bg-white/5 text-[10px] font-semibold tracking-normal text-white transition-colors">{t.admin.overview.prev}</button>
                            <button onClick={() => setNodePage(p => Math.min(totalNodePages, p + 1))} disabled={nodePage === totalNodePages} className="px-3 py-1 bg-black/50 border border-white/10 disabled:opacity-30 hover:bg-white/5 text-[10px] font-semibold tracking-normal text-white transition-colors">{t.admin.overview.next}</button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={confirmModal.open}
                title={confirmModal.title}
                description={confirmModal.description}
                variant={confirmModal.variant}
                onConfirm={() => {
                    if (confirmModal.requireCipher) {
                        setCipherAction({ open: true, onConfirm: confirmModal.action });
                        closeConfirm();
                    } else {
                        confirmModal.action();
                        closeConfirm();
                    }
                }}
                onCancel={closeConfirm}
            />

            {
                cipherAction?.open && (
                    <CipherGate
                        t={t}
                        onSuccess={() => {
                            cipherAction.onConfirm();
                            setCipherAction(null);
                        }}
                        onCancel={() => setCipherAction(null)}
                    />
                )
            }
        </motion.div >
    );
}

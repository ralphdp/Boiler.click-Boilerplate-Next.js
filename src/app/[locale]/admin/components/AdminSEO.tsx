"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Save, Trash2, Plus, Globe, Shield, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { SolidCard } from "@/components/ui/SolidCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { getSEOMatrix, updateSEORoute } from "@/core/actions/branding";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CipherGate } from "@/components/ui/CipherGate";

interface SEORouteData {
    route: string;
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    noIndex?: boolean;
}

export function AdminSEO({ t }: { t: any }) {
    const { toast } = useToast();
    const [matrix, setMatrix] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [newRoute, setNewRoute] = useState("");
    const [editingRoute, setEditingRoute] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<SEORouteData>>({});

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

    useEffect(() => {
        loadMatrix();
    }, []);

    async function loadMatrix() {
        setLoading(true);
        try {
            const data = await getSEOMatrix();
            if (Array.isArray(data)) {
                setMatrix(data);
            } else {
                setMatrix([]);
            }
        } catch (e) {
            toast({ title: "Substrate Load Fault", description: "Could not retrieve SEO matrix.", type: "error" });
        }
        setLoading(false);
    }

    async function handleSave(route: string, data: any) {
        try {
            await updateSEORoute(route, data);
            toast({ title: "SEO Synchronized", description: `Matrix updated for ${route}`, type: "success" });
            setEditingRoute(null);
            loadMatrix();
        } catch (e) {
            toast({ title: "Broadcast Failed", description: "Metadata injection fault.", type: "error" });
        }
    }

    async function handleDelete(route: string) {
        setConfirmModal({
            open: true,
            title: "Decommission SEO Route",
            description: `Are you sure you want to decommission SEO overrides for ${route}? This cannot be reversed easily.`,
            variant: "danger",
            requireCipher: true,
            action: async () => {
                try {
                    await updateSEORoute(route, {});
                    toast({ title: "SEO Decommissioned", description: `Overrides removed for ${route}`, type: "success" });
                    loadMatrix();
                } catch (e) {
                    toast({ title: "Fault", description: "Failed to purge metadata.", type: "error" });
                }
            }
        });
    }

    const filteredMatrix = matrix.filter(m => m.route.includes(search));

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-black/40 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent opacity-30" />

                <div className="p-4 md:p-6 border-b border-white/5 bg-white/5">
                    <div className="flex flex-col gap-1 shrink-0">
                        <h3 className="text-xs font-semibold tracking-normal] text-[var(--accent)] flex items-center gap-2">
                            Sovereign SEO Matrix
                        </h3>
                        <span className="text-[8px] font-mono text-white/30 tracking-normal]">Decentralized Metadata Stewardship Protocol</span>
                    </div>
                </div>

                <div className="p-4 md:p-6 border-b border-white/5 bg-black/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch lg:items-center gap-3 w-full lg:w-auto">
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                            <Input
                                type="text"
                                placeholder="/new-route"
                                value={newRoute}
                                onChange={(e) => setNewRoute(e.target.value)}
                                className="h-[54px] w-full sm:w-40"
                            />
                            <Button
                                onClick={() => {
                                    if (!newRoute) return;
                                    setEditingRoute(newRoute);
                                    setEditData({ route: newRoute });
                                    setNewRoute("");
                                }}
                                className="h-[54px] px-6 bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-xs font-semibold tracking-normal text-white hover:bg-[var(--accent)]/30 transition-all flex items-center justify-center gap-2 shrink-0"
                                tooltip="Initialize a new metadata override route in the SEO matrix."
                                tooltipTerm="ROUTE_PROVISION"
                            >
                                <Plus size={14} /> Add Route
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 lg:w-96">
                            <div className="relative flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search routes..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    icon={<Search size={14} />}
                                    className="h-[54px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full max-h-[600px] overflow-y-auto overflow-x-auto admin-scrollbar">
                    {loading ? (
                        <div className="p-12 text-center text-white/20 animate-pulse tracking-normal] text-[10px] font-semibold">Synchronizing Substrate...</div>
                    ) : filteredMatrix.length === 0 && !editingRoute ? (
                        <div className="p-12 text-center text-white/10 tracking-normal] text-[10px] font-semibold h-[200px] flex items-center justify-center">No Route Overrides Defined</div>
                    ) : (
                        <table className="w-full min-w-[800px] text-left border-collapse text-xs font-mono">
                            <thead>
                                <tr className="bg-white/5 text-white/50 sticky top-0 z-10 backdrop-blur-md">
                                    <th className="p-4 font-normal tracking-normal">Identity (Route)</th>
                                    <th className="p-4 font-normal tracking-normal">Metadata Overrides</th>
                                    <th className="p-4 font-normal tracking-normal">Indexing</th>
                                    <th className="p-4 font-normal text-right tracking-normal">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {editingRoute && (
                                    <tr className="bg-[var(--accent)]/5 border-b border-[var(--accent)]/20 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <td colSpan={4} className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="text-[10px] font-semibold tracking-normal] text-[var(--accent)]">Editing Matrix Node: {editingRoute}</h4>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="solid"
                                                            onClick={() => setEditingRoute(null)}
                                                            className="px-4 py-2 border-none bg-transparent text-white/50 hover:text-white"
                                                            tooltip="Abort the current metadata modification."
                                                            tooltipTerm="MOD_ABORT"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleSave(editingRoute, editData)}
                                                            className="px-6 py-2 bg-[var(--accent)] border border-[var(--accent)]/50 text-[10px] font-semibold tracking-normal text-black hover:brightness-110 transition-all"
                                                            tooltip="Broadcast the calibrated metadata to the global matrix substrate."
                                                            tooltipTerm="METADATA_BROADCAST"
                                                        >
                                                            Broadcast Changes
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-[9px] font-semibold tracking-normal text-white/30 block mb-2">Matrix Title</label>
                                                            <Input
                                                                value={editData.title || ""}
                                                                onChange={e => setEditData({ ...editData, title: e.target.value })}
                                                                placeholder="Page Specific Title"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[9px] font-semibold tracking-normal text-white/30 block mb-2">Metadata Description</label>
                                                            <Input
                                                                value={editData.description || ""}
                                                                onChange={e => setEditData({ ...editData, description: e.target.value })}
                                                                placeholder="SEO Description overwrite..."
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-[9px] font-semibold tracking-normal text-white/30 block mb-2">Keywords (CSV)</label>
                                                            <Input
                                                                value={editData.keywords || ""}
                                                                onChange={e => setEditData({ ...editData, keywords: e.target.value })}
                                                                placeholder="crypto, sovereign, vanguard..."
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[9px] font-semibold tracking-normal text-white/30 block mb-2">OG Image URL</label>
                                                                <Input
                                                                    value={editData.ogImage || ""}
                                                                    onChange={e => setEditData({ ...editData, ogImage: e.target.value })}
                                                                    placeholder="/og.png"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-semibold tracking-normal text-white/30 block mb-2">Indexing Guard</label>
                                                                <Select
                                                                    value={editData.noIndex ? "TRUE" : "FALSE"}
                                                                    onChange={val => setEditData({ ...editData, noIndex: val === "TRUE" })}
                                                                    options={[
                                                                        { label: "Indexable (Public)", value: "FALSE" },
                                                                        { label: "No-Index (Shielded)", value: "TRUE" }
                                                                    ]}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {filteredMatrix.map((item) => (
                                    <tr key={item.route} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center font-mono text-[10px] text-[var(--accent)] shrink-0">
                                                    <Globe size={14} />
                                                </div>
                                                <span className="font-mono text-xs font-semibold tracking-normal">{item.route}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-mono text-white/30 flex items-center gap-1.5">
                                                    <span className={item.title ? "text-[var(--accent)]" : ""}>T</span>
                                                    <span className={item.description ? "text-[var(--accent)]" : ""}>D</span>
                                                    <span className={item.ogImage ? "text-[var(--accent)]" : ""}>I</span>
                                                    <span className={item.keywords ? "text-[var(--accent)]" : ""}>K</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {item.noIndex ? (
                                                <span className="text-[8px] px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-500 font-semibold tracking-normal flex items-center gap-1 w-fit">
                                                    <Shield size={8} /> No Index
                                                </span>
                                            ) : (
                                                <span className="text-[8px] px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-500 font-semibold tracking-normal flex items-center gap-1 w-fit">
                                                    <Globe size={8} /> Public
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="solid"
                                                    onClick={() => {
                                                        setEditingRoute(item.route);
                                                        setEditData(item);
                                                    }}
                                                    className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/30 text-[9px] font-semibold tracking-normal transition-all h-auto"
                                                    tooltip="Recalibrate the metadata overrides for this route."
                                                    tooltipTerm="ROUTE_RECALIBRATE"
                                                >
                                                    Modify
                                                </Button>
                                                <Button
                                                    variant="solid"
                                                    onClick={() => handleDelete(item.route)}
                                                    className="p-2 border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-all h-auto"
                                                    tooltip="Purge all metadata overrides for this route from the matrix."
                                                    tooltipTerm="ROUTE_PURGE"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
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

            {cipherAction?.open && (
                <CipherGate
                    t={t}
                    onSuccess={() => {
                        cipherAction.onConfirm();
                        setCipherAction(null);
                    }}
                    onCancel={() => setCipherAction(null)}
                />
            )}
        </motion.div>
    );
}

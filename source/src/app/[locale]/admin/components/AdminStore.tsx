"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import {
    Plus, EyeOff, Eye, Trash2, Check, ArrowUp, ArrowDown,
    ChevronDown as ChevronDownIcon, Edit2, X, Search, Download,
    ArrowLeft, ArrowRight
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import {
    setCommerceMode, setPricingMatrix, getStoreProducts,
    bulkImportStoreProducts, createStoreProduct, updateStoreProduct,
    deleteStoreProduct, setSandboxMode as setSandboxModeAction,
    bulkUpdateStoreProducts, bulkDeleteStoreProducts
} from "@/core/actions/admin";
import { sanitizeSearchQuery } from "@/core/security/input-sanitization";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CipherGate } from "@/components/ui/CipherGate";

interface AdminStoreProps {
    t: any;
    commerceMode: string;
    setCommerceModeUI: (val: string) => void;
    pricingTiers: any[];
    setPricingTiers: (val: any[]) => void;
    recommendedPlan: string;
    setRecommendedPlan: (val: string) => void;
    sandboxMode: boolean;
    setSandboxMode: (val: boolean) => void;
}

export function AdminStore({
    t,
    commerceMode,
    setCommerceModeUI,
    pricingTiers,
    setPricingTiers,
    recommendedPlan,
    setRecommendedPlan,
    sandboxMode,
    setSandboxMode
}: AdminStoreProps) {
    const { toast } = useToast();
    const router = useRouter();

    // Store Management State
    const [storeProducts, setStoreProducts] = useState<any[]>([]);
    const [totalStoreProducts, setTotalStoreProducts] = useState(0);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [storeSearchInput, setStoreSearchInput] = useState("");
    const [storeSearch, setStoreSearch] = useState("");
    const [storePage, setStorePage] = useState(1);
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
    const [productForm, setProductForm] = useState({ id: "", name: "", description: "", price: "", imageUrl: "", stripeLink: "" });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
        if (commerceMode === 'store') {
            loadStoreProducts();
        }
    }, [commerceMode, storeSearch, storePage]);

    const loadStoreProducts = async () => {
        setLoadingProducts(true);
        const res = await getStoreProducts(storeSearch, 50, storePage - 1);
        setStoreProducts(res.items || []);
        setTotalStoreProducts(res.totalCount || 0);
        setLoadingProducts(false);
    };

    return (
        <motion.div
            key="store-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-6"
        >
            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{t.admin.store.storeMode}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.store.storeModeDesc}</p>
                </div>
                <div className="flex flex-wrap w-full justify-start gap-4">
                    {['saas', 'store', 'none'].map((variant) => (
                        <button
                            key={variant}
                            onClick={async () => {
                                if (variant === commerceMode) return;

                                const isDeactivating = variant === 'none';
                                setConfirmModal({
                                    open: true,
                                    title: isDeactivating ? t.admin.store.deactivateStoreTitle : t.admin.store.saasPricing, // Reusing if possible or better title
                                    description: isDeactivating ? t.admin.store.deactivateStoreDesc : `Switch commerce mode to ${variant.toUpperCase()}?`,
                                    variant: isDeactivating ? "danger" : "warning",
                                    requireCipher: isDeactivating,
                                    action: async () => {
                                        const res = await setCommerceMode(variant);
                                        if (res.success) {
                                            setCommerceModeUI(variant);
                                            router.refresh();
                                        }
                                    }
                                });
                            }}
                            className={`border text-xs px-6 py-2 outline-none min-w-[100px] uppercase tracking-widest font-bold transition-colors shadow-2xl ${commerceMode === variant ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black/50 border-white/10 text-white/80 hover:bg-white/5 focus:border-[var(--accent)]'}`}
                        >
                            {variant}
                        </button>
                    ))}
                </div>
            </GlassCard>

            {
                commerceMode === 'saas' && (
                    <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col gap-4 md:col-span-2">
                        <div className="space-y-4 text-left flex flex-col w-full">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{t.admin.store.saasPricing}</h3>
                                    <p className="text-xs font-serif italic text-white/50">{t.admin.store.saasPricingDesc}</p>
                                </div>
                                {pricingTiers.length < 4 && (
                                    <button onClick={() => {
                                        const newId = `tier_${Date.now()}`;
                                        setPricingTiers([...pricingTiers, {
                                            id: newId,
                                            name: t.admin.store.newTier,
                                            price: "0",
                                            features: [{ name: t.admin.store.feature1, active: true }, { name: t.admin.store.feature2, active: true }],
                                            buttonText: t.admin.store.getAccess,
                                            stripeLink: ""
                                        }]);
                                    }} className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/40 px-3 py-1 uppercase font-bold tracking-widest border border-[var(--accent)] ml-auto sm:ml-0 flex items-center gap-2">
                                        <Plus size={12} /> {t.admin.store.addTier}
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
                                <span className="text-xs font-mono text-white/50">{t.admin.store.recommended}</span>
                                <div className="flex flex-wrap border border-white/10 overflow-hidden">
                                    {pricingTiers.map(tier => (
                                        <button key={tier.id} onClick={() => setRecommendedPlan(tier.id)} className={`px-3 py-1 text-xs font-bold uppercase ${recommendedPlan === tier.id ? 'bg-[var(--accent)] text-white' : 'bg-black/50 text-white/50 hover:bg-white/5'}`}>{tier.name || t.admin.store.tier}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
                            {pricingTiers.map((tier, tIdx) => (
                                <div key={tier.id} className={`space-y-4 bg-white/5 border p-5 relative flex flex-col ${recommendedPlan === tier.id ? 'border-[var(--accent)]/50 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]' : 'border-white/10'}`}>
                                    {recommendedPlan === tier.id && <div className="absolute -top-2.5 right-4 bg-[var(--accent)] text-[10px] text-white px-2 py-0.5 font-bold uppercase tracking-widest">{t.admin.store.recommended.replace(':', '')}</div>}

                                    <div className="text-xs font-bold text-white mb-2 uppercase tracking-widest flex justify-between items-center">
                                        {t.admin.store.tier} {tIdx + 1}
                                        <div className="flex gap-2">
                                            <button onClick={() => {
                                                const newTiers = [...pricingTiers];
                                                newTiers[tIdx].hidden = !newTiers[tIdx].hidden;
                                                setPricingTiers(newTiers);
                                            }} className={`p-1 ${tier.hidden ? 'text-white/30 hover:text-white/50' : 'text-green-500 hover:text-green-400'}`}>
                                                {tier.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            <button onClick={() => {
                                                setConfirmModal({
                                                    open: true,
                                                    title: t.admin.store.deleteTierTitle,
                                                    description: t.admin.store.deleteTierDesc,
                                                    variant: "danger",
                                                    action: () => {
                                                        setPricingTiers(pricingTiers.filter((_, i) => i !== tIdx));
                                                        if (recommendedPlan === tier.id) setRecommendedPlan("");
                                                    }
                                                });
                                            }} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                                        </div>
                                    </div>

                                    <Input type="text" placeholder={t.admin.store.tierNamePlace} className="font-mono font-bold w-full" value={tier.name} onChange={(e) => {
                                        const newTiers = [...pricingTiers];
                                        newTiers[tIdx].name = e.target.value;
                                        setPricingTiers(newTiers);
                                    }} />

                                    <Input type="text" placeholder={t.admin.store.tierPricePlace} className="font-mono text-lg w-full" value={tier.price} onChange={(e) => {
                                        const newTiers = [...pricingTiers];
                                        newTiers[tIdx].price = e.target.value;
                                        setPricingTiers(newTiers);
                                    }} />

                                    <div className="space-y-2 pt-2 border-t border-white/10 flex-grow">
                                        <div className="text-[10px] uppercase font-bold text-white/50 px-1">{t.admin.store.checkmarkFeatures}</div>
                                        {tier.features.map((feat: any, fIdx: number) => {
                                            const isActive = typeof feat === 'string' ? true : feat.active !== false;
                                            const featureName = typeof feat === 'string' ? feat : feat.name;

                                            return (
                                                <div key={fIdx} className="flex gap-2 items-center">
                                                    <button onClick={() => {
                                                        const newTiers = [...pricingTiers];
                                                        if (typeof newTiers[tIdx].features[fIdx] === 'string') {
                                                            newTiers[tIdx].features[fIdx] = { name: newTiers[tIdx].features[fIdx], active: false };
                                                        } else {
                                                            newTiers[tIdx].features[fIdx].active = !newTiers[tIdx].features[fIdx].active;
                                                        }
                                                        setPricingTiers(newTiers);
                                                    }} className={`w-5 h-5 flex items-center justify-center shrink-0 border ${isActive ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-black/50 border-white/20 text-transparent hover:border-white/40'}`}>
                                                        <Check size={12} className={isActive ? 'opacity-100' : 'opacity-0'} />
                                                    </button>
                                                    <Input type="text" placeholder={t.admin.store.featurePlace} className={`w-full font-mono ${isActive ? 'text-white' : 'text-white/30 line-through'}`} value={featureName} onChange={(e) => {
                                                        const newTiers = [...pricingTiers];
                                                        if (typeof newTiers[tIdx].features[fIdx] === 'string') {
                                                            newTiers[tIdx].features[fIdx] = { name: e.target.value, active: true };
                                                        } else {
                                                            newTiers[tIdx].features[fIdx].name = e.target.value;
                                                        }
                                                        setPricingTiers(newTiers);
                                                    }} />
                                                    <div className="flex flex-col gap-0.5 shrink-0">
                                                        <button disabled={fIdx === 0} onClick={() => {
                                                            const newTiers = [...pricingTiers];
                                                            const temp = newTiers[tIdx].features[fIdx];
                                                            newTiers[tIdx].features[fIdx] = newTiers[tIdx].features[fIdx - 1];
                                                            newTiers[tIdx].features[fIdx - 1] = temp;
                                                            setPricingTiers(newTiers);
                                                        }} className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/20 disabled:opacity-20 disabled:hover:bg-white/5"><ArrowUp size={10} /></button>
                                                        <button disabled={fIdx === tier.features.length - 1} onClick={() => {
                                                            const newTiers = [...pricingTiers];
                                                            const temp = newTiers[tIdx].features[fIdx];
                                                            newTiers[tIdx].features[fIdx] = newTiers[tIdx].features[fIdx + 1];
                                                            newTiers[tIdx].features[fIdx + 1] = temp;
                                                            setPricingTiers(newTiers);
                                                        }} className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/20 disabled:opacity-20 disabled:hover:bg-white/5"><ArrowDown size={10} /></button>
                                                    </div>
                                                    <button onClick={() => {
                                                        const newTiers = [...pricingTiers];
                                                        newTiers[tIdx].features.splice(fIdx, 1);
                                                        setPricingTiers(newTiers);
                                                    }} className="w-5 h-5 flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 shrink-0"><Trash2 size={12} /></button>
                                                </div>
                                            )
                                        })}
                                        <button onClick={() => {
                                            const newTiers = [...pricingTiers];
                                            newTiers[tIdx].features.push({ name: "", active: true });
                                            setPricingTiers(newTiers);
                                        }} className="w-full text-xs py-1.5 border border-dashed border-white/20 text-white/50 hover:bg-white/5 hover:text-white uppercase tracking-widest font-bold flex items-center justify-center gap-2 mt-1"><Plus size={12} /> {t.admin.store.addFeature}</button>
                                    </div>

                                    <Input type="text" placeholder={t.admin.store.stripeCheckoutLink} className="font-mono mt-auto w-full" value={tier.stripeLink || ""} onChange={(e) => {
                                        const newTiers = [...pricingTiers];
                                        newTiers[tIdx].stripeLink = e.target.value;
                                        setPricingTiers(newTiers);
                                    }} />

                                    <Input type="text" placeholder={t.admin.store.buttonTextPlace} className="font-mono w-full" value={tier.buttonText} onChange={(e) => {
                                        const newTiers = [...pricingTiers];
                                        newTiers[tIdx].buttonText = e.target.value;
                                        setPricingTiers(newTiers);
                                    }} />
                                </div>
                            ))}
                        </div>
                        <div className="flex w-full justify-start mt-2">
                            <button
                                onClick={async () => {
                                    const res = await setPricingMatrix({
                                        pricingTiers, recommendedPlan
                                    });
                                    if (res.success) {
                                        toast({ title: t.admin.store.matrixUpdated, description: t.admin.store.recalibrated, type: "success" });
                                    }
                                }}
                                className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)]/40 hover:text-white"
                            >
                                Save Pricing Config
                            </button>
                        </div>
                    </GlassCard>
                )
            }

            {
                commerceMode === 'store' && (
                    <div className="flex flex-col gap-4 md:col-span-2">
                        <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                                <div className="space-y-2 text-left">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{t.admin.store.catalogUpdate}</h3>
                                    <p className="text-xs font-serif italic text-white/50">{t.admin.store.catalogDesc}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="relative group">
                                        <div className="flex bg-[var(--accent)] text-white font-bold uppercase tracking-widest text-xs h-[54px] border border-[var(--accent)]/50 items-stretch">
                                            <button
                                                onClick={() => { setIsEditingProduct(false); setProductForm({ id: "", name: "", description: "", price: "", imageUrl: "", stripeLink: "" }); setIsStoreModalOpen(true); }}
                                                className="px-6 flex items-center justify-center gap-2 hover:bg-black/20 transition-colors h-full text-white hover:text-white"
                                            >
                                                <Plus size={14} /> {t.admin.store.addProduct}
                                            </button>
                                            <div className="w-[1px] bg-black/20" />
                                            <button
                                                onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                                                className="px-4 flex items-center justify-center hover:bg-black/20 transition-colors h-full text-white hover:text-white"
                                            >
                                                <ChevronDownIcon size={14} className={`transition-transform duration-300 ${isStoreDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                        </div>
                                        <AnimatePresence>
                                            {isStoreDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                                    exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                                                    className="absolute right-0 top-[60px] z-50 w-48 bg-black border border-white/10 shadow-2xl flex flex-col items-start origin-top-right overflow-hidden"
                                                >
                                                    <label className="w-full text-left px-4 py-4 text-[10px] technical tracking-widest hover:bg-white/5 cursor-pointer uppercase text-white/70 hover:text-white transition-colors flex items-center gap-2">
                                                        <ArrowUp size={14} /> {t.admin.store.importCsv}
                                                        <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                                                            setIsStoreDropdownOpen(false);
                                                            if (!e.target.files?.[0]) return;
                                                            const text = await e.target.files[0].text();
                                                            const rows = text.split("\n").slice(1).filter(r => r.trim());
                                                            const prods = rows.map(r => {
                                                                const parts = r.split(",");
                                                                const name = parts[0]?.replace(/"/g, '');
                                                                const price = parseFloat(parts[1]) || 0;
                                                                return { name, price, description: parts[2] || '', imageUrl: parts[3] || '', stripeLink: parts[4] || '' };
                                                            });
                                                            setConfirmModal({
                                                                open: true,
                                                                title: t.admin.store.importConfirmTitle || "Catalog Import Pulse",
                                                                description: `${t.admin.store.importConfirm} ${prods.length} ${t.admin.store.catalogUpdate.toLowerCase()}?`,
                                                                variant: "warning",
                                                                requireCipher: true,
                                                                action: async () => {
                                                                    setLoadingProducts(true);
                                                                    const res = await bulkImportStoreProducts(prods);
                                                                    if (res.success) {
                                                                        toast({ title: t.admin.store.importSuccessTitle, description: `${t.admin.store.importSuccessDesc} ${prods.length}.`, type: "success" });
                                                                        setStorePage(1);
                                                                        loadStoreProducts();
                                                                    }
                                                                    setLoadingProducts(false);
                                                                }
                                                            });
                                                            e.target.value = '';
                                                        }} />
                                                    </label>
                                                    <button
                                                        onClick={async () => {
                                                            setIsStoreDropdownOpen(false);
                                                            const exportData = await getStoreProducts("", 10000, 0);
                                                            const csvContent = "data:text/csv;charset=utf-8,Name,Price,Description,ImageUrl,StripeLink\n" + exportData.items.map((p: any) => `"${p.name || ''}",${p.price || 0},"${p.description || ''}","${p.imageUrl || ''}","${p.stripeLink || ''}"`).join("\n");
                                                            const encodedUri = encodeURI(csvContent);
                                                            const link = document.createElement("a");
                                                            link.setAttribute("href", encodedUri);
                                                            link.setAttribute("download", `store_export_${new Date().toISOString()}.csv`);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                        }}
                                                        className="w-full text-left px-4 py-4 text-[10px] technical tracking-widest hover:bg-white/5 uppercase text-white/70 hover:text-white transition-colors flex items-center gap-2 border-t border-white/5"
                                                    >
                                                        <Download size={14} /> {t.admin.store.exportCsv}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Matrix Filters */}
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 border border-white/5 relative overflow-hidden">
                                <AnimatePresence>
                                    {selectedIds.length > 0 && (
                                        <motion.div
                                            initial={{ y: 50, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 50, opacity: 0 }}
                                            className="absolute inset-0 z-20 bg-[var(--accent)] flex items-center justify-between px-6"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-black font-black uppercase tracking-[0.2em] text-[10px]">{selectedIds.length} {t.admin.store.selected}</span>
                                                <button onClick={() => setSelectedIds([])} className="text-black/50 hover:text-black p-1"><X size={14} /></button>
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={async () => {
                                                        const price = prompt(t.admin.store.bulkPricePrompt);
                                                        if (price) {
                                                            const res = await bulkUpdateStoreProducts(selectedIds, { price: parseFloat(price) });
                                                            if (res.success) {
                                                                toast({ title: t.admin.store.bulkUpdated, type: "success" });
                                                                setSelectedIds([]);
                                                                loadStoreProducts();
                                                            }
                                                        }
                                                    }}
                                                    className="bg-black/10 hover:bg-black/20 text-black px-4 py-1.5 uppercase tracking-widest font-black text-[10px] border border-black/10 transition-colors"
                                                >
                                                    {t.admin.store.bulkPrice}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setConfirmModal({
                                                            open: true,
                                                            title: t.admin.store.bulkDeleteTitle,
                                                            description: `${t.admin.store.bulkDeleteDesc} ${selectedIds.length} ${t.admin.store.items.toLowerCase()}?`,
                                                            variant: "danger",
                                                            requireCipher: true,
                                                            action: async () => {
                                                                const res = await bulkDeleteStoreProducts(selectedIds);
                                                                if (res.success) {
                                                                    toast({ title: t.admin.store.bulkDeleted, type: "success" });
                                                                    setSelectedIds([]);
                                                                    loadStoreProducts();
                                                                }
                                                            }
                                                        });
                                                    }}
                                                    className="bg-red-500 text-white px-4 py-1.5 uppercase tracking-widest font-black text-[10px] hover:bg-red-600 transition-colors"
                                                >
                                                    {t.admin.store.bulkDelete}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="relative w-full md:w-96 flex">
                                    <Input
                                        type="text"
                                        placeholder={t.admin.store.searchPrefix}
                                        value={storeSearchInput}
                                        onChange={(e) => setStoreSearchInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setStorePage(1);
                                                const sanitized = sanitizeSearchQuery(storeSearchInput);
                                                setStoreSearch(sanitized);
                                            }
                                        }}
                                        icon={<Search size={14} />}
                                    />
                                </div>
                                <div className="text-xs font-mono text-white/50">{totalStoreProducts} {t.admin.store.matchingRecords}</div>
                            </div>

                            {/* Dense Data Table */}
                            <div className="overflow-x-auto border border-white/10 bg-black/40">
                                <table className="w-full text-left text-xs text-white/70">
                                    <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/40 border-b border-white/10">
                                        <tr>
                                            <th className="px-4 py-3 w-10">
                                                <button
                                                    onClick={() => {
                                                        if (selectedIds.length === storeProducts.length) setSelectedIds([]);
                                                        else setSelectedIds(storeProducts.map(p => p.id));
                                                    }}
                                                    className={`w-4 h-4 border flex items-center justify-center ${selectedIds.length > 0 && selectedIds.length === storeProducts.length ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white/5 border-white/20'}`}
                                                >
                                                    {selectedIds.length > 0 && selectedIds.length === storeProducts.length && <Check size={10} className="text-white" />}
                                                </button>
                                            </th>
                                            <th className="px-4 py-3 font-medium">{t.admin.store.productId}</th>
                                            <th className="px-4 py-3 font-medium">{t.admin.store.name}</th>
                                            <th className="px-4 py-3 font-medium">{t.admin.store.price}</th>
                                            <th className="px-4 py-3 font-medium text-right">{t.admin.store.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-mono">
                                        {loadingProducts ? (
                                            <tr><td colSpan={4} className="px-4 py-8 text-center text-white/30">{t.admin.store.syncingSubstrate}</td></tr>
                                        ) : storeProducts.length === 0 ? (
                                            <tr><td colSpan={4} className="px-4 py-8 text-center text-white/30">{t.admin.store.noLogicObjects}</td></tr>
                                        ) : storeProducts.map((p: any) => (
                                            <tr key={p.id} className={`hover:bg-white/5 transition-colors ${selectedIds.includes(p.id) ? 'bg-[var(--accent)]/5' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => {
                                                            if (selectedIds.includes(p.id)) setSelectedIds(selectedIds.filter(id => id !== p.id));
                                                            else setSelectedIds([...selectedIds, p.id]);
                                                        }}
                                                        className={`w-4 h-4 border flex items-center justify-center ${selectedIds.includes(p.id) ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white/5 border-white/20'}`}
                                                    >
                                                        {selectedIds.includes(p.id) && <Check size={10} className="text-white" />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-white/30 tracking-widest">{p.id?.slice(0, 8)}</td>
                                                <td className="px-4 py-3 text-white font-sans">{p.name}</td>
                                                <td className="px-4 py-3 text-[var(--accent)]">${p.price}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => { setIsEditingProduct(true); setProductForm(p); setIsStoreModalOpen(true); }} className="p-1.5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"><Edit2 size={14} /></button>
                                                        <button onClick={async () => {
                                                            setConfirmModal({
                                                                open: true,
                                                                title: t.admin.store.confirmDeleteTitle || "Decommission Product",
                                                                description: t.admin.store.confirmDelete,
                                                                variant: "danger",
                                                                requireCipher: true,
                                                                action: async () => {
                                                                    const res = await deleteStoreProduct(p.id);
                                                                    if (res.success) {
                                                                        setStoreProducts(storeProducts.filter((prod: any) => prod.id !== p.id));
                                                                        setTotalStoreProducts(prev => prev - 1);
                                                                        toast({ title: "Node Decommissioned", description: "Product purged from catalog.", type: "success" });
                                                                    }
                                                                }
                                                            });
                                                        }} className="p-1.5 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalStoreProducts > 0 && (
                                <div className="flex justify-between items-center p-4 border-t border-white/5 bg-white/5">
                                    <div className="text-xs text-white/50 font-mono tracking-widest">
                                        {t.admin.store.pagePrefix} {storePage} {t.admin.store.pageOf} {Math.max(1, Math.ceil(totalStoreProducts / 50))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setStorePage(Math.max(1, storePage - 1))}
                                            disabled={storePage === 1}
                                            className="bg-black/50 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed p-2 text-white transition-colors"
                                        >
                                            <ArrowLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() => setStorePage(Math.min(Math.ceil(totalStoreProducts / 50), storePage + 1))}
                                            disabled={storePage >= Math.ceil(totalStoreProducts / 50)}
                                            className="bg-black/50 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed p-2 text-white transition-colors"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </GlassCard>

                        {/* Modal Editor */}
                        {isStoreModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                <GlassCard className="w-full max-w-2xl border border-white/10 bg-black p-6 flex flex-col gap-6 relative shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                                    <button onClick={() => setIsStoreModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20} /></button>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{isEditingProduct ? t.admin.store.modalEdit : t.admin.store.modalNew}</h3>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Input
                                                type="text"
                                                placeholder={t.admin.store.modalNamePlace}
                                                value={productForm.name}
                                                onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                            />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder={t.admin.store.modalPricePlace}
                                                value={productForm.price}
                                                onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                            />
                                            <div className="md:col-span-2">
                                                <Input
                                                    type="text"
                                                    placeholder={t.admin.store.modalImageUrl}
                                                    value={productForm.imageUrl}
                                                    onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Input
                                                    type="text"
                                                    placeholder={t.admin.store.modalDesc}
                                                    value={productForm.description}
                                                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Input
                                                    type="text"
                                                    placeholder={t.admin.store.stripeCheckoutLink}
                                                    value={productForm.stripeLink}
                                                    onChange={e => setProductForm({ ...productForm, stripeLink: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (!productForm.name || !productForm.price) return toast({ title: t.admin.store.validationError, description: t.admin.store.nameAndPriceReq, type: "error" });
                                                if (isEditingProduct && productForm.id) {
                                                    const res = await updateStoreProduct(productForm.id, productForm);
                                                    if (res.success) {
                                                        setStoreProducts(storeProducts.map((p: any) => p.id === productForm.id ? productForm : p));
                                                        setIsEditingProduct(false);
                                                        setProductForm({ id: "", name: "", description: "", price: "", imageUrl: "", stripeLink: "" });
                                                        setIsStoreModalOpen(false);
                                                    }
                                                } else {
                                                    const res = await createStoreProduct(productForm);
                                                    if (res.success) {
                                                        setStoreProducts([...storeProducts, { ...productForm, id: res.id }]);
                                                        setProductForm({ id: "", name: "", description: "", price: "", imageUrl: "", stripeLink: "" });
                                                        setTotalStoreProducts(prev => prev + 1);
                                                        setIsStoreModalOpen(false);
                                                    }
                                                }
                                            }}
                                            className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-[var(--accent)] text-xs px-6 py-3 outline-none focus:border-white uppercase tracking-widest font-bold transition-colors hover:bg-[var(--accent)] hover:text-black w-full"
                                        >
                                            {isEditingProduct ? t.admin.store.btnUpdateNode : t.admin.store.btnCommitNode}
                                        </button>
                                    </div>
                                </GlassCard>
                            </div>
                        )}
                    </div>
                )
            }

            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-widest">{t.admin.store.sandboxMode}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.store.sandboxDesc}</p>
                </div>
                <div className="flex w-full justify-start">
                    <button
                        onClick={async () => {
                            const newState = !sandboxMode;
                            setSandboxMode(newState);
                            const res = await setSandboxModeAction(newState);
                            if (res.success) {
                                router.refresh();
                            } else {
                                setSandboxMode(!newState);
                            }
                        }}
                        className={`w-12 h-6 rounded-full relative transition-colors border shrink-0 ${sandboxMode ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-white/10 border-white/20'}`}
                        aria-pressed={sandboxMode}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${sandboxMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </GlassCard>

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

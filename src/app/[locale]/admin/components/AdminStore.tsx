"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SolidCard } from "@/components/ui/SolidCard";
import { Input } from "@/components/ui/Input";
import {
    Plus, EyeOff, Eye, Trash2, Check, ArrowUp, ArrowDown,
    ChevronDown as ChevronDownIcon, Edit2, X, Search, Download,
    ArrowLeft, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import {
    setCommerceMode, setPricingMatrix, getStoreProducts,
    bulkImportStoreProducts, createStoreProduct, updateStoreProduct,
    deleteStoreProduct, bulkUpdateStoreProducts, bulkDeleteStoreProducts
} from "@/core/actions/commerce";
import { setSandboxMode as setSandboxModeAction } from "@/core/actions/branding";
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
            <SolidCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold tracking-normal text-[var(--accent)]">{t.admin.store.storeMode}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.store.storeModeDesc}</p>
                </div>
                <div className="flex flex-wrap w-full justify-start gap-4">
                    {['saas', 'store', 'none'].map((variant) => (
                        <Button
                            key={variant}
                            variant="solid"
                            onClick={async () => {
                                if (variant === commerceMode) return;

                                const isDeactivating = variant === 'none';
                                setConfirmModal({
                                    open: true,
                                    title: isDeactivating ? t.admin.store.deactivateStoreTitle : t.admin.store.saasPricing,
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
                            className={`min-w-[100px] h-auto py-2 ${commerceMode === variant ? 'bg-[var(--accent)] border-[var(--accent)] text-white hover:bg-[var(--accent)]' : 'border-white/10 text-white/80'}`}
                            tooltip={`Toggle the architectural commerce engine to ${variant.toUpperCase()} mode.`}
                            tooltipTerm="COMMERCE_MODE_SHIFT"
                        >
                            {variant === 'saas' ? 'Saas' : variant === 'store' ? 'Store' : 'None'}
                        </Button>
                    ))}
                </div>
            </SolidCard>

            {
                commerceMode === 'saas' && (
                    <SolidCard className="border border-white/5 bg-black/40 p-6 flex flex-col gap-4 md:col-span-2">
                        <div className="space-y-4 text-left flex flex-col w-full">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                                <div>
                                    <h3 className="text-sm font-bold tracking-normal text-[var(--accent)]">{t.admin.store.saasPricing}</h3>
                                    <p className="text-xs font-serif italic text-white/50">{t.admin.store.saasPricingDesc}</p>
                                </div>
                                {pricingTiers.length < 4 && (
                                    <Button
                                        variant="solid"
                                        onClick={() => {
                                            const newId = `tier_${Date.now()}`;
                                            setPricingTiers([...pricingTiers, {
                                                id: newId,
                                                name: t.admin.store.newTier,
                                                price: "0",
                                                features: [{ name: t.admin.store.feature1, active: true }, { name: t.admin.store.feature2, active: true }],
                                                buttonText: t.admin.store.getAccess,
                                                stripeLink: ""
                                            }]);
                                        }}
                                        className="bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)] h-auto py-1 px-3 ml-auto sm:ml-0"
                                        tooltip="Provision a new subscription tier in the pricing matrix."
                                        tooltipTerm="PRICING_PROVISION"
                                    >
                                        <Plus size={12} className="mr-2" /> {t.admin.store.addTier}
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
                                <span className="text-xs font-mono text-white/50">{t.admin.store.recommended}</span>
                                <div className="flex flex-wrap border border-white/10 overflow-hidden">
                                    {pricingTiers.map(tier => (
                                        <Button
                                            key={tier.id}
                                            variant="solid"
                                            onClick={() => setRecommendedPlan(tier.id)}
                                            className={`h-auto py-1 px-3 rounded-none border-none ${recommendedPlan === tier.id ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]' : 'text-white/50 hover:text-white'}`}
                                            tooltip="Flag this tier as the recommended entry point for citizens."
                                            tooltipTerm="FLAG_RECOMMENDED"
                                        >
                                            {tier.name || t.admin.store.tier}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-2">
                            {pricingTiers.map((tier, tIdx) => (
                                <div key={tier.id} className={`space-y-4 bg-white/5 border p-5 relative flex flex-col ${recommendedPlan === tier.id ? 'border-[var(--accent)]/50 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]' : 'border-white/10'}`}>
                                    {recommendedPlan === tier.id && <div className="absolute -top-2.5 right-4 bg-[var(--accent)] text-[10px] text-white px-2 py-0.5 font-bold tracking-normal">{t.admin.store.recommended.replace(':', '')}</div>}

                                    <div className="text-xs font-bold text-white mb-2 tracking-normal flex justify-between items-center">
                                        {t.admin.store.tier} {tIdx + 1}
                                        <div className="flex gap-2">
                                            <Tooltip content={tier.hidden ? "Reveal this tier in the public matrix." : "Conceal this tier from the public matrix."} term={tier.hidden ? "TIER_REVEAL" : "TIER_CONCEAL"}>
                                                <button onClick={() => {
                                                    const newTiers = [...pricingTiers];
                                                    newTiers[tIdx].hidden = !newTiers[tIdx].hidden;
                                                    setPricingTiers(newTiers);
                                                }} className={`p-1 ${tier.hidden ? 'text-white/30 hover:text-white/50' : 'text-green-500 hover:text-green-400'}`}>
                                                    {tier.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </Tooltip>
                                            <Tooltip content="Purge this pricing tier from the substrate matrix." term="TIER_PURGE">
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
                                            </Tooltip>
                                        </div>
                                    </div>

                                    <Input type="text" placeholder={t.admin.store.tierNamePlace} className="font-mono font-bold w-full" value={tier.name} onChange={(e) => {
                                        const newTiers = [...pricingTiers];
                                        newTiers[tIdx].name = e.target.value;
                                        setPricingTiers(newTiers);
                                    }} onBlur={async () => {
                                        await setPricingMatrix({ pricingTiers, recommendedPlan });
                                    }} />

                                    <Input type="text" placeholder={t.admin.store.tierPricePlace} className="font-mono text-lg w-full" value={tier.price} onChange={(e) => {
                                        const newTiers = [...pricingTiers];
                                        newTiers[tIdx].price = e.target.value;
                                        setPricingTiers(newTiers);
                                    }} onBlur={async () => {
                                        await setPricingMatrix({ pricingTiers, recommendedPlan });
                                    }} />

                                    <div className="space-y-2 pt-2 border-t border-white/10 flex-grow">
                                        <div className="text-[10px] font-bold text-white/50 px-1">{t.admin.store.checkmarkFeatures}</div>
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
                                                    }} onBlur={async () => {
                                                        await setPricingMatrix({ pricingTiers, recommendedPlan });
                                                    }} />
                                                    <div className="flex flex-col gap-0.5 shrink-0">
                                                        <Tooltip content="Elevate feature priority." term="FEATURE_ELEVATE">
                                                            <button disabled={fIdx === 0} onClick={() => {
                                                                const newTiers = [...pricingTiers];
                                                                const temp = newTiers[tIdx].features[fIdx];
                                                                newTiers[tIdx].features[fIdx] = newTiers[tIdx].features[fIdx - 1];
                                                                newTiers[tIdx].features[fIdx - 1] = temp;
                                                                setPricingTiers(newTiers);
                                                            }} className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/20 disabled:opacity-20 disabled:hover:bg-white/5"><ArrowUp size={10} /></button>
                                                        </Tooltip>
                                                        <Tooltip content="Deprioritize feature position." term="FEATURE_DEPRIORITIZE">
                                                            <button disabled={fIdx === tier.features.length - 1} onClick={() => {
                                                                const newTiers = [...pricingTiers];
                                                                const temp = newTiers[tIdx].features[fIdx];
                                                                newTiers[tIdx].features[fIdx] = newTiers[tIdx].features[fIdx + 1];
                                                                newTiers[tIdx].features[fIdx + 1] = temp;
                                                                setPricingTiers(newTiers);
                                                            }} className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/20 disabled:opacity-20 disabled:hover:bg-white/5"><ArrowDown size={10} /></button>
                                                        </Tooltip>
                                                    </div>
                                                    <Tooltip content="Purge feature from this tier." term="FEATURE_PURGE">
                                                        <button onClick={() => {
                                                            const newTiers = [...pricingTiers];
                                                            newTiers[tIdx].features.splice(fIdx, 1);
                                                            setPricingTiers(newTiers);
                                                        }} className="w-5 h-5 flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 shrink-0"><Trash2 size={12} /></button>
                                                    </Tooltip>
                                                </div>
                                            )
                                        })}
                                        <Button
                                            variant="solid"
                                            onClick={() => {
                                                const newTiers = [...pricingTiers];
                                                newTiers[tIdx].features.push({ name: "", active: true });
                                                setPricingTiers(newTiers);
                                            }}
                                            className="w-full h-auto py-1.5 border-dashed border-white/20 text-white/50 hover:text-white mt-1"
                                            tooltip="Append a new operational capacity to this tier."
                                            tooltipTerm="FEATURE_APPEND"
                                        >
                                            <Plus size={12} className="mr-2" /> {t.admin.store.addFeature}
                                        </Button>
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
                            <Button
                                variant="solid"
                                onClick={async () => {
                                    const res = await setPricingMatrix({
                                        pricingTiers, recommendedPlan
                                    });
                                    if (res.success) {
                                        toast({ title: t.admin.store.matrixUpdated, description: t.admin.store.recalibrated, type: "success" });
                                    }
                                }}
                                className="bg-[var(--accent)]/20 border-[var(--accent)]/50 text-[var(--accent)] h-auto py-2 px-6 hover:bg-[var(--accent)]/40 hover:text-white"
                                tooltip="Synchronize the current pricing matrix configuration to the persistent substrate."
                                tooltipTerm="MATRIX_SYNC"
                            >
                                Save Pricing Config
                            </Button>
                        </div>
                    </SolidCard>
                )
            }

            {
                commerceMode === 'store' && (
                    <div className="flex flex-col gap-4 md:col-span-2">
                        <SolidCard className="border border-white/5 bg-black/40 p-6 flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                                <div className="space-y-2 text-left">
                                    <h3 className="text-sm font-bold tracking-normal text-[var(--accent)]">{t.admin.store.catalogUpdate}</h3>
                                    <p className="text-xs font-serif italic text-white/50">{t.admin.store.catalogDesc}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="relative group">
                                        <div className="flex bg-[var(--accent)] text-white font-bold tracking-normal text-xs h-[54px] border border-[var(--accent)]/50 items-stretch">
                                            <Button
                                                variant="outline"
                                                onClick={() => { setIsEditingProduct(false); setProductForm({ id: "", name: "", description: "", price: "", imageUrl: "", stripeLink: "" }); setIsStoreModalOpen(true); }}
                                                className="px-6 rounded-none border-none h-full bg-transparent hover:bg-black/20 text-white hover:text-white"
                                                tooltip="Initialize a new commerce object in the store catalog."
                                                tooltipTerm="PRODUCT_INIT"
                                            >
                                                <Plus size={14} className="mr-2" /> {t.admin.store.addProduct}
                                            </Button>
                                            <div className="w-[1px] bg-black/20" />
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                                                className="px-4 rounded-none border-none h-full bg-transparent hover:bg-black/20 text-white hover:text-white"
                                                tooltip="Access advanced catalog operations (Import/Export)."
                                                tooltipTerm="CATALOG_OPS"
                                            >
                                                <ChevronDownIcon size={14} className={`transition-transform duration-300 ${isStoreDropdownOpen ? 'rotate-180' : ''}`} />
                                            </Button>
                                        </div>
                                        <AnimatePresence>
                                            {isStoreDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                                    exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                                                    className="absolute right-0 top-[60px] z-50 w-48 bg-black border border-white/10 shadow-2xl flex flex-col items-start origin-top-right overflow-hidden"
                                                >
                                                    <Tooltip content="Ingest catalog objects from a CSV buffer." term="CATALOG_INGEST" className="w-full">
                                                        <label className="w-full text-left px-4 py-4 text-[10px] tracking-normal hover:bg-white/5 cursor-pointer text-white/70 hover:text-white transition-colors flex items-center gap-2">
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
                                                    </Tooltip>
                                                    <Tooltip content="Export the current catalog to a CSV local buffer." term="CATALOG_EXPORT" className="w-full">
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
                                                            className="w-full text-left px-4 py-4 text-[10px] tracking-normal hover:bg-white/5 text-white/70 hover:text-white transition-colors flex items-center gap-2 border-t border-white/5"
                                                        >
                                                            <Download size={14} /> {t.admin.store.exportCsv}
                                                        </button>
                                                    </Tooltip>
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
                                                <span className="text-black font-semibold tracking-normal] text-[10px]">{selectedIds.length} {t.admin.store.selected}</span>
                                                <button onClick={() => setSelectedIds([])} className="text-black/50 hover:text-black p-1"><X size={14} /></button>
                                            </div>
                                            <div className="flex gap-4">
                                                <Button
                                                    variant="solid"
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
                                                    className="bg-black/10 hover:bg-black/20 text-black h-auto py-1.5 px-4 text-[10px]"
                                                    tooltip="Batch update pricing for selected commerce objects."
                                                    tooltipTerm="BULK_PRICE_SYNC"
                                                >
                                                    {t.admin.store.bulkPrice}
                                                </Button>
                                                <Button
                                                    variant="solid"
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
                                                    className="bg-red-500 hover:bg-red-600 text-white h-auto py-1.5 px-4 text-[10px]"
                                                    tooltip="Purge selected objects from the catalog."
                                                    tooltipTerm="BULK_PURGE"
                                                >
                                                    {t.admin.store.bulkDelete}
                                                </Button>
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
                                    <thead className="bg-white/5 text-xs tracking-normal text-white/40 border-b border-white/10">
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
                                                <td className="px-4 py-3 text-white/30 tracking-normal">{p.id?.slice(0, 8)}</td>
                                                <td className="px-4 py-3 text-white font-sans">{p.name}</td>
                                                <td className="px-4 py-3 text-[var(--accent)]">${p.price}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="solid"
                                                            onClick={() => { setIsEditingProduct(true); setProductForm(p); setIsStoreModalOpen(true); }}
                                                            className="p-1.5 border-none h-auto bg-transparent hover:bg-white/10 text-white/50 hover:text-white"
                                                            tooltip="Modify the metadata and pricing for this commerce object."
                                                            tooltipTerm="PRODUCT_EDIT"
                                                        >
                                                            <Edit2 size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="solid"
                                                            onClick={async () => {
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
                                                            }}
                                                            className="p-1.5 border-none h-auto bg-transparent hover:bg-red-500/20 text-red-500/50 hover:text-red-500"
                                                            tooltip="Decommission and purge this commerce object from the catalog."
                                                            tooltipTerm="PRODUCT_PURGE"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
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
                                    <div className="text-xs text-white/50 font-mono tracking-normal">
                                        {t.admin.store.pagePrefix} {storePage} {t.admin.store.pageOf} {Math.max(1, Math.ceil(totalStoreProducts / 50))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="solid"
                                            onClick={() => setStorePage(Math.max(1, storePage - 1))}
                                            disabled={storePage === 1}
                                            className="h-auto p-2"
                                            tooltip="Traverse to the previous catalog page."
                                            tooltipTerm="CATALOG_PREV"
                                        >
                                            <ArrowLeft size={16} />
                                        </Button>
                                        <Button
                                            variant="solid"
                                            onClick={() => setStorePage(Math.min(Math.ceil(totalStoreProducts / 50), storePage + 1))}
                                            disabled={storePage >= Math.ceil(totalStoreProducts / 50)}
                                            className="h-auto p-2"
                                            tooltip="Traverse to the next catalog page."
                                            tooltipTerm="CATALOG_NEXT"
                                        >
                                            <ArrowRight size={16} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </SolidCard>

                        {/* Modal Editor */}
                        {isStoreModalOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                <SolidCard className="w-full max-w-2xl border border-white/10 bg-black p-6 flex flex-col gap-6 relative shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                                    <Tooltip content="Close the editor without commitment." term="EDITOR_CLOSE" className="absolute top-4 right-4">
                                        <button onClick={() => setIsStoreModalOpen(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
                                    </Tooltip>
                                    <div>
                                        <h3 className="text-sm font-bold tracking-normal text-[var(--accent)]">{isEditingProduct ? t.admin.store.modalEdit : t.admin.store.modalNew}</h3>
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
                                        <Button
                                            variant="solid"
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
                                            className="bg-[var(--accent)]/20 border-[var(--accent)]/50 text-[var(--accent)] h-auto py-3 px-6 hover:bg-[var(--accent)] hover:text-black w-full"
                                            tooltip="Commit the current commerce object configuration to the substrate."
                                            tooltipTerm="PRODUCT_COMMIT"
                                        >
                                            {isEditingProduct ? t.admin.store.btnUpdateNode : t.admin.store.btnCommitNode}
                                        </Button>
                                    </div>
                                </SolidCard>
                            </div>
                        )}
                    </div>
                )
            }

            <SolidCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4 md:col-span-2">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold tracking-normal">{t.admin.store.sandboxMode}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.store.sandboxDesc}</p>
                </div>
                <div className="flex w-full justify-start">
                    <Tooltip content={sandboxMode ? "Deactivate financial sandbox and enable live production environment." : "Activate financial sandbox for safe protocol testing."} term="SANDBOX_TOGGLE">
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
                    </Tooltip>
                </div>
            </SolidCard>

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

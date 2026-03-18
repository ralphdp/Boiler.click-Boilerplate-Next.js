"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MarketplaceShowcase } from "@/components/demo/MarketplaceShowcase";
import { getStoreProducts } from "@/core/actions/commerce";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";

export default function MarketplaceDemoPage() {
    const { t, language } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        getStoreProducts().then((prods) => {
            setProducts(prods.items || []);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white">
                <div className="text-xs text-[var(--accent)] font-mono animate-pulse tracking-widest uppercase">
                    [ Replicating Marketplace State ]
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen p-6 text-white overflow-hidden flex flex-col items-center">
            <div className="w-full max-w-6xl mt-12 mb-12">
                <Button as={Link} href={`/${language}/demo`} variant="ghost" className="w-fit text-white/50 px-0">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Hub
                </Button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl text-center space-y-6 mb-24"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <ShoppingBag size={12} />
                    E-Commerce Substrate v1.0
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest">
                    Sovereign <span className="text-[var(--accent)]">Marketplace</span>
                </h1>
                <p className="text-white/50 font-serif italic text-lg max-w-2xl mx-auto">
                    Direct asset acquisition via Stripe-integrated product arrays.
                </p>
            </motion.div>

            <div className="w-full max-w-6xl z-10 pb-32">
                <MarketplaceShowcase
                    products={products}
                    noProductsText={t.demoMatrix.zeroProducts}
                    noImageAssetText={t.demoMatrix.noImageAsset}
                    acquireAssetText={t.demoMatrix.acquireAsset}
                />
            </div>

            {/* Grid Backdrop */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

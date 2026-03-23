"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PricingMatrix } from "@/components/demo/PricingMatrix";
import { getGlobalOverrides } from "@/core/actions/branding";
import { useTranslation } from "@/core/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";

export default function SaasDemoPage() {
    const { t, language } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [pricingTiers, setPricingTiers] = useState<any[]>([]);
    const [recommendedPlan, setRecommendedPlan] = useState<string>("");

    useEffect(() => {
        getGlobalOverrides().then((overrides) => {
            if (overrides.pricingTiers) {
                const processedTiers = overrides.pricingTiers.map((t: any) => ({
                    ...t,
                    features: (t.features || []).map((f: any) =>
                        typeof f === 'string' ? { name: f, active: true } : f
                    )
                }));
                // Fallback if no tiers configured in admin
                if (processedTiers.length === 0) {
                    setPricingTiers([
                        {
                            id: "basic",
                            name: "Basic Node",
                            price: "9",
                            features: ["Standard Telemetry", "Email Support", "Priority Access"],
                            buttonText: "Initialize Basic"
                        },
                        {
                            id: "pro",
                            name: "Pro Node",
                            price: "99",
                            features: ["Advanced Telemetry", "24/7 Priority Support", "Full Admin Access"],
                            buttonText: "Initialize Pro",
                            recommended: true
                        }
                    ]);
                } else {
                    setPricingTiers(processedTiers.filter((t: any) => !t.hidden));
                }
            }
            if (overrides.recommendedPlan) setRecommendedPlan(overrides.recommendedPlan);
        }).finally(() => setLoading(false));
    }, []);

    const handleInitialize = (tier: any) => {
        toast({
            title: "Plan Selected",
            description: `Initializing ${tier.name} substrate...`,
            type: "success"
        });
    };

    if (loading) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white">
                <div className="text-xs text-[var(--accent)] font-mono animate-pulse tracking-normal">
                    [ Synchronizing SaaS Matrix ]
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
                <h1 className="text-4xl md:text-6xl font-semibold tracking-normal">
                    Subscription <span className="text-[var(--accent)]">Matrix</span>
                </h1>
                <p className="text-white/50 font-serif italic text-lg max-w-2xl mx-auto">
                    A dedicated view of the SaaS billing architecture. Configurable in real-time via the Root Admin Panel.
                </p>
            </motion.div>

            <div className="w-full max-w-6xl z-10 pb-32">
                <PricingMatrix
                    tiers={pricingTiers}
                    recommendedPlan={recommendedPlan}
                    perMonthText={t.demoMatrix.perMonth}
                    recommendedLabel={t.demoMatrix.recommended}
                    onInitialize={handleInitialize}
                />
            </div>

            {/* Grid Backdrop */}
            <div className="fixed inset-0 z-[-1] opacity-5 pointer-events-none" aria-hidden="true">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </main>
    );
}

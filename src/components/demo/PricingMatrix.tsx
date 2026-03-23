"use client";

import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { SolidCard } from "@/components/ui/SolidCard";
import { Button } from "@/components/ui/Button";

interface Tier {
    id: string;
    name: string;
    price: string | number;
    features: (string | { name: string; active?: boolean })[];
    buttonText: string;
    recommended?: boolean;
}

interface PricingMatrixProps {
    tiers: Tier[];
    recommendedPlan?: string;
    perMonthText?: string;
    recommendedLabel?: string;
    onInitialize?: (tier: Tier) => void;
}

export function PricingMatrix({ tiers, recommendedPlan, perMonthText = "/month", recommendedLabel = "Recommended", onInitialize }: PricingMatrixProps) {
    return (
        <div className={`grid gap-8 w-full mx-auto ${tiers.length === 1 ? 'grid-cols-1 max-w-md' :
                tiers.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl' :
                    tiers.length === 3 ? 'grid-cols-1 md:grid-cols-3 max-w-6xl' :
                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl'
            }`}>
            {tiers.map(tier => {
                const isRecommended = tier.recommended || recommendedPlan === tier.id;
                return (
                    <SolidCard key={tier.id} className={`p-8 flex flex-col justify-between transition-all relative overflow-hidden ${isRecommended ? 'border-[var(--accent)]/50 bg-[var(--accent)]/10 shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)]' : 'hover:border-white/20'}`}>
                        {isRecommended && (
                            <div className="absolute top-0 right-0 bg-[var(--accent)] text-white text-[10px] font-bold tracking-normal px-3 py-1">
                                {recommendedLabel}
                            </div>
                        )}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className={`text-xl font-bold uppercase tracking-widest ${isRecommended ? 'text-[var(--accent)]' : ''}`}>
                                    {tier.name}
                                </h3>
                                <div className="text-4xl font-bold">
                                    ${tier.price}
                                    <span className="text-sm font-normal text-white/50">{perMonthText}</span>
                                </div>
                            </div>
                            <ul className="space-y-3 font-mono text-xs text-white/70">
                                {tier.features.map((feat, i) => {
                                    const isActive = typeof feat === 'string' ? true : feat.active !== false;
                                    const featureName = typeof feat === 'string' ? feat : feat.name;
                                    return (
                                        <li key={i} className={`flex items-center gap-2 ${!isActive ? 'text-white/30' : ''}`}>
                                            {isActive ? (
                                                <CheckCircle2 size={14} className="text-[var(--accent)] flex-shrink-0" />
                                            ) : (
                                                <X size={14} className="text-white/30 flex-shrink-0" />
                                            )}
                                            <span className={!isActive ? 'line-through' : ''}>{featureName}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <Button
                            className={`w-full mt-8 uppercase tracking-widest font-bold ${isRecommended ? 'bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                            onClick={() => onInitialize?.(tier)}
                        >
                            {tier.buttonText}
                        </Button>
                    </SolidCard>
                );
            })}
        </div>
    );
}

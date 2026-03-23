"use client";

import { motion } from "framer-motion";
import { Activity, Shield, Cpu, Zap } from "lucide-react";
import { SolidCard } from "@/components/ui/SolidCard";
import { cn } from "@/core/utils";

interface PulseProps {
    traces: any[];
    nodesCount: number;
    haltingProtocol: boolean;
    telemetry?: any;
}

export function AdminPulse({ traces, nodesCount, haltingProtocol, telemetry }: PulseProps) {
    // 1. Semantic Defensive Posture
    // We define a BREACH only when suspicious actions occur that are NOT sanctioned by an Admin.
    // Auth failures, rate limit breaches, and unauthorized resource access are real threats.
    const suspiciousTraces = traces.filter(t => {
        const isCritical = t.severity === "CRIT" || t.severity === "FATAL";
        const isUnauthorizedAction = t.action.includes("UNAUTHORIZED") || t.action.includes("BLOCK") || t.action.includes("AUTH_FAILURE");

        // Exclude actions from known administrators
        const isAdminAction = t.user.includes("ADMIN") ||
            (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL && t.user === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL);

        return (isCritical || isUnauthorizedAction) && !isAdminAction;
    });

    const isUnderAttack = suspiciousTraces.length > 0;
    const adminActive = traces.some(t => {
        const isRecent = (Date.now() - new Date(t.timestamp).getTime()) < 1000 * 60 * 10;
        const isAdmin = t.user.includes("ADMIN") || (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL && t.user === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL);
        return isRecent && isAdmin;
    });

    const defensiveStatus = isUnderAttack ? "BREACH" : adminActive ? "AXIOMATIC" : "NOMINAL";
    const defensiveWarning = isUnderAttack;

    // 2. Dynamic Throughput (Vanguard Edge Monitoring)
    const latencyAvg = telemetry?.latency;
    const isEdgeSync = latencyAvg !== undefined && latencyAvg !== null;

    let throughput = "NOMINAL";
    if (!isEdgeSync) {
        throughput = "DESYNC";
    } else if (latencyAvg > 500) {
        throughput = "HIGH_LAT";
    } else if (latencyAvg > 200) {
        throughput = "STABLE";
    } else {
        throughput = "OPTIMAL";
    }

    // 3. Substrate Vitality
    const systemVitality = Math.min(1, nodesCount / 10);

    return (
        <SolidCard className="p-6 border-white/5 bg-black/40 overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                {/* Left: Main Pulse Visualizer */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-[var(--accent)]" />
                        <h3 className="text-[10px] font-semibold tracking-normal] text-white/50">Substrate Vitality</h3>
                    </div>

                    <div className="h-32 flex items-center justify-center relative">
                        {/* The Pulse Wave */}
                        <svg viewBox="0 0 400 100" className="w-full h-full stroke-[var(--accent)] stroke-2 fill-none opacity-50">
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{
                                    pathLength: 1,
                                    opacity: [0.3, 0.6, 0.3],
                                    d: [
                                        "M0 50 L50 50 L60 20 L70 80 L80 50 L150 50 L160 10 L175 90 L190 50 L250 50 L260 40 L270 60 L280 50 L400 50",
                                        "M0 50 L50 50 L60 40 L70 60 L80 50 L150 50 L160 30 L175 70 L190 50 L250 50 L260 20 L270 80 L280 50 L400 50"
                                    ]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                d="M0 50 L50 50 L60 20 L70 80 L80 50 L150 50 L160 10 L175 90 L190 50 L250 50 L260 40 L270 60 L280 50 L400 50"
                            />
                            {/* Glow baseline */}
                            <path d="M0 50 L400 50" className="stroke-white/5 stroke-1" />
                        </svg>

                        {/* Centered Large Metric */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="text-4xl font-mono font-semibold text-white"
                            >
                                {Math.round(systemVitality * 100)}%
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Right: Detailed Axioms */}
                <div className="grid grid-cols-2 gap-4 w-full md:w-64">
                    <PulseMetric
                        label="Entropy"
                        value={haltingProtocol ? "STABLE" : "FLUX"}
                        icon={<Cpu size={12} />}
                        active={!haltingProtocol}
                    />
                    <PulseMetric
                        label="Neural"
                        value={`${nodesCount} NODES`}
                        icon={<Zap size={12} />}
                        active={nodesCount > 0}
                    />
                    <PulseMetric
                        label="Defensive"
                        value={defensiveStatus}
                        icon={<Shield size={12} />}
                        active={!defensiveWarning}
                        warning={defensiveWarning}
                    />
                    <PulseMetric
                        label="Throughput"
                        value={throughput}
                        icon={<Activity size={12} />}
                        active={throughput !== "DESYNC"}
                        warning={throughput === "DESYNC" || throughput === "HIGH_LAT"}
                    />
                </div>
            </div>

            {/* Background Grid Accent */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,var(--accent)_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>
        </SolidCard>
    );
}

function PulseMetric({ label, value, icon, active, warning }: { label: string, value: string, icon: any, active: boolean, warning?: boolean }) {
    return (
        <div className="p-3 border border-white/5 bg-white/5 space-y-1 relative">
            <div className="flex items-center justify-between text-[8px] font-semibold tracking-normal text-white/30">
                <span>{label}</span>
                <span className={warning ? "text-red-500" : active ? "text-[var(--accent)]" : "text-white/20"}>{icon}</span>
            </div>
            <div className={cn(
                "text-[10px] font-mono font-bold",
                warning ? "text-red-500" : active ? "text-white" : "text-white/20"
            )}>
                {value}
            </div>
            {active && !warning && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[var(--accent)]/50 shadow-[0_0_10px_var(--accent)]" />}
            {warning && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-red-500/50 shadow-[0_0_10px_red]" />}
        </div>
    );
}


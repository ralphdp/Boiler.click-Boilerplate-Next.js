"use client";

import { motion } from "framer-motion";
import { SolidCard } from "@/components/ui/SolidCard";

interface AdminTelemetryProps {
    t: any;
    telemetry: {
        latency: number;
        firebaseSync: string;
        resendTransport: string;
        stripeBridge: string;
        redisEdge: string;
        posthogPulse: string;
    } | null;
}

export function AdminTelemetry({ t, telemetry }: AdminTelemetryProps) {
    return (
        <motion.div
            key="telemetry-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {telemetry ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SolidCard className="border border-white/5 bg-black/40 space-y-2">
                        <p className="text-[10px] tracking-normal text-white/50">{t.admin.telemetry.edgeLatency}</p>
                        <p className={`text-3xl font-black ${telemetry.latency < 100 ? 'text-[var(--accent)]' : 'text-yellow-500'}`}>{telemetry.latency}<span className="text-sm font-normal text-white/30 ml-1">ms</span></p>
                    </SolidCard>
                    <SolidCard className="border border-white/5 bg-black/40 space-y-2">
                        <p className="text-[10px] tracking-normal text-white/50">{t.admin.telemetry.firebaseAuth}</p>
                        <p className="text-3xl font-semibold text-[var(--accent)]">{telemetry.firebaseSync}</p>
                    </SolidCard>
                    <SolidCard className="border border-white/5 bg-black/40 space-y-2">
                        <p className="text-[10px] tracking-normal text-white/50">{t.admin.telemetry.emailService}</p>
                        <p className="text-3xl font-semibold text-[var(--accent)]">{telemetry.resendTransport}</p>
                    </SolidCard>
                    <SolidCard className="border border-white/5 bg-black/40 space-y-2">
                        <p className="text-[10px] tracking-normal text-white/50">{t.admin.telemetry.payments}</p>
                        <p className="text-3xl font-semibold text-[var(--accent)]">{telemetry.stripeBridge}</p>
                    </SolidCard>
                    <SolidCard className="border border-white/5 bg-black/40 space-y-2">
                        <p className="text-[10px] tracking-normal text-white/50">{t.admin.telemetry.rateLimiting}</p>
                        <p className="text-3xl font-semibold text-[var(--accent)]">{telemetry.redisEdge}</p>
                    </SolidCard>
                    <SolidCard className="border border-white/5 bg-black/40 space-y-2">
                        <p className="text-[10px] tracking-normal text-white/50">Behavioral Matrix [PH]</p>
                        <p className={`text-3xl font-black ${telemetry.posthogPulse === 'NOMINAL' ? 'text-[var(--accent)]' : 'text-white/20'}`}>{telemetry.posthogPulse}</p>
                    </SolidCard>
                </div>
            ) : (
                <SolidCard className="border border-white/5 bg-black/40 h-64 flex items-center justify-center">
                    <span className="text-xs text-white/30 font-mono italic tracking-normal animate-pulse">{t.admin.telemetry.loading}</span>
                </SolidCard>
            )}
        </motion.div>
    );
}

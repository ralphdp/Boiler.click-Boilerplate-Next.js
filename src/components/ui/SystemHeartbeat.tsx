"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldCheck, Zap } from "lucide-react";
import { getTelemetryData } from "@/core/actions/telemetry";

export function SystemHeartbeat() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await getTelemetryData();
                setStatus(data);
            } catch (e) {
                console.error("Heartbeat sync failure.");
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !status) return null;

    return (
        <div className="w-fit pointer-events-none sm:pointer-events-auto">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3"
            >
                <div className="flex items-center gap-6 px-6 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center w-3 h-3">
                            <motion.div
                                className={`absolute inset-0 rounded-full ${status?.firebaseSync === 'NOMINAL' ? 'bg-[var(--accent)]' : 'bg-red-500'} opacity-20`}
                                animate={{ scale: [1, 2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <div className={`w-1.5 h-1.5 rounded-full ${status?.firebaseSync === 'NOMINAL' ? 'bg-[var(--accent)]' : 'bg-red-500'}`} />
                        </div>
                        <span className="text-xs font-semibold text-white/50">Substrate Pulse</span>
                    </div>

                    <div className="w-px h-4 bg-white/10" />

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-white/40 tracking-normal">Latency</span>
                            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--accent)]">
                                <Activity size={12} />
                                <span>{status?.latency || 0}ms</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-white/40 tracking-normal">Protocol</span>
                            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-green-500">
                                <ShieldCheck size={12} />
                                <span>Secured</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-px h-4 bg-white/10" />

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2" title="Infrastructure Status">
                            <span className="text-[10px] font-semibold text-white/40 tracking-normal">Nodes</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                                        className={`w-1 h-2 rounded-full ${status?.latency < 300 ? 'bg-[var(--accent)]' : 'bg-white/10'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-50 mt-1">
                    <span className="text-[10px] font-mono text-white tracking-normal">Vanguard Substrate v2.8.5</span>
                    <span className="text-[10px] font-mono text-[var(--accent)]">•</span>
                    <span className="text-[10px] font-mono text-white tracking-normal">Active Handshake</span>
                </div>
            </motion.div>
        </div>
    );
}

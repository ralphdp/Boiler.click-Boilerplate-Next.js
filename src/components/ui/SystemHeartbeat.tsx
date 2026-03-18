"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldCheck, Zap } from "lucide-react";
import { getTelemetryData } from "@/core/actions/system";

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
                <div className="flex items-center gap-6 px-6 py-3 bg-black/40 border border-white/5 backdrop-blur-2xl rounded-sm">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center w-3 h-3">
                            <motion.div
                                className={`absolute inset-0 rounded-full ${status?.firebaseSync === 'NOMINAL' ? 'bg-[var(--accent)]' : 'bg-red-500'} opacity-20`}
                                animate={{ scale: [1, 2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <div className={`w-1.5 h-1.5 rounded-full ${status?.firebaseSync === 'NOMINAL' ? 'bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]' : 'bg-red-500 shadow-[0_0_10px_red]'}`} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Substrate Pulse</span>
                    </div>

                    <div className="w-px h-4 bg-white/10" />

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Latency</span>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[var(--accent)]">
                                <Activity size={10} />
                                <span>{status?.latency || 0}MS</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Protocol</span>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-green-500">
                                <ShieldCheck size={10} />
                                <span>SECURED</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-px h-4 bg-white/10" />

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-start gap-0.5" title="Infrastructure Status">
                            <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Nodes</span>
                            <div className="flex gap-0.5">
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

                <div className="flex items-center gap-2 opacity-30">
                    <span className="text-[8px] font-mono uppercase tracking-[0.4em]">Vanguard Substrate v2.8.5</span>
                    <span className="text-[8px] font-mono text-[var(--accent)]">•</span>
                    <span className="text-[8px] font-mono uppercase tracking-[0.4em]">Active Handshake</span>
                </div>
            </motion.div>
        </div>
    );
}

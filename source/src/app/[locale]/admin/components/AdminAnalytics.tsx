"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    Users,
    MousePointer2,
    TrendingUp,
    TrendingDown,
    Monitor,
    Smartphone,
    Tablet,
    ArrowUpRight,
    Loader2,
    ShieldAlert,
    Activity
} from "lucide-react";
import { getAnalyticsOverview } from "@/core/actions/analytics";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export function AdminAnalytics({ t }: { t: any }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState(7);

    useEffect(() => {
        setLoading(true);
        getAnalyticsOverview(timeframe)
            .then(setData)
            .finally(() => setLoading(false));
    }, [timeframe]);

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center p-24 text-white/30 animate-pulse">
                <Loader2 className="animate-spin mb-4" />
                <span className="uppercase tracking-[0.3em] text-[10px] font-black">Syncing Analytics Vault</span>
            </div>
        );
    }

    const isError = data?.status === 'error';
    const noData = data?.status === 'no_data';

    const StatCard = ({ icon: Icon, label, value, change, history }: any) => (
        <GlassCard className="p-6 border border-white/5 bg-black/40 hover:bg-black/60 transition-all group overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] rounded-lg">
                    <Icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(change)}%
                </div>
            </div>

            <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-black mb-1">{label}</h3>
            <div className="text-2xl font-black mb-4 font-mono">{value?.toLocaleString() || 0}</div>

            {/* Sparkline Overlay */}
            <div className="h-10 w-full flex items-end gap-[2px]">
                {history && history.length > 0 ? history.map((val: number, i: number) => {
                    const max = Math.max(...history, 1);
                    const height = `${(val / max) * 100}%`;
                    return (
                        <div
                            key={i}
                            style={{ height }}
                            className="bg-[var(--accent)]/20 group-hover:bg-[var(--accent)]/50 transition-all w-full rounded-t-[1px]"
                        />
                    );
                }) : (
                    <div className="w-full h-px bg-white/5" />
                )}
            </div>
        </GlassCard>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-black/40 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent opacity-30" />

                <div className="p-4 md:p-6 border-b border-white/5 bg-white/5">
                    <div className="flex flex-col gap-1 shrink-0">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)] flex items-center gap-2">
                            Structural Analytics Matrix
                        </h3>
                        <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.3em]">Temporal Traffic & Behavioral Telemetry Hub</span>
                    </div>
                </div>

                <div className="p-4 md:p-6 border-b border-white/5 bg-black/20 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isError ? 'bg-red-500' : (noData ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse')} shadow-[0_0_10px_rgba(34,197,94,0.5)]`} />
                            <span className="text-[10px] uppercase font-black tracking-widest">
                                {isError ? 'GA4 Bridge Offline' : (noData ? 'GA4 Connected // Standing By' : 'GA4 Analytics Pulse Nominal')}
                            </span>
                        </div>
                        {data?.realtime && (
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className={`absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${data.realtime.activeNow > 0 ? 'animate-ping' : ''}`}></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">
                                    {data.realtime.activeNow} Active Now
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                        {[7, 30, 90].map((d) => (
                            <button
                                key={d}
                                onClick={() => setTimeframe(d)}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-tighter transition-all ${timeframe === d ? 'bg-[var(--accent)] text-black' : 'text-white/40 hover:bg-white/5'}`}
                            >
                                {d} Days
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isError && (
                <GlassCard className="p-8 border border-yellow-500/20 bg-yellow-500/5 text-center space-y-4">
                    <ShieldAlert size={32} className="mx-auto text-yellow-500/50" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em]">Permission Required</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                            Ensure `firebase-adminsdk-fbsvc@boiler-click-next-js.iam.gserviceaccount.com` <br />
                            is added as a **VIEWER** to GA4 Property **528435699**.
                        </p>
                    </div>
                </GlassCard>
            )}

            {noData && !isError && (
                <GlassCard className="p-8 border border-[var(--accent)]/20 bg-[var(--accent)]/5 text-center space-y-4">
                    <TrendingUp size={32} className="mx-auto text-[var(--accent)]/50 animate-pulse" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em]">Identity Synchronized</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                            Bridge established with Property **528435699**. <br />
                            <span className="text-[var(--accent)] font-bold">Latency Warning:</span> GA4 historical data (Charts, Top Routes, Hardware) <br />
                            requires **24-48 hours** to process. Real-time "Active Now" is live.
                        </p>
                    </div>
                </GlassCard>
            )}

            {/* Primary Traffic Chart */}
            <GlassCard className="p-6 border border-white/5 bg-black/40 h-[350px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                        <TrendingUp size={14} className="text-[var(--accent)]" /> Traffic Temporal Matrix
                    </h3>
                    <div className="flex gap-4 text-[10px] uppercase font-bold tracking-tighter text-white/30">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--accent)]" /> Active Users</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white/20" /> Sessions</span>
                    </div>
                </div>

                <div className="h-[250px] w-full relative">
                    {(!data?.fullHistory || data.fullHistory.length === 0) ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10 space-y-2">
                            <Activity size={32} className="animate-pulse" />
                            <p className="text-[10px] uppercase font-black tracking-[0.3em]">Waiting for Temporal Historical Pulses</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.fullHistory || []}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#ffffff20"
                                    fontSize={10}
                                    tickFormatter={(val) => val.slice(4)}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#ffffff20"
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', textTransform: 'uppercase' }}
                                    itemStyle={{ fontWeight: 'black' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="var(--accent)"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                    animationDuration={1000}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sessions"
                                    stroke="#ffffff20"
                                    strokeWidth={1}
                                    fill="transparent"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </GlassCard>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={MousePointer2}
                    label="Volume Aggregate (GA4)"
                    value={data?.sessions.total}
                    change={data?.sessions.change}
                    history={data?.sessions.history}
                />
                <StatCard
                    icon={Users}
                    label="Citizen Pulse (Firebase)"
                    value={data?.users.total}
                    change={data?.users.history?.length > 0 ? data.users.total : data?.users.total}
                    history={data?.users.history}
                />
                <StatCard
                    icon={ArrowUpRight}
                    label="Conversions"
                    value={data?.conversions.total}
                    change={data?.conversions.change}
                    history={data?.conversions.history}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Pages Table */}
                <GlassCard className="p-6 border border-white/5 bg-black/40">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <TrendingUp size={14} className="text-[var(--accent)]" /> Top VFS Routes
                    </h3>
                    <div className="space-y-4">
                        {data?.topPages && data.topPages.length > 0 ? data.topPages.map((page: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:border-[var(--accent)]/30 transition-colors">
                                <span className="font-mono text-[10px] text-white/50">{page.path}</span>
                                <span className="font-black text-xs">{page.views?.toLocaleString()}</span>
                            </div>
                        )) : (
                            <div className="p-12 text-center text-white/20 uppercase tracking-widest text-[10px] font-black border border-dashed border-white/5 h-[200px] flex items-center justify-center">
                                No data yet
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Device Distribution */}
                <GlassCard className="p-6 border border-white/5 bg-black/40">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Monitor size={14} className="text-[var(--accent)]" /> Hardware Distribution
                    </h3>
                    <div className="space-y-6">
                        {data?.devices && data.devices.length > 0 ? data.devices.map((device: any, i: number) => {
                            const Icon = device.type === 'Desktop' ? Monitor : device.type === 'Mobile' ? Smartphone : Tablet;
                            return (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-white/50">
                                        <span className="flex items-center gap-2"><Icon size={12} /> {device.type}</span>
                                        <span>{device.percentage}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${device.percentage}%` }}
                                            className="h-full bg-[var(--accent)]"
                                        />
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="p-12 text-center text-white/20 uppercase tracking-widest text-[10px] font-black border border-dashed border-white/5 h-[200px] flex items-center justify-center">
                                No data yet
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </motion.div>
    );
}

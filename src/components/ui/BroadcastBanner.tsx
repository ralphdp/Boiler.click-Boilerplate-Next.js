import { AlertCircle, AlertTriangle, ShieldAlert } from "lucide-react";

export function BroadcastBanner({
    message,
    urgency = 'INFO'
}: {
    message?: string;
    urgency?: 'INFO' | 'WARN' | 'CRIT';
}) {
    if (!message) return null;

    const config = {
        INFO: {
            bg: 'bg-[var(--accent)]/10',
            border: 'border-[var(--accent)]/30',
            text: 'text-[var(--accent)]',
            icon: AlertCircle,
            glow: 'rgba(var(--accent-rgb),0.5)'
        },
        WARN: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/30',
            text: 'text-amber-500',
            icon: AlertTriangle,
            glow: 'rgba(245,158,11,0.5)'
        },
        CRIT: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            text: 'text-red-500',
            icon: ShieldAlert,
            glow: 'rgba(239,68,68,0.5)'
        }
    };

    const { bg, border, text, icon: Icon, glow } = config[urgency] || config.INFO;

    return (
        <div className={`w-full ${bg} border-b ${border} px-4 py-2 flex items-center justify-center gap-3 relative z-[100] animate-in fade-in slide-in-from-top-2 duration-700`}>
            <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[${text.split('-')[1]}]/50 to-transparent`} />
            <Icon size={12} className={`${text} shrink-0 animate-pulse`} />
            <p className={`${text} text-[10px] font-black uppercase tracking-[0.2em] text-center drop-shadow-[0_0_8px_${glow}]`}>
                {message}
            </p>
        </div>
    );
}

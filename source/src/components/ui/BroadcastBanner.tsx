import { AlertCircle } from "lucide-react";

export function BroadcastBanner({ message }: { message?: string }) {
    if (!message) return null;

    return (
        <div className="w-full bg-[var(--accent)]/10 border-b border-[var(--accent)]/30 px-4 py-2 flex items-center justify-center gap-3 relative z-[100] animate-in fade-in slide-in-from-top-2 duration-700">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent" />
            <AlertCircle size={12} className="text-[var(--accent)] shrink-0 animate-pulse" />
            <p className="text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.2em] text-center drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]">{message}</p>
        </div>
    );
}

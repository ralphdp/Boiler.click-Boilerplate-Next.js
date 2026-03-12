import { cookies } from "next/headers";
import { AlertCircle } from "lucide-react";

export async function BroadcastBanner() {
    const cookieStore = await cookies();
    const broadcast = cookieStore.get("sovereign_broadcast")?.value;

    if (!broadcast) return null;

    return (
        <div className="w-full bg-blue-500/20 border-b border-blue-500/50 px-4 py-2 flex items-center justify-center gap-3 relative z-50 animate-in fade-in slide-in-from-top-2 duration-500">
            <AlertCircle size={14} className="text-blue-400 shrink-0" />
            <p className="text-blue-400 text-xs font-mono uppercase tracking-widest text-center">{broadcast}</p>
        </div>
    );
}

import { ACTIVE_THEME } from "@/theme/config";
import { cn } from "@/core/utils";

export function IdentityBadge({ className }: { className?: string }) {
    return (
        <div className={cn(
            "inline-block px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-sm text-xs font-semibold",
            className
        )}>
            v1.0.0
        </div>
    );
}

import { ACTIVE_THEME } from "@/theme/config";
import { cn } from "@/core/utils";

export function IdentityBadge({ className }: { className?: string }) {
    return (
        <div className={cn(
            "inline-block px-4 py-1 glass glass-accent rounded-full text-[10px] font-black tracking-[0.4em] technical uppercase",
            className
        )}>
            v1.0.0
        </div>
    );
}

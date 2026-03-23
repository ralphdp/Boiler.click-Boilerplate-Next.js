"use client";

import React from "react";
import { cn } from "@/core/utils";

export function SolidCard({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn(
            "bg-[#050505] border border-white/5 p-10 space-y-8 relative overflow-hidden text-center",
            className
        )}>
            {children}
        </div>
    );
}

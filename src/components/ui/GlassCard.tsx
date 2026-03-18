"use client";

import React from "react";
import { cn } from "@/core/utils";

export function GlassCard({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn(
            "glass p-10 space-y-8 relative overflow-hidden text-center",
            className
        )}>
            {children}
        </div>
    );
}

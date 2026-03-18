"use client";

import React from "react";
import { cn } from "@/core/utils";

export function Table({ className, children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
    return (
        <div className="w-full overflow-auto glass bg-transparent rounded-none border border-white/5">
            <table className={cn("w-full text-left text-sm technical", className)} {...props}>
                {children}
            </table>
        </div>
    );
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return <thead className={cn("border-b border-white/10 bg-white/[0.02]", className)} {...props} />;
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
    return <tr className={cn("border-b border-white/5 transition-colors hover:bg-white/[0.01]", className)} {...props} />;
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
    return <th className={cn("p-4 font-black uppercase tracking-widest text-white/30 text-[10px]", className)} {...props} />;
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return <td className={cn("p-4 align-middle text-white/80", className)} {...props} />;
}

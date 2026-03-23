"use client";

import React from "react";
import { cn } from "@/core/utils";
import { Tooltip } from "./Tooltip";

type ButtonVariants = "solid" | "solid-accent" | "outline" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariants;
    as?: React.ElementType; // For polymorphic behavior (e.g. using as Link or a)
    href?: string;
    tooltip?: string;
    tooltipTerm?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "solid", as: Component = "button", children, tooltip, tooltipTerm, ...props }, ref) => {
        const variants: Record<ButtonVariants, string> = {
            solid: "bg-[#050505] hover:bg-white/5 border border-white/10 hover:border-white/20",
            "solid-accent": "bg-[var(--accent)] hover:opacity-90 text-white border border-transparent",
            outline: "border border-white/10 hover:border-white/20 hover:bg-white/5 text-white/70 hover:text-white",
            ghost: "hover:bg-white/5 text-white/50 hover:text-white border-transparent"
        };

        const Element = Component as any;

        const buttonContent = (
            <Element
                ref={ref}
                className={cn(
                    "px-6 py-3 rounded-md transition-colors text-sm font-semibold flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed",
                    // Only default to w-full if no width class is present in the provided className
                    (!className || !/\bw-(full|fit|auto|[\d/]+)/.test(className)) && "w-full",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {(() => {
                    const childrenArray = React.Children.toArray(children);
                    const hasIcon = childrenArray.some(child =>
                        React.isValidElement(child) &&
                        ((child.type as any).displayName?.includes("Icon") || (child as any).props?.size !== undefined)
                    );

                    return React.Children.map(children, (child) => {
                        // If the child is a Lucide icon (or similar), wrap it to ensure width consistency
                        if (React.isValidElement(child) && ((child.type as any).displayName?.includes("Icon") || (child as any)?.props?.size !== undefined)) {
                            return (
                                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                    {React.cloneElement(child as React.ReactElement<any>, {
                                        size: (child as any).props.size || 16,
                                        className: cn("shrink-0", (child as any).props.className)
                                    })}
                                </span>
                            );
                        }
                        if (typeof child === "string" || typeof child === "number") {
                            return (
                                <span className="truncate">
                                    {child}
                                </span>
                            );
                        }
                        return child;
                    });
                })()}
            </Element>
        );

        if (tooltip) {
            return (
                <Tooltip content={tooltip} term={tooltipTerm}>
                    {buttonContent}
                </Tooltip>
            );
        }

        return buttonContent;
    }
);

Button.displayName = "Button";

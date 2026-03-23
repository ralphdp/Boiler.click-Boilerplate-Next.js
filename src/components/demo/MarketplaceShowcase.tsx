"use client";

import { ShoppingCart } from "lucide-react";
import { SolidCard } from "@/components/ui/SolidCard";

interface Product {
    id: string;
    name: string;
    description: string;
    price: string | number;
    imageUrl?: string;
    stripeLink?: string;
}

interface MarketplaceShowcaseProps {
    products: Product[];
    noProductsText?: string;
    noImageAssetText?: string;
    acquireAssetText?: string;
}

export function MarketplaceShowcase({
    products,
    noProductsText = "Zero products found in commerce matrix.",
    noImageAssetText = "No Image Asset",
    acquireAssetText = "Acquire Asset"
}: MarketplaceShowcaseProps) {
    if (products.length === 0) {
        return (
            <SolidCard className="p-12 text-center flex flex-col items-center justify-center border-dashed border-white/20">
                <ShoppingCart size={32} className="text-white/20 mb-4" />
                <div className="text-sm font-mono text-white/50">{noProductsText}</div>
            </SolidCard>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map(product => (
                <SolidCard key={product.id} className="flex flex-col overflow-hidden hover:border-[var(--accent)]/50 transition-colors group">
                    <div className="w-full h-48 bg-black/50 border-b border-white/5 relative flex items-center justify-center overflow-hidden">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="font-mono text-[10px] text-white/20 tracking-normal">
                                {noImageAssetText}
                            </div>
                        )}
                        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 font-mono text-xs text-[var(--accent)] font-bold">
                            ${product.price}
                        </div>
                    </div>
                    <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                        <div className="space-y-2 text-left">
                            <h3 className="font-bold text-lg">{product.name}</h3>
                            <p className="text-xs text-white/50 line-clamp-2">{product.description}</p>
                        </div>
                        <a
                            href={product.stripeLink || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-white/5 border border-white/10 hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] tracking-normal text-xs font-bold transition-all p-2 text-center block"
                        >
                            {acquireAssetText}
                        </a>
                    </div>
                </SolidCard>
            ))}
        </div>
    );
}

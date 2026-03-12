"use client";

import { useEffect } from "react";

export function ViewCounter({ slug }: { slug: string }) {
    useEffect(() => {
        fetch(`/api/views/${slug}`, { method: "POST" }).catch(console.error);
    }, [slug]);

    return null;
}

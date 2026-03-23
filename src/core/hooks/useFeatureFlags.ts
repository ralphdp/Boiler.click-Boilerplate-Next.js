"use client";

import { useState, useEffect } from "react";
import { getGlobalOverrides } from "@/core/actions/branding";

export function useFeatureFlags() {
    const [modules, setModules] = useState<any>({
        vfs: true,
        vouchers: true,
        store: true,
        workspaces: true,
        api: true,
        socialAuth: true,
        publicAnalytics: true,
        auditVisibility: true,
        aiSupport: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getGlobalOverrides()
            .then(res => {
                if (res.modules) {
                    setModules(res.modules);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    return { modules, loading };
}

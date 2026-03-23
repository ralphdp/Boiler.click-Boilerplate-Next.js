"use client";

import { useTranslation } from "@/core/i18n/LanguageProvider";
import { AdminAnalytics } from "../admin/components/AdminAnalytics";
import { useFeatureFlags } from "@/core/hooks/useFeatureFlags";
import { useSession } from "next-auth/react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function PublicAnalyticsPage() {
    const { t, language } = useTranslation();
    const { modules, loading } = useFeatureFlags();
    const { data: session } = useSession();

    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (loading) return null;

    if (!modules.publicAnalytics && !isAdmin) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
                <ShieldAlert size={64} className="text-red-500 opacity-50" />
                <h1 className="text-2xl font-bold tracking-normal">ACCESS RESTRICTED</h1>
                <p className="text-white/40 text-xs font-mono max-w-sm tracking-normal">
                    The Public Analytics Matrix has been deactivated by the system administrator.
                </p>
                <Button as={Link} href={`/${language}`} variant="solid">
                    Return to Reality
                </Button>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-8 pt-24 max-w-6xl mx-auto">
            <div className="mb-12 text-center md:text-left">
                <h1 className="text-4xl font-bold tracking-normal">Public Pulse</h1>
                <p className="text-[10px] font-bold tracking-normal] text-[var(--accent)] mt-2">Open Substrate Telemetry</p>
            </div>

            <AdminAnalytics t={t} />
        </main>
    );
}

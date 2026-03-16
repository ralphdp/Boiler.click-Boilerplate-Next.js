"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setGlobalBroadcast } from "@/core/actions/admin";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CipherGate } from "@/components/ui/CipherGate";

interface AdminBroadcastProps {
    t: any;
    broadcastMessage: string;
    setBroadcastMessage: (val: string) => void;
}

export function AdminBroadcast({
    t,
    broadcastMessage,
    setBroadcastMessage
}: AdminBroadcastProps) {
    const { toast } = useToast();
    const router = useRouter();

    const [showConfirm, setShowConfirm] = useState(false);
    const [showCipher, setShowCipher] = useState(false);

    const handleBroadcastSubmit = async (verified: boolean = false) => {
        if (!verified && broadcastMessage.length > 5) {
            setShowConfirm(true);
            return;
        }

        const res = await setGlobalBroadcast(broadcastMessage);
        if (res.success) {
            toast({ title: t.admin.broadcast.broadcastActive, description: t.admin.broadcast.broadcastInjected, type: "success" });
            router.refresh();
            setShowCipher(false);
        }
    };

    return (
        <motion.div
            key="broadcast-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-6"
        >
            <GlassCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--accent)]">{t.admin.broadcast.title}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.broadcast.desc}</p>
                </div>
                <div className="flex flex-col gap-3 w-full justify-start">
                    <Input
                        type="text"
                        placeholder={t.admin.broadcast.placeholder}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                    />
                    <button
                        onClick={() => handleBroadcastSubmit()}
                        className="bg-[var(--accent)]/20 border border-[var(--accent)]/50 text-xs px-6 py-2 outline-none focus:border-white uppercase tracking-widest font-bold text-white transition-colors hover:bg-[var(--accent)]/40"
                    >
                        {t.admin.broadcast.sendBtn}
                    </button>
                </div>
            </GlassCard>

            <ConfirmationModal
                isOpen={showConfirm}
                title={t.admin.broadcast.confirmTitle}
                description={t.admin.broadcast.confirmDesc}
                variant="warning"
                onConfirm={() => {
                    setShowConfirm(false);
                    setShowCipher(true);
                }}
                onCancel={() => setShowConfirm(false)}
            />

            {showCipher && (
                <CipherGate
                    t={t}
                    onSuccess={() => handleBroadcastSubmit(true)}
                    onCancel={() => setShowCipher(false)}
                />
            )}
        </motion.div>
    );
}

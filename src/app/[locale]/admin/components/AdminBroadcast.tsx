import { motion } from "framer-motion";
import { SolidCard } from "@/components/ui/SolidCard";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setGlobalBroadcast } from "@/core/actions/branding";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CipherGate } from "@/components/ui/CipherGate";

interface AdminBroadcastProps {
    t: any;
    broadcastMessage: string;
    setBroadcastMessage: (val: string) => void;
    broadcastUrgency: 'INFO' | 'WARN' | 'CRIT';
    setBroadcastUrgency: (val: 'INFO' | 'WARN' | 'CRIT') => void;
}

export function AdminBroadcast({
    t,
    broadcastMessage,
    setBroadcastMessage,
    broadcastUrgency,
    setBroadcastUrgency
}: AdminBroadcastProps) {
    const { toast } = useToast();
    const router = useRouter();

    const [showConfirm, setShowConfirm] = useState(false);
    const [showCipher, setShowCipher] = useState(false);

    const handleBroadcastSubmit = async (verified: boolean = false) => {
        if (!verified && (broadcastUrgency === 'CRIT' || broadcastMessage.length > 50)) {
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
            <SolidCard className="border border-white/5 bg-black/40 p-6 flex flex-col justify-between gap-6">
                <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold tracking-normal text-[var(--accent)]">{t.admin.broadcast.title}</h3>
                    <p className="text-xs font-serif italic text-white/50">{t.admin.broadcast.desc}</p>
                </div>

                <div className="flex flex-col gap-6 w-full justify-start">
                    <div className="space-y-3">
                        <label className="text-[10px] font-semibold tracking-normal text-white/30">Urgency Level</label>
                        <div className="flex gap-2">
                            {(['INFO', 'WARN', 'CRIT'] as const).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setBroadcastUrgency(level)}
                                    className={`flex-1 py-3 text-[10px] font-semibold tracking-normal border transition-all ${broadcastUrgency === level
                                        ? level === 'CRIT' ? 'bg-red-500/20 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                            : level === 'WARN' ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                                : 'bg-[var(--accent)]/20 border-[var(--accent)]/50 text-[var(--accent)] shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {level === 'INFO' ? 'Inform' : level === 'WARN' ? 'Warn' : 'Critical'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-semibold tracking-normal text-white/30">Broadcast Message</label>
                        <Input
                            type="text"
                            placeholder={t.admin.broadcast.placeholder}
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => handleBroadcastSubmit()}
                        className={`w-full py-4 text-xs font-semibold tracking-normal transition-all border ${broadcastUrgency === 'CRIT'
                            ? 'bg-red-600 hover:bg-red-700 border-red-500 text-white'
                            : 'bg-[var(--accent)] hover:bg-[var(--accent)]/80 border-[var(--accent)] text-white'
                            }`}
                    >
                        {t.admin.broadcast.sendBtn}
                    </button>
                </div>
            </SolidCard>

            <ConfirmationModal
                isOpen={showConfirm}
                title={broadcastUrgency === 'CRIT' ? 'AUTHORIZE EMERGENCY BROADCAST?' : t.admin.broadcast.confirmTitle}
                description={broadcastUrgency === 'CRIT' ? 'This broadcast will trigger a critical emergency visual state across the entire system. Are you absolutely certain?' : t.admin.broadcast.confirmDesc}
                variant={broadcastUrgency === 'CRIT' ? 'danger' : 'warning'}
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

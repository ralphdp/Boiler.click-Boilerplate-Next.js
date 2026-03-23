"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Loader2, Key } from "lucide-react";
import { SolidCard } from "./SolidCard";
import { Input } from "./Input";
import { Button } from "./Button";
import { verifySovereignCipher } from "@/core/actions/telemetry";

interface CipherGateProps {
    t: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CipherGate({ t, onSuccess, onCancel }: CipherGateProps) {
    const [cipher, setCipher] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);
        try {
            const res = await verifySovereignCipher(cipher);
            if (res.success) {
                onSuccess();
            } else {
                setError(true);
            }
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050505]/95"
        >
            <SolidCard className="max-w-md w-full border border-red-500/30 bg-[#0a0a0a] p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <ShieldAlert className="text-red-500 w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-normal text-white">
                            {t.admin.vouchers.cipherTitle}
                        </h2>
                        <p className="text-sm text-white/50 leading-relaxed">
                            {t.admin.vouchers.cipherDesc}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                    <div className="relative">
                        <Input
                            type="password"
                            placeholder={t.admin.vouchers.cipherPlaceholder}
                            value={cipher}
                            onChange={(e) => setCipher(e.target.value)}
                            className={`text-center tracking-[1em] font-black ${error ? 'border-red-500 text-red-500' : ''}`}
                            autoFocus
                        />
                        {error && (
                            <motion.span
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-6 left-0 w-full text-center text-xs text-red-500 font-semibold"
                            >
                                {t.admin.vouchers.cipherInvalid}
                            </motion.span>
                        )}
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            className="flex-1 text-white/50 hover:text-white"
                            tooltip="Abort cipher entry and close the gate."
                            tooltipTerm="GATE_CLOSE"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !cipher}
                            className="flex-3 bg-red-500 hover:bg-red-600 text-white font-bold h-[54px]"
                            tooltip="Verify the entered cipher and unlock the requested node."
                            tooltipTerm="CIPHER_SYNC"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : (
                                <span className="flex items-center justify-center gap-2">
                                    <Key size={14} /> {t.admin.vouchers.cipherVerify}
                                </span>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Animated background pulse */}
                <div className="absolute inset-0 bg-red-500/5 pointer-events-none animate-pulse" />
            </SolidCard>
        </motion.div>
    );
}

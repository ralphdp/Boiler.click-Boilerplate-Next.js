import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ShieldCheck, User, Mail, Building, Target } from "lucide-react";
import { ACTIVE_THEME } from "@/theme/config";

interface LeadCaptureFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LeadCaptureForm({ isOpen, onClose }: LeadCaptureFormProps) {
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        organization: "",
        interest: "Strategic Consultation",
        message: "",
        questionnaire: {
            timeline: "",
            stack: "",
            budget: "",
            objective: "",
            stage: ""
        }
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [activeSelect, setActiveSelect] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            // Note: Make sure there's an API route at /api/lead-capture !
            const res = await fetch('/api/lead-capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setTimeout(() => {
                    onClose();
                    setStatus('idle');
                    setFormData({
                        name: "",
                        email: "",
                        organization: "",
                        interest: "Strategic Consultation",
                        message: "",
                        questionnaire: {
                            timeline: "",
                            stack: "",
                            budget: "",
                            objective: "",
                            stage: ""
                        }
                    });
                }, 3000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-12">
                    {/* Dark Blurred Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-0"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-xl bg-zinc-950 border border-white/10 p-8 md:p-12 shadow-[0_0_150px_rgba(0,0,0,1)] z-10 overflow-hidden"
                    >
                        {/* Elegant Corner Accent */}
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 rotate-45 pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-white/30 hover:text-white transition-colors z-20"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 border border-white/10">
                                        <ShieldCheck className="w-5 h-5 text-white/80" />
                                    </div>
                                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/80">Initiate_Handshake</span>
                                </div>
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">
                                    Engage <span className="text-white/60">{ACTIVE_THEME.siteName}</span> Substrate
                                </h2>
                                <p className="text-sm text-zinc-500 font-serif italic">
                                    Submit your parameters to coordinate a formal transmission.
                                </p>
                            </div>

                            {status === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-12 text-center space-y-4"
                                >
                                    <div className="w-16 h-16 bg-white/5 border border-white/20 flex items-center justify-center mx-auto">
                                        <Send className="w-8 h-8 text-white/80" />
                                    </div>
                                    <div className="text-xl font-black italic uppercase tracking-tighter text-white">Transmission Successful</div>
                                    <p className="text-sm text-zinc-500">Your request has been logged to the Sovereign Architecture.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/80 transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                placeholder="Name / Designation"
                                                className="w-full bg-white/[0.03] border border-white/10 px-12 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-white/50 transition-all text-white"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/80 transition-colors" />
                                            <input
                                                required
                                                type="email"
                                                placeholder="Email Origin"
                                                className="w-full bg-white/[0.03] border border-white/10 px-12 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-white/50 transition-all text-white"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/80 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Organization"
                                                className="w-full bg-white/[0.03] border border-white/10 px-12 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-white/50 transition-all text-white"
                                                value={formData.organization}
                                                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/80 transition-colors pointer-events-none" />
                                            <button
                                                type="button"
                                                onClick={() => setActiveSelect(activeSelect === 'interest' ? null : 'interest')}
                                                className="w-full text-left bg-black border border-white/10 px-12 py-4 text-xs font-black tracking-widest outline-none focus:border-white/50 transition-all text-white/80"
                                            >
                                                {formData.interest}
                                            </button>

                                            {activeSelect === 'interest' && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setActiveSelect(null)} />
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 backdrop-blur-xl border border-white/10 flex flex-col z-50 shadow-2xl">
                                                        {[
                                                            "General Inquiry",
                                                            "Strategic Consultation (Waitlist)",
                                                            "Architectural Audit / Scale",
                                                            "Beta Program / Access"
                                                        ].map(opt => (
                                                            <button
                                                                type="button"
                                                                key={opt}
                                                                onClick={() => {
                                                                    setFormData({ ...formData, interest: opt });
                                                                    setActiveSelect(null);
                                                                }}
                                                                className="px-6 py-4 text-xs font-black tracking-widest text-left text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <AnimatePresence>
                                            {(formData.interest.includes("Audit") || formData.interest.includes("Consultation")) && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-4 pt-4 border-t border-white/5 overflow-hidden"
                                                >
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveSelect(activeSelect === 'timeline' ? null : 'timeline')}
                                                                className="w-full text-left bg-black border border-white/10 px-4 py-3 text-[10px] font-bold tracking-widest outline-none transition-all text-white/60 uppercase"
                                                            >
                                                                {formData.questionnaire.timeline || "TIMELINE"}
                                                            </button>
                                                            {activeSelect === 'timeline' && (
                                                                <>
                                                                    <div className="fixed inset-0 z-40" onClick={() => setActiveSelect(null)} />
                                                                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-black/95 backdrop-blur-xl border border-white/10 flex flex-col z-50">
                                                                        {["Immediate", "1-3 Months", "3-6 Months"].map(opt => (
                                                                            <button
                                                                                type="button"
                                                                                key={opt}
                                                                                onClick={() => {
                                                                                    setFormData({ ...formData, questionnaire: { ...formData.questionnaire, timeline: opt } });
                                                                                    setActiveSelect(null);
                                                                                }}
                                                                                className="px-4 py-3 text-[10px] font-bold tracking-widest text-left uppercase text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                                                            >
                                                                                {opt}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveSelect(activeSelect === 'budget' ? null : 'budget')}
                                                                className="w-full text-left bg-black border border-white/10 px-4 py-3 text-[10px] font-bold tracking-widest outline-none transition-all text-white/60 uppercase"
                                                            >
                                                                {formData.questionnaire.budget || "BUDGET RANGE"}
                                                            </button>
                                                            {activeSelect === 'budget' && (
                                                                <>
                                                                    <div className="fixed inset-0 z-40" onClick={() => setActiveSelect(null)} />
                                                                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-black/95 backdrop-blur-xl border border-white/10 flex flex-col z-50">
                                                                        {["$10k-$25k", "$25k-$50k", "$50k+"].map(opt => (
                                                                            <button
                                                                                type="button"
                                                                                key={opt}
                                                                                onClick={() => {
                                                                                    setFormData({ ...formData, questionnaire: { ...formData.questionnaire, budget: opt } });
                                                                                    setActiveSelect(null);
                                                                                }}
                                                                                className="px-4 py-3 text-[10px] font-bold tracking-widest text-left uppercase text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                                                            >
                                                                                {opt}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <textarea
                                            placeholder="Payload / Message"
                                            rows={4}
                                            className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 text-xs font-black tracking-widest outline-none focus:border-white/50 transition-all resize-none text-white"
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        disabled={status === 'submitting'}
                                        type="submit"
                                        className="w-full py-6 bg-white/90 text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                                    >
                                        {status === 'submitting' ? 'TRANSMITTING...' : 'INITIATE_HANDSHAKE'}
                                    </button>

                                    {status === 'error' && (
                                        <p className="text-[10px] font-black uppercase text-red-500 text-center tracking-widest mb-4">Handshake Failed. Node Unreachable.</p>
                                    )}
                                    <p className="text-[10px] font-black uppercase text-white/20 mt-6 text-center tracking-[0.3em]">
                                        DIRECT BRAIN LINK: <a href={`mailto:${process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@sovereign.local'}`} className="text-white/40 hover:text-white transition-colors">{process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'ADMIN@SOVEREIGN.LOCAL'}</a>
                                    </p>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

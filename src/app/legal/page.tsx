"use client";

import { motion } from "framer-motion";
import { Shield, ArrowLeft, FileText, Lock, Cookie, Flame } from "lucide-react";
import Link from "next/link";
import FireBackground from "@/components/FireBackground";

export default function LegalPage() {
    return (
        <div className="flex flex-col items-center min-h-screen bg-[#050505] text-white p-6 relative font-sans overflow-x-hidden pt-32 pb-48 selection:bg-purple-500/30">
            <FireBackground />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 flex flex-col items-center max-w-4xl w-full"
            >
                <Link href="/" className="self-start flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-20 text-[10px] font-black uppercase tracking-widest">
                    <ArrowLeft size={16} />
                    Back to Substrate
                </Link>

                <div className="mb-12 p-6 bg-purple-500/10 border border-purple-500/20 rounded-full">
                    <Flame size={48} className="text-purple-500" strokeWidth={1} />
                </div>

                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-center italic">
                    Legal Notice
                </h1>
                <p className="text-[10px] uppercase font-black tracking-[0.5em] text-purple-500/60 mb-16">
                    Boiler Labs // Sovereign Node Registry
                </p>

                <div className="w-full space-y-16 text-sm text-white/60 leading-relaxed">

                    {/* Terms and Conditions */}
                    <section className="bg-white/[0.02] border border-white/5 p-12 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rotate-45 transform translate-x-8 -translate-y-8" />
                        <div className="flex items-center gap-4 mb-8">
                            <FileText className="text-purple-500" size={20} />
                            <h2 className="text-white text-[10px] font-black uppercase tracking-[0.4em]">Substrate Terms</h2>
                        </div>
                        <div className="space-y-4">
                            <p>
                                By utilizing Boiler™ boilerplates, you enter as a node in the sovereign architectural network. You agree to use these substrates for modern innovation and adhere to the Boiler Labs development protocols.
                            </p>
                            <p>
                                All code, substrates, and components remain the intellectual property of Boiler Labs and Ethos-Nexus Protocol.
                            </p>
                        </div>
                    </section>

                    {/* Privacy Policy */}
                    <section className="bg-white/[0.02] border border-white/5 p-12 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rotate-45 transform translate-x-8 -translate-y-8" />
                        <div className="flex items-center gap-4 mb-8">
                            <Lock className="text-purple-500" size={20} />
                            <h2 className="text-white text-[10px] font-black uppercase tracking-[0.4em]">Privacy Policy</h2>
                        </div>
                        <div className="space-y-4">
                            <p>
                                Boiler™ does not collect personally identifiable information from its substrates or their respective operators. We prioritize informational sovereignty and do not utilize third-party trackers or data analytics engines.
                            </p>
                        </div>
                    </section>

                    {/* Cookie Policy */}
                    <section className="bg-white/[0.02] border border-white/5 p-12 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rotate-45 transform translate-x-8 -translate-y-8" />
                        <div className="flex items-center gap-4 mb-8">
                            <Cookie className="text-purple-500" size={20} />
                            <h2 className="text-white text-[10px] font-black uppercase tracking-[0.4em]">Cookie Policy</h2>
                        </div>
                        <div className="space-y-4">
                            <p>
                                We utilize only session-critical cookies to ensure stability and proper routing within the Boiler™ substrate during your session.
                            </p>
                        </div>
                    </section>

                </div>

                <p className="mt-20 text-[10px] text-white/20 font-black tracking-widest uppercase">
                    Revision: 2026.02 // B-1.2 // VERIFIED
                </p>
            </motion.div>

            {/* Grid Backdrop */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
        </div>
    );
}

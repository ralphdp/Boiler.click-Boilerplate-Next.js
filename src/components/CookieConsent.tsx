'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ConsentSettings = {
    necessary: boolean;
    analytics: boolean; // Google Analytics
    marketing: boolean; // Pixel, Bing
};

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [settings, setSettings] = useState<ConsentSettings>({
        necessary: true, // Always true
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        // Check if consent is already given
        const savedConsent = localStorage.getItem('sovereign_consent');
        if (!savedConsent) {
            setTimeout(() => setShowBanner(true), 1500); // Small delay to let initial animation finish
        } else {
            const parsed = JSON.parse(savedConsent);
            setSettings(parsed);
            applyConsent(parsed);
        }
    }, []);

    const applyConsent = (consentSettings: ConsentSettings) => {
        // Analytics (GA4)
        if (consentSettings.analytics) {
            // Initialize GA4 logic here, e.g. pushing to dataLayer
            if (typeof window !== 'undefined' && (window as any).dataLayer) {
                (window as any).dataLayer.push({ event: 'consent_granted_analytics' });
            }
        } else {
            // Clear or block GA4
        }

        // Marketing (Pixels)
        if (consentSettings.marketing) {
            if (typeof window !== 'undefined' && (window as any).dataLayer) {
                (window as any).dataLayer.push({ event: 'consent_granted_marketing' });
            }
        }
    };

    const handleAcceptAll = () => {
        const allConsent = { necessary: true, analytics: true, marketing: true };
        setSettings(allConsent);
        localStorage.setItem('sovereign_consent', JSON.stringify(allConsent));
        applyConsent(allConsent);
        setShowBanner(false);
    };

    const handleDeclineAll = () => {
        const noConsent = { necessary: true, analytics: false, marketing: false };
        setSettings(noConsent);
        localStorage.setItem('sovereign_consent', JSON.stringify(noConsent));
        applyConsent(noConsent);
        setShowBanner(false);
    };

    const handleSavePreferences = () => {
        localStorage.setItem('sovereign_consent', JSON.stringify(settings));
        applyConsent(settings);
        setShowPreferences(false);
        setShowBanner(false);
    };

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 200, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
                >
                    <div className="max-w-4xl mx-auto bg-zinc-950 border border-zinc-800 p-6 flex flex-col md:flex-row gap-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute top-0 left-0 w-1 h-full bg-neon-green/50" />

                        <div className="flex-1 space-y-3">
                            <h3 className="text-[12px] uppercase tracking-[0.2em] text-[var(--foreground)] font-black">
                                Architectural Consistency: Telemetry
                            </h3>
                            <p className="text-11px sm:text-xs text-zinc-400 font-serif italic max-w-2xl leading-relaxed">
                                This system operates on absolute transparency. We use strictly necessary node tokens to maintain baseline architecture. Optional analytics and marketing telemetry run only with explicit sovereign consensus. Nothing stochastic. Nothing hidden.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 items-start md:items-center">
                            <button
                                onClick={() => setShowPreferences(true)}
                                className="text-[10px] uppercase font-mono text-zinc-500 hover:text-white transition-colors underline decoration-dotted underline-offset-4"
                            >
                                Configure_Telemetry
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeclineAll}
                                    className="px-4 py-2 border border-zinc-800 text-[10px] font-black tracking-widest uppercase hover:bg-zinc-900 transition-colors text-zinc-400"
                                >
                                    Reject All
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="px-4 py-2 bg-neon-green/10 border border-neon-green text-neon-green text-[10px] font-black tracking-widest uppercase hover:bg-neon-green hover:text-black transition-colors"
                                >
                                    Accept All
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {showPreferences && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg p-8 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-neon-green/50" />

                        <h2 className="text-[14px] uppercase tracking-[0.2em] font-black mb-6 text-white border-b border-zinc-800 pb-4">
                            Telemetry Parameters
                        </h2>

                        <div className="space-y-6 mb-8">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Necessary Operations</h4>
                                    <p className="text-[11px] text-zinc-500 italic font-serif">Structural session cookies required for sovereignty of state and CSRF immunity. Non-negotiable.</p>
                                </div>
                                <div className="text-[10px] text-neon-green font-mono uppercase bg-neon-green/10 px-2 py-1 border border-neon-green/30">
                                    Always Active
                                </div>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Analytics Intelligence</h4>
                                    <p className="text-[11px] text-zinc-500 italic font-serif">Google Analytics tracking for monitoring architectural bandwidth and engagement matrices.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={settings.analytics} onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })} />
                                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
                                </label>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Marketing / Retargeting</h4>
                                    <p className="text-[11px] text-zinc-500 italic font-serif">Meta/Facebook pixel, LinkedIn logic, and Bing behavioral tracking.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={settings.marketing} onChange={(e) => setSettings({ ...settings, marketing: e.target.checked })} />
                                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 border-t border-zinc-800 pt-6">
                            <button
                                onClick={() => setShowPreferences(false)}
                                className="px-6 py-2 border border-zinc-800 text-[10px] font-black tracking-widest uppercase hover:text-white transition-colors text-zinc-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePreferences}
                                className="px-6 py-2 border border-neon-green bg-neon-green/10 text-neon-green text-[10px] font-black tracking-widest uppercase hover:bg-neon-green hover:text-black transition-colors"
                            >
                                Lock Parameters
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

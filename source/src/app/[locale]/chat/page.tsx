import { ChatUI } from "@/components/chat/ChatUI";

export default function ChatPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center bg-[radial-gradient(circle_at_top,var(--accent)/0.05,transparent)]">
            <div className="w-full max-w-4xl flex flex-col items-center gap-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black uppercase tracking-[0.3em] text-[var(--accent)]">Sovereign Terminal</h1>
                    <p className="text-xs font-serif italic text-white/50">Unified Artificial Intelligence Substrate // Vanguard Mode</p>
                </div>

                <ChatUI className="h-[700px] max-w-none w-full" />

                <div className="text-[10px] text-white/20 uppercase tracking-widest flex items-center gap-4">
                    <span>Node: 6/11-V4</span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span>L7 Stealth Protocol</span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span>Zero Halting Active</span>
                </div>
            </div>
        </main>
    );
}

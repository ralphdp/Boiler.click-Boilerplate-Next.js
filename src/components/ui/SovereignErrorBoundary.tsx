"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Terminal } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class SovereignErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        // IMPLEMENTATION: Telemetry hooks to Sentry / PostHog
        // Sentry.captureException(error, { extra: errorInfo });
        // posthog.capture('Frontend Exception', { error: error.message });

        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6 font-mono text-[var(--foreground)]">
                    <div className="w-full max-w-2xl bg-black border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)] rounded-lg overflow-hidden">
                        {/* Fake Terminal Header */}
                        <div className="flex items-center px-4 py-2 bg-red-500/10 border-b border-red-500/20">
                            <Terminal className="w-4 h-4 text-red-500 mr-2" />
                            <span className="text-xs uppercase tracking-widest text-red-500/80">System Exception</span>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h1 className="text-xl font-black text-red-500 uppercase tracking-widest border-l-4 border-red-500 pl-4 mb-2">
                                    Substrate Failure Detected
                                </h1>
                                <p className="text-white/60 text-sm">
                                    The architectural node encountered an unhandled exception. Telemetry has been logged.
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-4 rounded text-xs text-red-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {this.state.error && this.state.error.toString()}
                            </div>

                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black border border-red-500/30 uppercase tracking-[0.2em] font-black text-xs transition-colors"
                            >
                                Reboot Node
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

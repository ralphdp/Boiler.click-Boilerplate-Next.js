/**
 * ARCHITECTURAL NOTICE:
 * admin.ts is now DEPRECATED as of V6.8.5.
 * 
 * Logic has been decoupled into specialized action modules:
 * - nodes.ts: Identity, role management, and audit traces.
 * - system.ts: Global configuration, telemetry, and protocols.
 * - commerce.ts: Store management and pricing matrix.
 * 
 * This file remains for backward compatibility during the substrate migration phase.
 */

export * from "./nodes";
export * from "./system";
export * from "./commerce";

import { z } from "zod";

/**
 * Vanguard Firebase Schema Topology
 * Strictly types the payload structures for database documents.
 */

export const PlanTypeEnum = z.enum(["FREE", "PRO", "ENTERPRISE", "VANGUARD"]);

export const DatabaseSchemas = {
    // ---------------------------------------------------------
    // users/{uid}
    // ---------------------------------------------------------
    User: z.object({
        email: z.string().email(),
        name: z.string().optional(),
        role: z.enum(["USER", "ADMIN"]),
        mfaEnabled: z.boolean().default(false),
        mfaSecret: z.string().optional(),
        tokensValidAfterTime: z.number().optional(), // Replaces validSince
        workspaces: z.record(z.string(), z.object({
            role: z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"]),
            name: z.string()
        })).optional()
    }),

    // ---------------------------------------------------------
    // omni_workspaces/{workspaceId}
    // ---------------------------------------------------------
    Workspace: z.object({
        name: z.string(),
        description: z.string().optional(),
        ownerId: z.string(),
        status: z.enum(["ACTIVE", "SUSPENDED", "DELETED"]),
        createdAt: z.number(),
        deletedAt: z.number().optional(),
        planId: PlanTypeEnum.default("FREE"),
        stripeCustomerId: z.string().optional(),
        subscriptionId: z.string().optional(),
        subscriptionStatus: z.enum(["active", "past_due", "canceled", "unpaid", "incomplete"]).optional(),
        currentPeriodEnd: z.number().nullable().optional(),
    }),

    // omni_workspaces/{workspaceId}/members/{uid}
    WorkspaceMember: z.object({
        role: z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"]),
        email: z.string().email(),
        joinedAt: z.number()
    }),

    // omni_workspaces/{workspaceId}/audit_logs/{logId}
    AuditLog: z.object({
        actor: z.object({
            id: z.string(),
            email: z.string(),
            name: z.string().optional()
        }),
        action: z.string(),
        resource: z.string(),
        description: z.string(),
        metadata: z.record(z.string(), z.any()).optional().default({}),
        severity: z.enum(["INFO", "WARNING", "CRITICAL"]).default("INFO"),
        timestamp: z.number()
    }),

    // ---------------------------------------------------------
    // sovereign_config/global
    // ---------------------------------------------------------
    SystemConfig: z.object({
        mfaEnforced: z.boolean().default(false),
        sandboxMode: z.boolean().default(false),
        domainShield: z.boolean().default(false),
        haltingProtocol: z.boolean().default(false),
        preLaunchMode: z.boolean().default(false),
        commerceMode: z.boolean().default(false),
        siteTitle: z.string().default("Vanguard Substrate"),
        typography: z.string().default("Elite Execution Framework"),
        contactEmail: z.string().optional(),
        resendFrom: z.string().optional(),
        primaryColor: z.string().default("#111111"),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional()
    })
};

export type VanguardUser = z.infer<typeof DatabaseSchemas.User>;
export type VanguardWorkspace = z.infer<typeof DatabaseSchemas.Workspace>;
export type VanguardAuditLog = z.infer<typeof DatabaseSchemas.AuditLog>;
export type VanguardSystemConfig = z.infer<typeof DatabaseSchemas.SystemConfig>;

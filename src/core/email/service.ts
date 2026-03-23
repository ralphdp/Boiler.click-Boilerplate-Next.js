import { Resend } from "resend";
import { getGlobalOverrides } from "@/core/actions/branding";

let resendInstance: Resend | null = null;

async function getResend() {
    if (resendInstance) return resendInstance;

    // We can pull the key from env or a secret store
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY not configured");

    resendInstance = new Resend(key);
    return resendInstance;
}

export async function sendVanguardEmail({
    to,
    subject,
    template,
}: {
    to: string | string[];
    subject: string;
    template: React.ReactElement;
}) {
    try {
        const resend = await getResend();
        const overrides = await getGlobalOverrides();

        // 1. Resolve raw origin domain (from Factory Defaults if DB is empty)
        let finalFromAddress = overrides.resendFrom || process.env.RESEND_DEFAULT_FROM || "Boilerplate <noreply@boiler.click>";

        const { data, error } = await resend.emails.send({
            from: finalFromAddress,
            to: Array.isArray(to) ? to : [to],
            subject: `[VANGUARD] ${subject}`,
            react: template,
        });

        if (error) {
            console.error("Resend error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (e) {
        console.error("Email service error:", e);
        return { success: false, error: e };
    }
}

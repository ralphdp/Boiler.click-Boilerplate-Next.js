import { Resend } from 'resend';
import * as React from 'react';
import VanguardEmail from '@/components/emails/VanguardEmail';

// Ensure this environment variable is set in production
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

// The domain must be registered in your Resend account
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'Boiler Substrate <system@boiler.click>';

export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    heading?: string;
    message: string;
    ctaText?: string;
    ctaLink?: string;
}

/**
 * Dispatch an email strictly formatted according to Vanguard aesthetic protocols.
 */
export async function sendVanguardEmail({
    to,
    subject,
    heading,
    message,
    ctaText,
    ctaLink,
}: SendEmailOptions) {
    try {
        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM,
            to,
            subject,
            react: VanguardEmail({
                heading: heading || subject,
                previewText: message.substring(0, 100),
                message,
                ctaText,
                ctaLink,
            }) as React.ReactElement,
        });

        if (error) {
            console.error('[RESEND] Substrate Transmission Failure:', error);
            throw new Error(`Email dispatch failed: ${error.message}`);
        }

        console.log(`[RESEND] Transmission Confirmed: ${data?.id}`);
        return { success: true, id: data?.id };
    } catch (error) {
        console.error('[RESEND] Critical Transport Error:', error);
        return { success: false, error };
    }
}

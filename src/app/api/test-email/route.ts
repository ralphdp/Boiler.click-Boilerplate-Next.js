import { NextResponse } from 'next/server';
import { sendVanguardEmail } from '@/lib/emails/resend';

export async function POST(req: Request) {
    try {
        const { to, subject, heading, message, ctaText, ctaLink } = await req.json();

        if (!to || !message) {
            return NextResponse.json(
                { error: 'Missing required fields (to, message).' },
                { status: 400 }
            );
        }

        const { success, error, id } = await sendVanguardEmail({
            to,
            subject: subject || 'Test System Notification',
            heading,
            message,
            ctaText,
            ctaLink,
        });

        if (!success) {
            return NextResponse.json({ error: (error as any)?.message || 'Failed to dispatch email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Mail transmission confirmed.', id }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

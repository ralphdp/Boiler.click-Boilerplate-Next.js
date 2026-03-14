import type { Metadata } from 'next';
import { auth } from '@/core/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Handshake | Sovereign Gate',
    description: 'Identity verification for the Yiven Protocol.',
}

export default async function HandshakeLayout({
    children,
    params
}: {
    children: React.ReactNode,
    params: Promise<{ locale: string }>
}) {
    const session = await auth();
    if (session?.user) {
        const resolved = await params;
        redirect(`/${resolved.locale}/dashboard`);
    }

    return <>{children}</>
}

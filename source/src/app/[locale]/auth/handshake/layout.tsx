import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Handshake | Sovereign Gate',
    description: 'Identity verification for the Yiven Protocol.',
}

export default function HandshakeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}

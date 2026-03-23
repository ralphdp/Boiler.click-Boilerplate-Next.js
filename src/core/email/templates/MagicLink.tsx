import * as React from 'react';
import { BaseTemplate } from './BaseTemplate';
import { Text, Link, Section } from '@react-email/components';

interface MagicLinkProps {
    url: string;
    host: string;
}

export const MagicLink = ({ url, host }: MagicLinkProps) => {
    return (
        <BaseTemplate
            preview="Secure Access Handshake"
            title="Authentication Request"
        >
            <Text style={textStyle}>
                A secure login link was requested for <strong>{host}</strong>.
            </Text>

            <Section style={btnContainer}>
                <Link href={url} style={button}>
                    AUTHENTICATE
                </Link>
            </Section>

            <Text style={subtextStyle}>
                If you did not request this email, you can safely ignore it.
            </Text>
            <Text style={subtextStyle}>
                Link expires inherently in a few minutes.
            </Text>
        </BaseTemplate>
    );
};

const textStyle = {
    color: '#e5e5e5',
    fontSize: '14px',
    lineHeight: '22px',
    marginBottom: '24px',
    textAlign: 'center' as const,
};

const subtextStyle = {
    color: '#666',
    fontSize: '12px',
    lineHeight: '18px',
    textAlign: 'center' as const,
};

const btnContainer = {
    textAlign: 'center' as const,
    marginBottom: '32px',
};

const button = {
    backgroundColor: 'transparent',
    border: '1px solid #333',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '3px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 32px',
    textTransform: 'uppercase' as const,
};

export default MagicLink;

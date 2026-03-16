import * as React from 'react';
import { Text, Heading, Button, Section } from '@react-email/components';
import { BaseTemplate } from './BaseTemplate';

interface SecurityAlertProps {
    action: string;
    user: string;
    ip: string;
    timestamp: string;
}

export const SecurityAlertEmail = ({ action, user, ip, timestamp }: SecurityAlertProps) => (
    <BaseTemplate
        title="SECURITY ALERT"
        preview={`Unauthorized action detected: ${action}`}
    >
        <Heading style={subHeading}>UNAUTHORIZED ACCESS LOGGED</Heading>
        <Text style={warningText}>
            Our security substrate detected a critical administrative action attempted outside of standard protocols.
        </Text>

        <Section style={detailsBox}>
            <Text style={detail}><strong>ACTION:</strong> {action}</Text>
            <Text style={detail}><strong>USER:</strong> {user}</Text>
            <Text style={detail}><strong>SOURCE IP:</strong> {ip}</Text>
            <Text style={detail}><strong>TIMESTAMP:</strong> {timestamp}</Text>
        </Section>

        <Text style={text}>
            If this wasn't you, please initiate a global lockout immediately from the Root Console.
        </Text>

        <Button
            style={button}
            href="https://boiler.logos.pub/admin#audit"
        >
            Inquire Audit Logs
        </Button>
    </BaseTemplate>
);

const subHeading = {
    color: '#ef4444',
    fontSize: '18px',
    fontWeight: 'black',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
};

const warningText = {
    color: '#888',
    fontSize: '14px',
    fontStyle: 'italic',
};

const detailsBox = {
    backgroundColor: '#0c0c0c',
    border: '1px solid #222',
    padding: '20px',
    margin: '20px 0',
};

const detail = {
    color: '#ddd',
    fontSize: '12px',
    margin: '4px 0',
    fontFamily: 'monospace',
};

const text = {
    color: '#888',
    fontSize: '13px',
    margin: '20px 0',
};

const button = {
    backgroundColor: '#a855f7',
    borderRadius: '0px',
    color: '#000',
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '2px',
    padding: '12px 24px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '100%',
    textTransform: 'uppercase' as const,
};

export default SecurityAlertEmail;

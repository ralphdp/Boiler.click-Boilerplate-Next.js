import { describe, it, expect } from 'vitest';
import { generateCSP } from '../csp-edge';
import { checkDomainShield } from '../domain-shield-edge';

describe('Edge Security Substrate', () => {
    describe('csp-edge.ts - Content Security Policy', () => {
        it('should generate a valid cryptographic nonce within the CSP header', () => {
            const { nonce, cspHeader } = generateCSP();

            expect(nonce).toBeDefined();
            expect(nonce.length).toBeGreaterThan(10); // Base64 UUID length

            expect(cspHeader).toContain(`'nonce-${nonce}'`);
            expect(cspHeader).toContain("default-src 'self'");
            expect(cspHeader).toContain("upgrade-insecure-requests");
        });

        it('should generate a unique nonce on each invocation', () => {
            const result1 = generateCSP();
            const result2 = generateCSP();
            expect(result1.nonce).not.toBe(result2.nonce);
        });
    });

    describe('domain-shield-edge.ts - Referrer Blacklist', () => {
        it('should allow traffic when the domain shield is mathematically inactive', () => {
            const response = checkDomainShield('https://malicious.com', false);
            expect(response).toBeNull();
        });

        it('should block known blacklisted heuristics when active', () => {
            // mailinator is a known heuristic blocked by SECURITY_CONFIG
            const response = checkDomainShield('https://mailinator.com/inbox', true);
            expect(response).not.toBeNull();
            expect(response?.status).toBe(403);
        });

        it('should allow legitimate traffic heuristically', () => {
            const response = checkDomainShield('https://google.com/search', true);
            expect(response).toBeNull();
        });
    });
});

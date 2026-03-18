import { describe, it, expect } from 'vitest';
import { SecurityUtils } from '../security-config';

describe('SecurityUtils: Domain Shield', () => {
    it('should block blacklisted domains', () => {
        expect(SecurityUtils.isDomainBlocked('test@mailinator.com')).toBe(true);
        expect(SecurityUtils.isDomainBlocked('guerrillamail.com')).toBe(true);
    });

    it('should allow legitimate domains', () => {
        expect(SecurityUtils.isDomainBlocked('rafael@rdepaz.com')).toBe(false);
        expect(SecurityUtils.isDomainBlocked('google.com')).toBe(false);
    });
});

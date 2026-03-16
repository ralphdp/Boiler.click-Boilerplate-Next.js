// src/core/security/security-config.ts

// Centralized security configuration and best practices

export const SECURITY_CONFIG = {
    // Request limits
    REQUEST_SIZE_LIMITS: {
        GENERAL: 1024 * 1024, // 1MB
        FILE_UPLOAD: 5 * 1024 * 1024, // 5MB
        ADMIN_UPLOAD: 10 * 1024 * 1024, // 10MB for admin uploads
    },

    // Rate limiting
    RATE_LIMITS: {
        GENERAL_REQUESTS: 5,
        SENSITIVE_REQUESTS: 3,
        WINDOW_MS: 60 * 1000, // 1 minute
        CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
    },

    // Session security
    SESSION: {
        TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
        MAX_SESSIONS: 10000,
        CLEANUP_INTERVAL_MS: 30 * 60 * 1000, // 30 minutes
    },

    // Authentication
    AUTH: {
        PASSWORD_MIN_LENGTH: 12,
        REQUIRE_COMPLEXITY: true,
        MAX_FAILED_ATTEMPTS: 5,
        LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
        RESET_WINDOW_MS: 60 * 60 * 1000, // 1 hour
        SESSION_DAYS: 30,
    },

    // CSRF protection
    CSRF: {
        TOKEN_EXPIRY_MS: 60 * 60 * 1000, // 1 hour
        CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
    },

    // Input validation
    INPUT_VALIDATION: {
        MAX_TEXT_LENGTH: 10000,
        MAX_SLUG_LENGTH: 200,
        MAX_TAG_LENGTH: 50,
        MAX_TAGS_COUNT: 20,
        MAX_EMAIL_LENGTH: 100,
        MAX_URL_LENGTH: 2000,
        DISALLOW_CONTROL_CHARS: true,
    },

    // Content Security Policy
    CSP: {
        NONCE_LENGTH: 16,
        REPORT_URI: '/api/csp-report',
        VIOLATION_THRESHOLD: 3,
    },

    // Security monitoring
    MONITORING: {
        MAX_EVENTS: 1000,
        ALERT_THRESHOLDS: {
            AUTH_FAILURES_PER_IP: 5,
            RATE_LIMIT_HITS_PER_IP: 10,
            CSP_VIOLATIONS_PER_IP: 3,
            TIME_WINDOW_MINUTES: 15,
        },
    },

    // Database security
    DATABASE: {
        MAX_CONNECTIONS: 20,
        MIN_CONNECTIONS: 2,
        IDLE_TIMEOUT_MS: 30000,
        CONNECTION_TIMEOUT_MS: 2000,
        QUERY_TIMEOUT_MS: 10000,
        STATEMENT_TIMEOUT_MS: 10000,
    },

    // File upload security
    FILE_UPLOAD: {
        ALLOWED_MIME_TYPES: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/svg+xml',
        ],
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        MAX_FILENAME_LENGTH: 100,
    },

    // Security headers
    HEADERS: {
        HSTS_MAX_AGE: 31536000, // 1 year
        HSTS_INCLUDE_SUBDOMAINS: true,
        HSTS_PRELOAD: true,
        REFERRER_POLICY: 'strict-origin-when-cross-origin',
    },

    // Domain Shield configuration
    DOMAIN_SHIELD: {
        BLOCK_DISPOSABLE_EMAILS: true,
        BLOCK_MALICIOUS_REFERRERS: true,
        BLACKLISTED_DOMAINS: [
            'mailinator.com',
            'guerrillamail.com',
            'temp-mail.org',
            '10minutemail.com',
            'yopmail.com',
            'dispostable.com',
        ],
    },
} as const;

// Security best practices utilities
export class SecurityUtils {
    /**
     * Validates that a string doesn't contain suspicious patterns
     */
    static isSuspiciousString(str: string): boolean {
        const suspiciousPatterns = [
            /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /data:text\/html/gi,
            /on\w+\s*=\s*["'][^"']*["']/gi,
            /(.)\1{100,}/, // Excessive repeating characters
            /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, // Control characters
        ];

        return suspiciousPatterns.some(pattern => pattern.test(str));
    }

    /**
     * Checks if a domain or email domain is on the blacklist
     */
    static isDomainBlocked(domainOrEmail: string): boolean {
        const domain = domainOrEmail.includes('@')
            ? domainOrEmail.split('@')[1]
            : domainOrEmail;

        return SECURITY_CONFIG.DOMAIN_SHIELD.BLACKLISTED_DOMAINS.some(
            blocked => domain.toLowerCase().endsWith(blocked.toLowerCase())
        );
    }

    /**
     * Sanitizes a filename for safe storage
     */
    static sanitizeFilename(filename: string): string {
        return filename
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, '')
            .replace(/[-_]+/g, '-')
            .replace(/^\.+/, '')
            .slice(0, SECURITY_CONFIG.FILE_UPLOAD.MAX_FILENAME_LENGTH)
            .replace(/\.$/, ''); // Remove trailing dots
    }

    /**
     * Checks if an IP address is in a private range (for rate limiting exemptions)
     */
    static isPrivateIP(ip: string): boolean {
        const privateRanges = [
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./,
            /^127\./,
            /^localhost$/,
            /^::1$/,
        ];

        return privateRanges.some(range => range.test(ip));
    }

    /**
     * Generates a secure random string
     */
    static generateSecureToken(length: number = 32): string {
        try {
            if (typeof crypto !== 'undefined') {
                const array = new Uint8Array(length);
                crypto.getRandomValues(array);
                return Array.from(array)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('')
                    .slice(0, length);
            }
        } catch (e) {
            // Fallback
        }
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    /**
     * Validates password complexity
     */
    static isPasswordComplex(password: string): boolean {
        if (password.length < SECURITY_CONFIG.AUTH.PASSWORD_MIN_LENGTH) {
            return false;
        }

        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        return hasUppercase && hasLowercase && hasNumbers && hasSpecialChars;
    }

    /**
     * Sanitizes HTML content for safe display
     */
    static sanitizeHtml(html: string): string {
        return html
            .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
            .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '')
            .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, '');
    }

    /**
     * Logs security events with consistent formatting
     */
    static logSecurityEvent(
        level: 'info' | 'warn' | 'error',
        message: string,
        details?: Record<string, any>
    ): void {
        const emoji = { info: 'ℹ️', warn: '⚠️', error: '🚨' }[level];
        console.log(`${emoji} SECURITY: ${message}`, details ? JSON.stringify(details, null, 2) : '');
    }
}

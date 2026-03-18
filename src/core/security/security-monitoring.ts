// src/core/security/security-monitoring.ts

export interface SecurityEvent {
    type: 'suspicious_request' | 'rate_limit_hit' | 'auth_failure' | 'csp_violation' | 'xss_attempt' | 'suspicious_input';
    severity: 'low' | 'medium' | 'high' | 'critical';
    ip: string;
    userAgent?: string;
    path?: string;
    details: Record<string, any>;
    timestamp: Date;
}

class SecurityMonitor {
    private events: SecurityEvent[] = [];
    private readonly maxEvents = 1000;
    private readonly alertThresholds = {
        auth_failures_per_ip: 5,
        rate_limit_hits_per_ip: 10,
        csp_violations_per_ip: 3,
        time_window_minutes: 15
    };

    logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
        const isDev = process.env.NODE_ENV === "development";
        const explicitlyEnabled = process.env.ENABLE_SECURITY_MONITORING === 'true';

        // Debug logging in development
        if (isDev) {
            console.log('🔒 Security Event:', {
                type: event.type,
                severity: event.severity,
                ip: event.ip,
                path: event.path
            });
        }

        const securityEvent: SecurityEvent = {
            ...event,
            timestamp: new Date()
        };

        // Store in-memory for the current runtime session (will reset on server restart)
        this.events.push(securityEvent);

        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }

        this.logSecurityEvent(securityEvent);
        this.checkForAlerts(securityEvent);
    }

    private logSecurityEvent(event: SecurityEvent): void {
        const logEntry = {
            level: 'security',
            severity: event.severity,
            type: event.type,
            ip: event.ip,
            path: event.path,
            userAgent: event.userAgent?.slice(0, 200),
            details: event.details,
            timestamp: event.timestamp.toISOString()
        };

        const severityLabel = event.severity.toUpperCase();
        console.log(`🛡️ SECURITY EVENT [${severityLabel}]:`, JSON.stringify(logEntry, null, 2));
    }

    private checkForAlerts(event: SecurityEvent): void {
        const now = Date.now();
        const windowStart = now - (this.alertThresholds.time_window_minutes * 60 * 1000);

        const recentEvents = this.events.filter(e =>
            e.timestamp.getTime() >= windowStart &&
            e.ip === event.ip
        );

        const authFailures = recentEvents.filter(e => e.type === 'auth_failure').length;
        const rateLimitHits = recentEvents.filter(e => e.type === 'rate_limit_hit').length;
        const cspViolations = recentEvents.filter(e => e.type === 'csp_violation').length;

        if (authFailures >= this.alertThresholds.auth_failures_per_ip) {
            this.alert('HIGH', `Multiple authentication failures from IP ${event.ip} (${authFailures} attempts)`);
        }

        if (rateLimitHits >= this.alertThresholds.rate_limit_hits_per_ip) {
            this.alert('HIGH', `Excessive rate limiting from IP ${event.ip} (${rateLimitHits} hits)`);
        }

        if (cspViolations >= this.alertThresholds.csp_violations_per_ip) {
            this.alert('MEDIUM', `Multiple CSP violations from IP ${event.ip} (${cspViolations} violations)`);
        }

        if (event.severity === 'critical') {
            this.alert('CRITICAL', `Critical security event: ${event.type} from IP ${event.ip}`);
        }
    }

    private alert(severity: string, message: string): void {
        console.error(`🚨 SECURITY ALERT [${severity}]: ${message}`);
    }

    getSecurityStats() {
        const eventsByType: Record<string, number> = {};
        const eventsBySeverity: Record<string, number> = {};

        this.events.forEach(event => {
            eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
            eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
        });

        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const recentEvents = this.events.filter(e => e.timestamp.getTime() > oneHourAgo);

        return {
            totalEvents: this.events.length,
            eventsByType,
            eventsBySeverity,
            recentEvents
        };
    }

    logSuspiciousRequest(ip: string, path: string, userAgent?: string, details?: Record<string, any>): void {
        this.logEvent({
            type: 'suspicious_request',
            severity: 'medium',
            ip,
            path,
            userAgent,
            details: details || {}
        });
    }

    logRateLimitHit(ip: string, path: string, userAgent?: string): void {
        this.logEvent({
            type: 'rate_limit_hit',
            severity: 'low',
            ip,
            path,
            userAgent,
            details: {}
        });
    }

    logAuthFailure(ip: string, userAgent?: string, details?: Record<string, any>): void {
        this.logEvent({
            type: 'auth_failure',
            severity: 'medium',
            ip,
            userAgent,
            details: details || {}
        });
    }

    logCSPViolation(ip: string, violation: Record<string, any>): void {
        this.logEvent({
            type: 'csp_violation',
            severity: violation['effective-directive']?.includes('script') ? 'high' : 'medium',
            ip,
            details: { violation }
        });
    }

    logXSSAttempt(ip: string, path: string, userAgent?: string, details?: Record<string, any>): void {
        this.logEvent({
            type: 'xss_attempt',
            severity: 'high',
            ip,
            path,
            userAgent,
            details: details || {}
        });
    }

    logSuspiciousInput(ip: string, field: string, value: string, path?: string): void {
        this.logEvent({
            type: 'suspicious_input',
            severity: 'low',
            ip,
            path,
            details: {
                field,
                valueLength: value.length,
                suspiciousPatterns: this.detectSuspiciousPatterns(value)
            }
        });
    }

    private detectSuspiciousPatterns(value: string): string[] {
        const patterns = [
            { name: 'script_tags', regex: /<script/i },
            { name: 'javascript_urls', regex: /javascript:/i },
            { name: 'data_urls', regex: /data:text\/html/i },
            { name: 'excessive_repeats', regex: /(.)\1{50,}/ },
            { name: 'control_chars', regex: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/ },
        ];

        return patterns
            .filter(pattern => pattern.regex.test(value))
            .map(pattern => pattern.name);
    }
}

export const securityMonitor = new SecurityMonitor();

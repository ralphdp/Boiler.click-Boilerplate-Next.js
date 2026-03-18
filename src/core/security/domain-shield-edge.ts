import { NextResponse } from "next/server";
import { SECURITY_CONFIG } from "./security-config";

export function checkDomainShield(referrer: string | null, domainShieldActive: boolean): NextResponse | null {
    if (domainShieldActive && referrer) {
        const isMaliciousReferrer = SECURITY_CONFIG.DOMAIN_SHIELD.BLACKLISTED_DOMAINS.some(
            (domain: string) => referrer.toLowerCase().includes(domain.toLowerCase())
        );

        if (isMaliciousReferrer) {
            return new NextResponse("Vanguard Shield: Inbound Domain Blacklisted.", { status: 403 });
        }
    }
    return null;
}

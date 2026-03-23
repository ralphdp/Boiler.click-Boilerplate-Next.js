import { auth } from './auth';
import { admin } from './admin';
import { dashboard } from './dashboard';
import { settings } from './settings';
import { workspaces } from './workspaces';
import { billing } from './billing_ws';
import { home } from './home';
import { demoMatrix } from './demo';
import { waitlist } from './waitlist';

export const en = {
    auth,
    admin,
    dashboard,
    settings,
    workspaces,
    billing,
    home,
    demoMatrix,
    waitlist,
    // Add other root-level translations here
    systemHalted: {
        title: "SYSTEM HALTED",
        descLine1: "The Sovereign matrix has been intentionally severed by administrative directive.",
        descLine2: "Contact the Prime Architect if you believe this is a logic error."
    },
    cookieConsent: {
        title: "COOKIE CONSENT",
        desc: "We use cryptographic tracers to ensure your session remains bound to the active substrate.",
        managePreferences: "Manage Preferences",
        rejectAll: "Reject All",
        acceptAll: "Accept All",
        cookiePreferences: "Cookie Preferences",
        essential: "Essential",
        essentialCookies: "Essential Cookies",
        essentialDesc: "Required for identity handshake and session persistence.",
        analytics: "Analytics",
        analyticsCookies: "Analytics Cookies",
        analyticsDesc: "Helps us optimize the telemetry of the global matrix.",
        marketing: "Marketing",
        marketingCookies: "Marketing Cookies",
        marketingDesc: "Used for targeted communication pulses.",
        savePreferences: "Save Preferences",
        alwaysActive: "ALWAYS ACTIVE",
        cancel: "CANCEL"
    },
    globalError: {
        title: "SYSTEM CRASH",
        subtitle: "LOGIC RUPTURE DETECTED",
        description: "A fatal logic rupture has occurred. The Sovereign cluster is attempting self-healing.",
        body: "Detailed error telemetry trace:",
        digest: "Rupture ID:",
        retry: "Attempt Re-integration",
        reboot: "REBOOT CLUSTER",
        home: "Return to Personal Substrate"
    },
    "404": {
        title: "NODE NOT FOUND",
        subtitle: "The requested coordinate does not exist in the active matrix.",
        description: "The path you are attempting to traverse has been either deleted, moved, or never manifested in this version of the substrate.",
        return: "RETURN TO ORIGIN"
    },
    commandPalette: {
        searchPlaceholder: "SEARCH COMMANDS...",
        noResults: "No neural matches found.",
        noDirectives: "No active directives found.",
        searching: "Searching matrix...",
        subtitle: "SOVEREIGN COMMAND INTERFACE",
        navHome: "Go to Home",
        navDashboard: "Go to Dashboard",
        navSettings: "Go to Settings",
        navAdmin: "Go to Admin Panel",
        accountSettings: "Account Settings",
        signOut: "Sign Out",
        rootConsole: "Admin: Access Root Console",
        inspectAudit: "Admin: Inspect Audit Matrix",
        inspectSource: "Admin: Inspect Source Integrity",
        inspectStewardship: "Admin: Inspect Stewardship Protocol",
        inspectTerminal: "Admin: Open Vanguard Terminal",
        signIn: "Sign In",
        themeFire: "Interface: Ignite Fire Core",
        themeMatrix: "Interface: Re-enter Matrix",
        themeGalaxy: "Interface: Pulse Galaxy",
        themeNone: "Interface: Sever Visuals"
    },
    logo: "SOVEREIGN"
};

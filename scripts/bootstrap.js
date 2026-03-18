/**
 * VANGUARD BOILERPLATE BOOTSTRAP [v6.8.5.v6]
 * This script initializes a new architectural node from the Sovereign Substrate.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const log = (msg, type = 'INFO') => {
    const colors = {
        INFO: '\x1b[36m', // Cyan
        SUCCESS: '\x1b[32m', // Green
        WARN: '\x1b[33m', // Yellow
        CRIT: '\x1b[31m', // Red
        RESET: '\x1b[0m'
    };
    console.log(`${colors[type]}[${type}] ${msg}${colors.RESET}`);
};

const question = (query) => new Promise((resolve) => rl.question(`\x1b[35m[QUERY] ${query}: \x1b[0m`, resolve));

async function run() {
    console.clear();
    console.log('\x1b[35m');
    console.log(' ██████╗  ██████╗ ██╗██╗     ███████╗██████╗ ');
    console.log(' ██╔══██╗██╔═══██╗██║██║     ██╔════╝██╔══██╗');
    console.log(' ██████╔╝██║   ██║██║██║     █████╗  ██████╔╝');
    console.log(' ██╔══██╗██║   ██║██║██║     ██╔══╝  ██╔══██╗');
    console.log(' ██████╔╝╚██████╔╝██║███████╗███████╗██║  ██║');
    console.log(' ╚══════╝  ╚═════╝ ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝');
    console.log(' \x1b[36m       [ ARCHITECTURAL SUBSTRATE v6.8.5.v6 ]\x1b[0m\n');

    log('Initializing Vanguard Handshake...');

    const siteName = await question('Site Name (e.g. My New Venture)') || 'Sovereign Site';
    const primaryColor = await question('Primary Hex Color (e.g. #a855f7)') || '#a855f7';
    const adminEmail = await question('Super Admin Email') || 'admin@youremail.com';
    const firebaseProjectId = await question('Firebase Project ID') || '';

    log('Generating Cryptographic Vectors...');
    const nextAuthSecret = crypto.randomBytes(32).toString('hex');
    const sovereignCipher = Math.floor(10000000 + Math.random() * 90000000).toString();

    const envContent = `
# --- IDENTITY & BRANDING ---
NEXT_PUBLIC_SITE_NAME="${siteName}"
NEXT_PUBLIC_PRIMARY_COLOR="${primaryColor}"

# --- AUTHENTICATION (NEXT-AUTH) ---
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${nextAuthSecret}"

# --- GOOGLE IDENTITY ---
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# --- FIREBASE SUBSTRATE (ADMIN SDK) ---
FIREBASE_PROJECT_ID="${firebaseProjectId}"
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""

# --- COMMERCE (STRIPE) ---
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
COMMERCE_MODE="saas"

# --- COMMUNICATION (RESEND) ---
RESEND_API_KEY=""
RESEND_DEFAULT_FROM="${siteName} <noreply@rdp.pub>"

# --- TELEMETRY ---
NEXT_PUBLIC_GA_MEASUREMENT_ID=""
GA_PROPERTY_ID=""
NEXT_PUBLIC_POSTHOG_KEY=""

# --- SECURITY ---
NEXT_PUBLIC_SUPER_ADMIN_EMAIL="${adminEmail}"
SOVEREIGN_CIPHER="${sovereignCipher}"
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
`.trim();

    const envPath = path.join(process.cwd(), '.env.local');

    if (fs.existsSync(envPath)) {
        const overwrite = await question('.env.local already exists. Overwrite? (y/n)') || 'n';
        if (overwrite.toLowerCase() !== 'y') {
            log('Bootstrap aborted to protect existing vectors.', 'WARN');
            rl.close();
            return;
        }
    }

    fs.writeFileSync(envPath, envContent);
    log('.env.local generated with fresh identity vectors.', 'SUCCESS');

    console.log('\n\x1b[32m[TRIUMPHANT] Substrate initialized successfully.\x1b[0m');
    console.log(`\x1b[36m
--- NEXT STEPS ---
1. Populate FIREBASE_PRIVATE_KEY in .env.local
2. Run 'npm install'
3. Start development: 'npm run dev'
4. Access Zenith Console at your-url/en/dashboard
    \x1b[0m`);

    rl.close();
}

run().catch(err => {
    log(`Fatal Error during handshake: ${err.message}`, 'CRIT');
    rl.close();
});

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const globalAny: any = globalThis;

export function initAdminApp(): App {
    if (globalAny.firebaseAdminApp) {
        return globalAny.firebaseAdminApp;
    }

    const apps = getApps();
    const defaultApp = apps.find(a => a.name === '[DEFAULT]');
    if (defaultApp) {
        globalAny.firebaseAdminApp = defaultApp;
        return defaultApp;
    }

    // CRITICAL: Pull env variables strictly inside the runtime function, NOT at module closure.
    // This ensures Turbopack doesn't lock empty variables during its static tracing phases!
    // Local JSON Fallback for robust development
    let projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // If we are on local and have the JSON file, it's MUCH safer to use it directly
    try {
        const fs = require('fs');
        const path = require('path');
        const jsonPath = path.join(process.cwd(), 'boiler-click-next-js-firebase-adminsdk-fbsvc-1f0ed27867.json');
        if (fs.existsSync(jsonPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            projectId = serviceAccount.project_id;
            clientEmail = serviceAccount.client_email;
            privateKey = serviceAccount.private_key;
        }
    } catch (e) {
        // Silently ignore if file doesn't exist or can't be read
    }

    if (!projectId || !clientEmail || !privateKey) {
        const fallbackApp = apps.find(a => a.name === 'sovereign-fallback') || initializeApp({ projectId: "error-missing-project" }, "sovereign-fallback");
        // DO NOT write this to globalAny.firebaseAdminApp so it doesn't permanently poison the Next.js worker!
        return fallbackApp;
    }

    // Aggressive parsing for private key to handle all .env edge cases
    let formattedKey = privateKey.trim();

    // Remove wrapping quotes if they exist (Next.js sometimes leaves them if misconfigured)
    formattedKey = formattedKey.replace(/^["'](.+)["']$/s, '$1');

    // Handle escaped newlines (literal \n characters in the string)
    if (formattedKey.includes('\\n')) {
        formattedKey = formattedKey.replace(/\\n/g, '\n');
    }

    const app = initializeApp({
        credential: cert({
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: formattedKey,
        }),
    });

    globalAny.firebaseAdminApp = app;
    return app;
}

export const getAdminDb = () => getFirestore(initAdminApp());
export const getAdminAuth = () => getAuth(initAdminApp());
export const getAdminStorage = () => getStorage(initAdminApp());

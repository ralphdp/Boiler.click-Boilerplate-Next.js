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
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        console.warn("⚠️ FIREBASE_ADMIN_WARN: Missing credentials. Emitting an un-authenticated fallback. Handshakes will fail if variables aren't injected soon.");
        const fallbackApp = apps.find(a => a.name === 'sovereign-fallback') || initializeApp({ projectId: "error-missing-project" }, "sovereign-fallback");
        // DO NOT write this to globalAny.firebaseAdminApp so it doesn't permanently poison the Next.js worker!
        return fallbackApp;
    }

    console.log("✅ Initializing new Firebase Admin instance (Modular API)");
    const app = initializeApp({
        credential: cert({
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n').replace(/"/g, ''),
        }),
    });

    globalAny.firebaseAdminApp = app;
    return app;
}

export const getAdminDb = () => getFirestore(initAdminApp());
export const getAdminAuth = () => getAuth(initAdminApp());
export const getAdminStorage = () => getStorage(initAdminApp());

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb, getCollectionName } from '@/core/firebase/admin';
import { getGlobalOverrides } from '@/core/actions/branding';
import { z } from 'zod';

const AuthHeaderSchema = z.string().regex(/^Bearer\s+([A-Za-z0-9\-\._~\+/]+=*)$/, "Malformed Bearer Token Structure");

export async function GET(req: Request) {
    const rawAuthHeader = req.headers.get('authorization');
    const authHeaderParse = AuthHeaderSchema.safeParse(rawAuthHeader);

    if (!authHeaderParse.success) {
        return NextResponse.json({
            error: "UNAUTHORIZED",
            message: "Missing or strictly malformed Bearer token. Zod structural validation failed."
        }, { status: 401 });
    }

    const overrides = await getGlobalOverrides();
    if (overrides.haltingProtocol) {
        return NextResponse.json({
            error: "SYSTEM_HALTED",
            message: "Vanguard Kernel is currently halting all API operations."
        }, { status: 503 });
    }

    const token = authHeaderParse.data.split(' ')[1];

    // Mathematically hash the incoming token to safely compare against FireStore
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const db = getAdminDb();
        const snap = await db.collection(getCollectionName("omni_api_keys"))
            .where("keyHash", "==", hash)
            .where("status", "==", "ACTIVE")
            .limit(1)
            .get();

        if (snap.empty) {
            return NextResponse.json({
                error: "INVALID_CIPHER",
                message: "Cryptographic key rejected or revoked."
            }, { status: 403 });
        }

        const keyDoc = snap.docs[0];
        const keyData = keyDoc.data();

        // Optionally, update "lastUsedAt" telemetry (this adds write penalties on every read; optimized substrates often delay this)
        await keyDoc.ref.update({
            lastUsedAt: Date.now()
        });

        // Fetch User or Workspace data linked to this API key if needed
        // For now, return a successful Ping matrix
        return NextResponse.json({
            status: "SUCCESS",
            message: "Vanguard API uplink established.",
            context: {
                keyName: keyData.name,
                ownerId: keyData.userId,
                timestamp: Date.now(),
            }
        });

    } catch (e: any) {
        console.error("Vanguard API Substrate Fault:", e);
        return NextResponse.json({
            error: "INTERNAL_FAULT",
            message: "The backend matrix experienced a cryptographic fault."
        }, { status: 500 });
    }
}

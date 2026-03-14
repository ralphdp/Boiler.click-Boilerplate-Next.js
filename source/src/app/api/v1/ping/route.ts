import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/core/firebase/admin';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({
            error: "UNAUTHORIZED",
            message: "Missing or strictly malformed Bearer token."
        }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Mathematically hash the incoming token to safely compare against FireStore
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const db = getAdminDb();
        const snap = await db.collection("omni_api_keys")
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

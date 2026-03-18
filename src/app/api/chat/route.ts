import { NextResponse } from "next/server";
import { getAdminDb } from "@/core/firebase/admin";
import * as admin from "firebase-admin";
import { sanitizeText } from "@/core/security/input-sanitization";

export const runtime = "nodejs";

// Simple in-memory rate limiter for demo/boilerplate
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 20;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const data = rateLimit.get(ip);
    if (!data || now > data.resetTime) {
        rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }
    if (data.count >= RATE_LIMIT_MAX) return false;
    data.count++;
    return true;
}

export async function POST(req: Request) {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").toString();
    if (!checkRateLimit(ip)) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
        const { messages, sessionId, userApiKey } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
        }

        const activeSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const apiKey = userApiKey || process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                reply: "Sovereign AI Substrate is in standby mode. To enable real-time response, configure the `OPENAI_API_KEY` in your environment or settings."
            });
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are the Sovereign AI Assistant. You are professional, concise, and helpful. You represent the Vanguard Architecture." },
                    ...messages.map((m: any) => ({ role: m.role, content: sanitizeText(m.content) }))
                ],
                temperature: 0.7,
                stream: true,
            })
        });

        if (!response.ok) {
            return NextResponse.json({ error: "AI Substrate connection failed." }, { status: 502 });
        }

        // --- Edge Streaming Implementation ---
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) {
                    controller.close();
                    return;
                }

                let fullContent = "";

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        const lines = chunk.split("\n");

                        for (const line of lines) {
                            if (line.trim() === "" || line.includes("data: [DONE]")) continue;
                            const data = line.replace(/^data: /, "");
                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content || "";
                                if (content) {
                                    fullContent += content;
                                    controller.enqueue(encoder.encode(content));
                                }
                            } catch (e) {
                                // Ignore non-JSON lines
                            }
                        }
                    }

                    // Optional: Persist to Firebase after stream is done
                    try {
                        const batch = getAdminDb().batch();
                        const sessionRef = getAdminDb().collection("chat_sessions").doc(activeSessionId);
                        const msgRef = sessionRef.collection("messages").doc();
                        batch.set(sessionRef, {
                            lastActive: admin.firestore.FieldValue.serverTimestamp(),
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                            ip: ip
                        }, { merge: true });
                        batch.set(msgRef, {
                            role: "assistant",
                            content: fullContent,
                            timestamp: admin.firestore.FieldValue.serverTimestamp()
                        });
                        await batch.commit();
                    } catch (dbError) {
                        console.warn("Chat persistence failed", dbError);
                    }

                } catch (err) {
                    controller.error(err);
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "x-session-id": activeSessionId
            }
        });

    } catch (error) {
        console.error("Chat API error", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

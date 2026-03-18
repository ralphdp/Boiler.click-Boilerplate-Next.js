"use server";

import { auth } from "@/core/auth";
import { getAdminAuth, getAdminDb } from "@/core/firebase/admin";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { getGlobalOverrides } from "./system";

// Helper to extract credentials following the core admin pattern
function getCredentials() {
    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    try {
        const fs = require('fs');
        const path = require('path');
        const serviceAccountFile = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        if (serviceAccountFile) {
            const jsonPath = path.join(process.cwd(), serviceAccountFile);
            if (fs.existsSync(jsonPath)) {
                const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                clientEmail = serviceAccount.client_email;
                privateKey = serviceAccount.private_key;
            }
        }
    } catch (e) { }

    if (!privateKey) return null;

    let formattedKey = privateKey.trim();
    formattedKey = formattedKey.replace(/^["'](.+)["']$/s, '$1');
    if (formattedKey.includes('\\n')) {
        formattedKey = formattedKey.replace(/\\n/g, '\n');
    }

    return {
        client_email: clientEmail,
        private_key: formattedKey,
    };
}

const credentials = getCredentials();
const analyticsClient = credentials ? new BetaAnalyticsDataClient({ credentials }) : null;

const fallbackData = (status: 'error' | 'no_data' = 'error') => ({
    sessions: { total: 0, change: 0, history: [] },
    users: { total: 0, change: 0, history: [] },
    conversions: { total: 0, change: 0, history: [] },
    topPages: [],
    devices: [],
    realtime: { activeNow: 0 },
    status
});

export async function getAnalyticsOverview(days: number = 7) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.email !== process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
        throw new Error("UNAUTHORIZED");
    }

    if (!analyticsClient) {
        console.error("GA4 Analytics: Client initialization failed - Missing Credentials");
        return fallbackData('error');
    }

    const overrides = await getGlobalOverrides();
    const propertyId = overrides.gaPropertyId || process.env.GA_PROPERTY_ID || "528435699";
    const authAdmin = getAdminAuth();

    try {
        const usersList = await authAdmin.listUsers(1000);
        const totalUsers = usersList.users.length;

        const [response] = await analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
            dimensions: [{ name: 'date' }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'sessions' },
                { name: 'conversions' },
                { name: 'screenPageViews' },
            ],
            orderBys: [{ dimension: { dimensionName: 'date' } }]
        });

        // Fetch Real-time data to bridge the 24-48h processing gap
        let activeNow = 0;
        try {
            const [realtimeResponse] = await analyticsClient.runRealtimeReport({
                property: `properties/${propertyId}`,
                metrics: [{ name: 'activeUsers' }],
            });
            activeNow = parseInt(realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || "0");
        } catch (re) {
            console.error("GA4 Realtime Fault:", re);
        }

        // Debug log to verify if Google is returning data or just empty rows
        console.log(`GA4 Sync [${propertyId}]: Rows: ${response.rows?.length || 0} | Live: ${activeNow}`);

        const [deviceResponse] = await analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
            dimensions: [{ name: 'deviceCategory' }],
            metrics: [{ name: 'activeUsers' }],
        });

        const [topPagesResponse] = await analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            limit: 5,
        });

        const history = response.rows?.map(row => ({
            date: row.dimensionValues?.[0].value,
            users: parseInt(row.metricValues?.[0].value || "0"),
            sessions: parseInt(row.metricValues?.[1].value || "0"),
            conversions: parseInt(row.metricValues?.[2].value || "0"),
            views: parseInt(row.metricValues?.[3].value || "0"),
        })) || [];

        const totalSessions = history.reduce((acc, curr) => acc + curr.sessions, 0);
        const totalConversions = history.reduce((acc, curr) => acc + curr.conversions, 0);

        const devices = deviceResponse.rows?.map(row => {
            const type = row.dimensionValues?.[0].value || "Unknown";
            const count = parseInt(row.metricValues?.[0].value || "0");
            const total = deviceResponse.rows?.reduce((acc, r) => acc + parseInt(r.metricValues?.[0].value || "0"), 0) || 1;
            return {
                type: type.charAt(0).toUpperCase() + type.slice(1),
                percentage: Math.round((count / total) * 100)
            };
        }) || [];

        const topPages = topPagesResponse.rows?.map(row => ({
            path: row.dimensionValues?.[0].value,
            views: parseInt(row.metricValues?.[0].value || "0"),
        })) || [];

        return {
            sessions: { total: totalSessions, change: 0, history: history.map(h => h.sessions) },
            users: { total: totalUsers, change: 0, history: history.map(h => h.users) },
            conversions: { total: totalConversions, change: 0, history: history.map(h => h.conversions) },
            topPages,
            devices,
            realtime: { activeNow },
            fullHistory: history,
            status: (history.length > 0 || activeNow > 0) ? 'connected' : 'no_data'
        };
    } catch (e) {
        console.error("GA4 Analytics extraction fault:", e);
        return fallbackData('error');
    }
}

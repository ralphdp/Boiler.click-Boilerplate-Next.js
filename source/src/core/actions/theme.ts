"use server";

import { cookies } from "next/headers";

export async function setUIVariant(variant: string) {
    const cookieStore = await cookies();
    cookieStore.set("sovereign_webgl_variant", variant, {
        path: "/",
        maxAge: 31536000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });
}

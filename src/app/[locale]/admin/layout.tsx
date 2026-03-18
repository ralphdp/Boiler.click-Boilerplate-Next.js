import { auth } from "@/core/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children, params }: { children: React.ReactNode, params: Promise<{ locale: string }> }) {
    const session = await auth();
    const resolvedParams = await params;

    if (!session?.user) {
        redirect(`/${resolvedParams.locale}/auth/handshake?callbackUrl=/en/admin`);
    }

    const isRootAdmin = session.user.role === "ADMIN" || session.user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (!isRootAdmin) {
        redirect(`/${resolvedParams.locale}/dashboard?error=Access_Denied_Root_Clearance_Required`);
    }

    return <>{children}</>;
}

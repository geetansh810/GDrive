// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserSession } from "@/lib/session";
import { getUserById } from "@/lib/actions/user.actions";

export async function middleware(req: NextRequest) {
    const session = await getUserSession(req);
    const userId = session?.userId;
    const url = req.nextUrl.clone();

    if (!userId) return NextResponse.next(); // Allow non-auth pages

    const user = await getUserById(userId);

    if (!user?.telegramChatId && url.pathname !== "/connect-bot") {
        url.pathname = "/connect-bot";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/dashboard/:path*", // Protect dashboard routes
};

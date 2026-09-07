import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("token")?.value;

    // Public & static assets skip middleware check
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname.startsWith("/api") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    // Protected routes requiring authentication cookie
    const isProtected =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/pickups") ||
        pathname.startsWith("/recycler-dashboard") ||
        pathname.startsWith("/recycler/profile");

    if (isProtected && !token) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');

    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth-helper";

export async function middleware(req: NextRequest) {
    try {
        const { pathname } = req.nextUrl;

        // Skip middleware for static assets, Next internal files, and API routes
        if (
            pathname.startsWith("/_next") ||
            pathname.startsWith("/static") ||
            pathname.startsWith("/api") ||
            pathname === "/favicon.ico" ||
            pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js)$/)
        ) {
            return NextResponse.next();
        }

        // List of public page routes
        const isPublicPage =
            pathname === "/" ||
            pathname === "/awareness" ||
            pathname === "/recyclers" ||
            pathname === "/leaderboard";

        const token = req.cookies.get("token")?.value;
        let payload: any = null;

        if (token) {
            try {
                payload = await verifyJWT(token);
            } catch (e) {
                payload = null;
            }
        }

        // Protected routes check
        const isProtectedRoute =
            pathname.startsWith("/dashboard") ||
            pathname.startsWith("/admin") ||
            pathname.startsWith("/profile") ||
            pathname.startsWith("/pickups") ||
            pathname.startsWith("/recycler-dashboard") ||
            pathname.startsWith("/recycler/profile");

        if (isProtectedRoute && (!token || !payload)) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Admin route protection
        if (pathname.startsWith("/admin") && payload?.role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Add security headers
        const response = NextResponse.next();
        response.headers.set('X-DNS-Prefetch-Control', 'on');
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        response.headers.set('X-Frame-Options', 'SAMEORIGIN');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return response;
    } catch (error) {
        console.error("Middleware caught exception:", error);
        // Fallback safely to next() to prevent 500 edge crashes
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};

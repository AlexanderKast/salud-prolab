import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/login", "/api/auth", "/api/crm/webhooks"];
const adminPaths = ["/admin", "/api/admin"];
const adminRoles = ["SUPER_ADMIN", "ADMIN"];

// In-memory rate limit store (per-instance, resets on restart)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, pathname: string): boolean {
  const isLogin = pathname.startsWith("/api/auth");
  const maxReq = isLogin ? 50 : 120;
  const windowMs = isLogin ? 15 * 60 * 1000 : 60 * 1000;

  const key = `${ip}:${isLogin ? "login" : "general"}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count++;
  return entry.count <= maxReq;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Rate limiting on API routes
  if (pathname.startsWith("/api")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(ip, pathname)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta más tarde." },
        { status: 429 }
      );
    }
  }

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    // Redirect logged-in users away from login
    if (pathname.startsWith("/login") && req.auth?.user) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Require authentication
  if (!req.auth?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    const role = req.auth.user.role;
    if (!adminRoles.includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};

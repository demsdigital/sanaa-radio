import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PROTECTED_API = [
  "/api/programs",
  "/api/episodes",
  "/api/schedule",
  "/api/news",
  "/api/articles",
  "/api/team",
  "/api/media",
  "/api/users",
  "/api/settings",
  "/api/upload",
  "/api/dashboard",
];

// صفحات يُسمح بها قبل تفعيل 2FA
const TOTP_WHITELIST = [
  "/admin/security",
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { method } = request;

  // حماية /admin
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    const payload = verifyToken(token);
    if (!payload) return NextResponse.redirect(new URL("/login", request.url));

    // إجبار غير الأدمن على تفعيل 2FA
    const isAdmin = payload.role === "admin";
    const hasTOTP = !!payload.totpEnabled;
    const onWhitelist = TOTP_WHITELIST.some(p => pathname.startsWith(p));

    if (!isAdmin && !hasTOTP && !onWhitelist) {
      const url = new URL("/admin/security", request.url);
      url.searchParams.set("required", "1");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // حماية API — فقط POST/PUT/DELETE/PATCH
  if (
    pathname.startsWith("/api/") &&
    ["POST", "PUT", "DELETE", "PATCH"].includes(method) &&
    PROTECTED_API.some(p => pathname.startsWith(p)) &&
    !pathname.startsWith("/api/auth/")
  ) {
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
  }

  // إعادة توجيه من login إذا مسجل دخول
  if (pathname === "/login") {
    const token = request.cookies.get("token")?.value;
    if (token && verifyToken(token)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/api/:path*"],
};

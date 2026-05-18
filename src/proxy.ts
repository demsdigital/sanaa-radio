import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PERM_MAP: Record<string, string> = {
  "/admin/news":     "news",
  "/admin/programs": "programs",
  "/admin/episodes": "episodes",
  "/admin/schedule": "schedule",
  "/admin/articles": "articles",
  "/admin/team":     "admin",
  "/admin/users":    "admin",
  "/admin/settings": "admin",
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    const payload = verifyToken(token);
    if (!payload) return NextResponse.redirect(new URL("/login", request.url));

    // admin يمر بدون قيود
    if (payload.role === "admin") return NextResponse.next();

    // dashboard مسموح للكل
    if (pathname === "/admin" || pathname === "/admin/dashboard") return NextResponse.next();

    // تحقق من الصلاحية
    const requiredPerm = PERM_MAP[pathname];
    if (requiredPerm === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (requiredPerm) {
      const perms: string[] = (payload as any).permissions || [];
      if (!perms.includes(requiredPerm)) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }

    return NextResponse.next();
  }

  if (pathname === "/login") {
    const token = request.cookies.get("token")?.value;
    if (token && verifyToken(token)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};

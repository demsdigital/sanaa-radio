import { NextRequest, NextResponse } from "next/server";

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    // admin يمر بدون قيود
    if (payload.role === "admin") return NextResponse.next();

    // dashboard مسموح للكل
    if (pathname === "/admin" || pathname === "/admin/dashboard") return NextResponse.next();

    // تحقق من الصلاحية
    const requiredPerm = PERM_MAP[pathname];
    if (requiredPerm === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (requiredPerm && !payload.permissions?.includes(requiredPerm)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};

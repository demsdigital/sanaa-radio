import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    const payload = verifyToken(token);
    if (!payload) return NextResponse.redirect(new URL("/login", request.url));
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

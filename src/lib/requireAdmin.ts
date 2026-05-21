import { NextRequest } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export function requireAdmin(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.role !== "admin") {
    return {
      ok: false,
      error: "غير مصرح",
    };
  }

  return {
    ok: true,
    user: payload,
  };
}

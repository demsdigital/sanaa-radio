import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const [user] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    permissions: users.permissions,
    totpEnabled: users.totpEnabled,
  }).from(users).where(eq(users.id, payload.id));
  if (!user) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json(user);
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import * as OTPAuth from "otpauth";

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { code } = await request.json();
  const [user] = await db.select().from(users).where(eq(users.id, payload.id));
  if (!user?.totpSecret) return NextResponse.json({ error: "2FA غير مفعّل" }, { status: 400 });

  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(user.totpSecret),
    algorithm: "SHA1", digits: 6, period: 30,
  });

  const delta = totp.validate({ token: code, window: 1 });
  if (delta === null) return NextResponse.json({ error: "الكود غير صحيح" }, { status: 400 });

  await db.update(users)
    .set({ totpEnabled: false, totpSecret: null })
    .where(eq(users.id, payload.id));

  return NextResponse.json({ success: true });
}

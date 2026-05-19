import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromRequest, verifyToken, signToken } from "@/lib/auth";
import * as OTPAuth from "otpauth";

export async function POST(request: NextRequest) {
  const { code, userId, tempToken } = await request.json();

  // حالة 1: تفعيل 2FA (مستخدم مسجل دخول)
  if (tempToken === undefined) {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const [user] = await db.select().from(users).where(eq(users.id, payload.id));
    if (!user?.totpSecret) return NextResponse.json({ error: "لم يتم إعداد 2FA" }, { status: 400 });

    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(user.totpSecret),
      algorithm: "SHA1", digits: 6, period: 30,
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) return NextResponse.json({ error: "الكود غير صحيح" }, { status: 400 });

    await db.update(users).set({ totpEnabled: true }).where(eq(users.id, payload.id));
    return NextResponse.json({ success: true });
  }

  // حالة 2: تسجيل دخول مع 2FA
  if (!userId || !tempToken) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });

  const payload = verifyToken(tempToken);
  if (!payload || payload.id !== userId || !payload.requires2FA) {
    return NextResponse.json({ error: "انتهت صلاحية الجلسة" }, { status: 401 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user?.totpSecret) return NextResponse.json({ error: "خطأ في الإعداد" }, { status: 400 });

  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(user.totpSecret),
    algorithm: "SHA1", digits: 6, period: 30,
  });

  const delta = totp.validate({ token: code, window: 1 });
  if (delta === null) return NextResponse.json({ error: "الكود غير صحيح" }, { status: 400 });

  // إصدار token كامل بعد التحقق
  const fullToken = signToken({ id: user.id, email: user.email, role: user.role, totpEnabled: user.totpEnabled });
  const response = NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  response.cookies.set("token", fullToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}

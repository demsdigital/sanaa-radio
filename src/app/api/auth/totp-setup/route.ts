import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, payload.id));
  if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

  // توليد secret جديد
  const totp = new OTPAuth.TOTP({
    issuer: "إذاعة الجمهورية اليمنية",
    label: user.email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(
      user.totpSecret || new OTPAuth.Secret({ size: 20 }).base32
    ),
  });

  // حفظ الـ secret مؤقتاً إذا لم يكن موجوداً
  if (!user.totpSecret) {
    await db.update(users)
      .set({ totpSecret: totp.secret.base32 })
      .where(eq(users.id, payload.id));
  }

  const uri = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(uri);

  return NextResponse.json({
    secret: totp.secret.base32,
    qrCode: qrDataUrl,
  });
}

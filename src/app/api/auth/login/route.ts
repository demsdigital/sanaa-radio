import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, signToken } from "@/lib/auth";

const attempts = new Map<string, { count: number; resetAt: number }>();

function getIP(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (record.count >= 5) return false;
  record.count++;
  return true;
}

function resetAttempts(ip: string) { attempts.delete(ip); }

export async function POST(request: NextRequest) {
  const ip = getIP(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "تم تجاوز الحد المسموح به، حاول بعد 15 دقيقة" },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await request.json();
    if (!email || !password)
      return NextResponse.json({ error: "البريد وكلمة المرور مطلوبان" }, { status: 400 });

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.active)
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 401 });

    const valid = await verifyPassword(password, user.password);
    if (!valid)
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 401 });

    resetAttempts(ip);

    // حالة 1: فعّل 2FA — يحتاج كود التحقق
    if (user.totpEnabled && user.totpSecret) {
      const tempToken = signToken({ id: user.id, email: user.email, role: user.role, requires2FA: true }, "5m");
      return NextResponse.json({ requires2FA: true, userId: user.id, tempToken });
    }

    // حالة 2: team ولم يفعّل 2FA — إجبار على التفعيل
    if (user.role !== "admin" && !user.totpEnabled) {
      const setupToken = signToken({ id: user.id, email: user.email, role: user.role, requiresSetup: true }, "30m");
      const response = NextResponse.json({ requiresSetup: true });
      response.cookies.set("token", setupToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 30,
        path: "/",
      });
      return response;
    }

    // حالة 3: دخول عادي (admin أو من فعّل 2FA)
    const token = signToken({ id: user.id, email: user.email, role: user.role, totpEnabled: user.totpEnabled ?? false });
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

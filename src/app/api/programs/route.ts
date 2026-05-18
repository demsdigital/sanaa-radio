import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET() {
  const all = await db.select().from(programs).orderBy(programs.createdAt);
  // رتّب حسب programs_order إن وجد
  const orderRow = await db.select().from(settings).where(eq(settings.key, "programs_order"));
  if (orderRow.length && orderRow[0].value) {
    const order: number[] = JSON.parse(orderRow[0].value);
    all.sort((a, b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }
  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await request.json();

  // حفظ الترتيب
  if (body.saveOrder && Array.isArray(body.order)) {
    const value = JSON.stringify(body.order);
    const existing = await db.select().from(settings).where(eq(settings.key, "programs_order"));
    if (existing.length) {
      await db.update(settings).set({ value }).where(eq(settings.key, "programs_order"));
    } else {
      await db.insert(settings).values({ key: "programs_order", value });
    }
    return NextResponse.json({ success: true });
  }

  const [program] = await db.insert(programs).values(body).returning();
  return NextResponse.json(program);
}

export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await request.json();
  const { id, ...data } = body;
  const [program] = await db.update(programs).set(data).where(eq(programs.id, id)).returning();
  return NextResponse.json(program);
}

export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await request.json();
  await db.delete(programs).where(eq(programs.id, id));
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { team } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET() {
  const all = await db.select().from(team).orderBy(asc(team.sortOrder), asc(team.createdAt));
  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await request.json();

  if (body.saveOrder && Array.isArray(body.order)) {
    await Promise.all(
      body.order.map((id: number, i: number) =>
        db.update(team).set({ sortOrder: i }).where(eq(team.id, id))
      )
    );
    return NextResponse.json({ success: true });
  }

  const [member] = await db.insert(team).values(body).returning();
  return NextResponse.json(member);
}

export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await request.json();
  const { id, ...data } = body;
  const [member] = await db.update(team).set(data).where(eq(team.id, id)).returning();
  return NextResponse.json(member);
}

export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await request.json();
  await db.delete(team).where(eq(team.id, id));
  return NextResponse.json({ success: true });
}

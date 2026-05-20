import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedule } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const versionId = searchParams.get("versionId");

  const all = versionId
    ? await db.select().from(schedule).where(eq(schedule.versionId, Number(versionId))).orderBy(schedule.timeStart)
    : await db.select().from(schedule).where(isNull(schedule.versionId)).orderBy(schedule.timeStart);

  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const [item] = await db.insert(schedule).values(body).returning();
  return NextResponse.json(item);
}

export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  const [item] = await db.update(schedule).set(data).where(eq(schedule.id, id)).returning();
  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await request.json();
  await db.delete(schedule).where(eq(schedule.id, id));
  return NextResponse.json({ success: true });
}

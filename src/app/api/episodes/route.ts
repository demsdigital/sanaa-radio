import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { episodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const programId = searchParams.get("programId");

  const all = programId
    ? await db.select().from(episodes).where(eq(episodes.programId, parseInt(programId))).orderBy(episodes.publishedAt)
    : await db.select().from(episodes).orderBy(episodes.publishedAt);

  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const [episode] = await db.insert(episodes).values(body).returning();
  return NextResponse.json(episode);
}

export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const { id, ...data } = body;
  const [episode] = await db.update(episodes).set(data).where(eq(episodes.id, id)).returning();
  return NextResponse.json(episode);
}

export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await request.json();
  await db.delete(episodes).where(eq(episodes.id, id));
  return NextResponse.json({ success: true });
}

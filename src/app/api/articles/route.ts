import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET() {
  const all = await db.select().from(articles).orderBy(desc(articles.publishedAt));
  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await request.json();
  const [article] = await db.insert(articles).values(body).returning();
  return NextResponse.json(article);
}

export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await request.json();
  const { id, ...data } = body;
  const [article] = await db.update(articles).set(data).where(eq(articles.id, id)).returning();
  return NextResponse.json(article);
}

export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await request.json();
  await db.delete(articles).where(eq(articles.id, id));
  return NextResponse.json({ success: true });
}

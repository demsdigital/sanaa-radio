import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { mediaLibrary } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET() {
  const all = await db.select().from(mediaLibrary).orderBy(desc(mediaLibrary.createdAt));
  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const [item] = await db.insert(mediaLibrary).values({
    filename: body.filename,
    url: body.url,
    uploadedBy: payload.id,
  }).returning();
  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await request.json();
  const [item] = await db.select().from(mediaLibrary).where(eq(mediaLibrary.id, id));
  if (!item) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  // فقط من رفعها أو admin
  if (item.uploadedBy !== payload.id && payload.role !== "admin") {
    return NextResponse.json({ error: "لا يمكنك حذف صور الآخرين" }, { status: 403 });
  }

  await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));
  return NextResponse.json({ success: true });
}

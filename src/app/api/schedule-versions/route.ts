import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedule, scheduleVersions } from "@/db/schema";
import { desc, isNull, eq } from "drizzle-orm";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET() {
  const items = await db
    .select()
    .from(scheduleVersions)
    .orderBy(desc(scheduleVersions.createdAt));

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { cloneFromDefault, ...versionData } = body;

  const [item] = await db
    .insert(scheduleVersions)
    .values(versionData)
    .returning();

  if (cloneFromDefault) {
    const defaultItems = await db
      .select()
      .from(schedule)
      .where(isNull(schedule.versionId));

    if (defaultItems.length > 0) {
      await db.insert(schedule).values(
        defaultItems.map(({ id, ...row }) => ({
          ...row,
          versionId: item.id,
        }))
      );
    }
  }

  return NextResponse.json(item);
}


export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...data } = body;

  if (data.startsAt) data.startsAt = new Date(data.startsAt);
  if (data.endsAt) data.endsAt = new Date(data.endsAt);

  const [item] = await db
    .update(scheduleVersions)
    .set(data)
    .where(eq(scheduleVersions.id, Number(id)))
    .returning();

  return NextResponse.json(item);
}

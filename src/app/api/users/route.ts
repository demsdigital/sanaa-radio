import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromRequest, verifyToken, hashPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const all = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    permissions: users.permissions,
    active: users.active,
    createdAt: users.createdAt,
  }).from(users).orderBy(users.createdAt);

  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const hashed = await hashPassword(body.password);
  const [user] = await db.insert(users).values({ ...body, password: hashed }).returning();
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const { id, password, ...data } = body;
  if (password) data.password = await hashPassword(password);
  const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await request.json();
  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ success: true });
}

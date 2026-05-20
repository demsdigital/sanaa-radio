import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exchangeAchievements } from "@/db/schema";

export async function GET() {
  try {
    const items = await db
      .select()
      .from(exchangeAchievements)
      .orderBy(asc(exchangeAchievements.sortOrder));

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/exchange/achievements error:", error);
    return NextResponse.json(
      { error: "Failed to load exchange achievements" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const [item] = await db
      .insert(exchangeAchievements)
      .values({
        title: body.title,
        year: body.year ? Number(body.year) : null,
        organization: body.organization || null,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        featured: body.featured ?? false,
        sortOrder: Number(body.sortOrder || 0),
        active: body.active ?? true,
      })
      .returning();

    return NextResponse.json(item);
  } catch (error) {
    console.error("POST /api/exchange/achievements error:", error);
    return NextResponse.json(
      { error: "Failed to create exchange achievement" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const [item] = await db
      .update(exchangeAchievements)
      .set({
        title: body.title,
        year: body.year ? Number(body.year) : null,
        organization: body.organization || null,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        featured: body.featured ?? false,
        sortOrder: Number(body.sortOrder || 0),
        active: body.active ?? true,
      })
      .where(eq(exchangeAchievements.id, Number(body.id)))
      .returning();

    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/exchange/achievements error:", error);
    return NextResponse.json(
      { error: "Failed to update exchange achievement" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    await db
      .delete(exchangeAchievements)
      .where(eq(exchangeAchievements.id, Number(body.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/exchange/achievements error:", error);
    return NextResponse.json(
      { error: "Failed to delete exchange achievement" },
      { status: 500 }
    );
  }
}

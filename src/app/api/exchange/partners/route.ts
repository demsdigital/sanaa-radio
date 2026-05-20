import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exchangePartners } from "@/db/schema";

export async function GET() {
  try {
    const items = await db
      .select()
      .from(exchangePartners)
      .orderBy(asc(exchangePartners.sortOrder));

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/exchange/partners error:", error);

    return NextResponse.json(
      { error: "Failed to load partners" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const [item] = await db
      .insert(exchangePartners)
      .values({
        name: body.name,
        logoUrl: body.logoUrl || null,
        websiteUrl: body.websiteUrl || null,
        description: body.description || null,
        sortOrder: Number(body.sortOrder || 0),
        active: body.active ?? true,
      })
      .returning();

    return NextResponse.json(item);
  } catch (error) {
    console.error("POST /api/exchange/partners error:", error);

    return NextResponse.json(
      { error: "Failed to create partner" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const [item] = await db
      .update(exchangePartners)
      .set({
        name: body.name,
        logoUrl: body.logoUrl || null,
        websiteUrl: body.websiteUrl || null,
        description: body.description || null,
        sortOrder: Number(body.sortOrder || 0),
        active: body.active ?? true,
      })
      .where(eq(exchangePartners.id, Number(body.id)))
      .returning();

    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/exchange/partners error:", error);

    return NextResponse.json(
      { error: "Failed to update partner" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    await db
      .delete(exchangePartners)
      .where(eq(exchangePartners.id, Number(body.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/exchange/partners error:", error);

    return NextResponse.json(
      { error: "Failed to delete partner" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exchangeItems } from "@/db/schema";

export async function GET() {
  try {
    const items = await db
      .select()
      .from(exchangeItems)
      .orderBy(
        desc(exchangeItems.featured),
        asc(exchangeItems.sortOrder),
        desc(exchangeItems.createdAt)
      );

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/exchange/items error:", error);

    return NextResponse.json(
      { error: "Failed to load exchange items" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const [item] = await db
      .insert(exchangeItems)
      .values({
        title: body.title,
        slug: body.slug,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        audioUrl: body.audioUrl || null,
        fileUrl: body.fileUrl || null,
        category: body.category || "program",
        producer: body.producer || null,
        duration: body.duration ? Number(body.duration) : null,
        downloadable: body.downloadable ?? false,
        featured: body.featured ?? false,
        published: body.published ?? true,
        sortOrder: Number(body.sortOrder || 0),
      })
      .returning();

    return NextResponse.json(item);
  } catch (error) {
    console.error("POST /api/exchange/items error:", error);

    return NextResponse.json(
      { error: "Failed to create exchange item" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const [item] = await db
      .update(exchangeItems)
      .set({
        title: body.title,
        slug: body.slug,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        audioUrl: body.audioUrl || null,
        fileUrl: body.fileUrl || null,
        category: body.category || "program",
        producer: body.producer || null,
        duration: body.duration ? Number(body.duration) : null,
        downloadable: body.downloadable ?? false,
        featured: body.featured ?? false,
        published: body.published ?? true,
        sortOrder: Number(body.sortOrder || 0),
      })
      .where(eq(exchangeItems.id, Number(body.id)))
      .returning();

    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/exchange/items error:", error);

    return NextResponse.json(
      { error: "Failed to update exchange item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    await db
      .delete(exchangeItems)
      .where(eq(exchangeItems.id, Number(body.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/exchange/items error:", error);

    return NextResponse.json(
      { error: "Failed to delete exchange item" },
      { status: 500 }
    );
  }
}

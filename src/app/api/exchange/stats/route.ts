import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exchangeStats } from "@/db/schema";
import { requireAdmin } from "@/lib/requireAdmin";

// GET (مفتوح)
export async function GET() {
  try {
    const items = await db
      .select()
      .from(exchangeStats)
      .orderBy(asc(exchangeStats.sortOrder));

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load exchange stats" },
      { status: 500 }
    );
  }
}

// POST (محمي)
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await req.json();

    const [item] = await db
      .insert(exchangeStats)
      .values({
        label: body.label,
        value: body.value,
        suffix: body.suffix || null,
        year: body.year ? Number(body.year) : null,
        description: body.description || null,
        sortOrder: Number(body.sortOrder || 0),
        active: body.active ?? true,
      })
      .returning();

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create exchange stat" },
      { status: 500 }
    );
  }
}

// PUT (محمي)
export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await req.json();

    const [item] = await db
      .update(exchangeStats)
      .set({
        label: body.label,
        value: body.value,
        suffix: body.suffix || null,
        year: body.year ? Number(body.year) : null,
        description: body.description || null,
        sortOrder: Number(body.sortOrder || 0),
        active: body.active ?? true,
      })
      .where(eq(exchangeStats.id, Number(body.id)))
      .returning();

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update exchange stat" },
      { status: 500 }
    );
  }
}

// DELETE (محمي)
export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await req.json();

    await db
      .delete(exchangeStats)
      .where(eq(exchangeStats.id, Number(body.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete exchange stat" },
      { status: 500 }
    );
  }
}
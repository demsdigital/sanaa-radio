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
  const {
    title, slug, body: articleBody, excerpt, imageUrl,
    authorName, category, published,
    tags, scheduledAt, metaDescription,
  } = body;

  const values: typeof articles.$inferInsert = {
    title,
    slug: slug || title.trim().replace(/\s+/g, "-").replace(/[^\w؀-ۿ-]/g, "").toLowerCase(),
    body: articleBody,
    excerpt: excerpt || null,
    imageUrl: imageUrl || null,
    authorName: authorName || null,
    category: category || "عام",
    published: published ?? true,
    tags: tags || null,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    metaDescription: metaDescription || null,
  };

  const [article] = await db.insert(articles).values(values).returning();
  return NextResponse.json(article);
}

export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await request.json();
  const {
    id,
    title, slug, body: articleBody, excerpt, imageUrl,
    authorName, category, published,
    tags, scheduledAt, metaDescription,
  } = body;

  const data: Partial<typeof articles.$inferInsert> = {
    title,
    slug,
    body: articleBody,
    excerpt: excerpt || null,
    imageUrl: imageUrl || null,
    authorName: authorName || null,
    category: category || "عام",
    published: published ?? true,
    tags: tags || null,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    metaDescription: metaDescription || null,
  };

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

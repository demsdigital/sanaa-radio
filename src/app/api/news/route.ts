import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { news } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET() {
  const all = await db.select().from(news).orderBy(desc(news.publishedAt));
  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const {
    title, slug, body: newsBody, imageUrl, tweetUrl, youtubeUrl,
    sourceLabel, sourceUrl, category, published, breaking, priority,
    editorName, newsDate, scheduledAt, tags, metaDescription, galleryImages,
  } = body;

  const values: typeof news.$inferInsert = {
    title,
    slug: slug || null,
    body: newsBody,
    imageUrl: imageUrl || null,
    tweetUrl: tweetUrl || null,
    youtubeUrl: youtubeUrl || null,
    sourceLabel: sourceLabel || null,
    sourceUrl: sourceUrl || null,
    category: category || "عام",
    published: published ?? true,
    breaking: breaking ?? false,
    priority: priority ?? 0,
    editorName: editorName || null,
    newsDate: newsDate ? new Date(newsDate) : null,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    tags: tags || null,
    metaDescription: metaDescription || null,
    galleryImages: galleryImages || null,
  };

  const [item] = await db.insert(news).values(values).returning();
  return NextResponse.json(item);
}

export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await request.json();
  const {
    id,
    title, slug, body: newsBody, imageUrl, tweetUrl, youtubeUrl,
    sourceLabel, sourceUrl, category, published, breaking, priority,
    editorName, newsDate, scheduledAt, tags, metaDescription, galleryImages,
  } = body;

  const data: Partial<typeof news.$inferInsert> = {
    title,
    slug: slug || null,
    body: newsBody,
    imageUrl: imageUrl || null,
    tweetUrl: tweetUrl || null,
    youtubeUrl: youtubeUrl || null,
    sourceLabel: sourceLabel || null,
    sourceUrl: sourceUrl || null,
    category: category || "عام",
    published: published ?? true,
    breaking: breaking ?? false,
    priority: priority ?? 0,
    editorName: editorName || null,
    newsDate: newsDate ? new Date(newsDate) : null,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    tags: tags || null,
    metaDescription: metaDescription || null,
    galleryImages: galleryImages || null,
  };

  const [item] = await db.update(news).set(data).where(eq(news.id, id)).returning();
  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await request.json();
  await db.delete(news).where(eq(news.id, id));
  return NextResponse.json({ success: true });
}

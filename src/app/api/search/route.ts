import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs, news, articles, exchangeItems, mediaAssets, mediaLibrary } from "@/db/schema";
import { or, like } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";

  if (!q) return NextResponse.json({ results: [] });

  const pattern = `%${q}%`;

  const [programsRes, newsRes, articlesRes, exchangeRes, mediaRes, mediaLibraryRes] = await Promise.all([
    db.select().from(programs).where(like(programs.name, pattern)),
    db.select().from(news).where(like(news.title, pattern)),
    db.select().from(articles).where(like(articles.title, pattern)),
    db.select().from(exchangeItems).where(like(exchangeItems.title, pattern)),
    db.select().from(mediaAssets).where(like(mediaAssets.filename, pattern)),
    db.select().from(mediaLibrary).where(like(mediaLibrary.filename, pattern)),
  ]);

  return NextResponse.json({
    programs: programsRes,
    news: newsRes,
    articles: articlesRes,
    exchange: exchangeRes,
    media: [...mediaRes, ...mediaLibraryRes],
  });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs, news, team, articles, mediaLibrary } from "@/db/schema";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const [progs, newsItems, teamItems, articleItems] = await Promise.all([
    db.select({ url: programs.imageUrl, name: programs.name }).from(programs),
    db.select({ url: news.imageUrl, title: news.title }).from(news),
    db.select({ url: team.imageUrl, name: team.name }).from(team),
    db.select({ url: articles.imageUrl, title: articles.title }).from(articles),
  ]);

  const rawItems = [
    ...progs.filter(p => p.url).map(p => ({ filename: "برنامج: " + p.name, url: p.url!, uploadedBy: payload.id })),
    ...newsItems.filter(n => n.url).map(n => ({ filename: "خبر: " + n.title, url: n.url!, uploadedBy: payload.id })),
    ...teamItems.filter(t => t.url).map(t => ({ filename: "فريق: " + t.name, url: t.url!, uploadedBy: payload.id })),
    ...articleItems.filter(a => a.url).map(a => ({ filename: "مقال: " + a.title, url: a.url!, uploadedBy: payload.id })),
  ];

  // إزالة التكرار داخل نفس دفعة الاستيراد
  const uniqueItems = Array.from(
    new Map(rawItems.map(item => [item.url, item])).values()
  );

  // جلب الروابط الموجودة مسبقًا في المكتبة لمنع تكرارها
  const existingMedia = await db.select({ url: mediaLibrary.url }).from(mediaLibrary);
  const existingUrls = new Set(existingMedia.map(item => item.url));

  const toInsert = uniqueItems.filter(item => !existingUrls.has(item.url));

  let imported = 0;
  for (const item of toInsert) {
    await db.insert(mediaLibrary).values(item);
    imported++;
  }

  return NextResponse.json({ success: true, imported });
}

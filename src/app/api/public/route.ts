import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings, programs, episodes, news, schedule } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const [allSettings, allPrograms, latestNews, allSchedule, latestEpisodes] = await Promise.all([
    db.select().from(settings),
    db.select().from(programs).where(eq(programs.active, true)),
    db.select().from(news).orderBy(news.publishedAt).limit(3),
    db.select().from(schedule),
    db.select().from(episodes).orderBy(episodes.publishedAt).limit(5),
  ]);

  const s: Record<string, string> = {};
  allSettings.forEach((item) => (s[item.key] = item.value));

  return NextResponse.json({
    settings: s,
    programs: allPrograms,
    news: latestNews,
    schedule: allSchedule,
    latestEpisodes,
  });
}

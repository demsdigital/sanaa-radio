import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs, episodes, news, users, schedule, articles } from "@/db/schema";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const [p, e, n, u, s, a] = await Promise.all([
    db.select().from(programs),
    db.select().from(episodes),
    db.select().from(news),
    db.select().from(users),
    db.select().from(schedule),
    db.select().from(articles),
  ]);

  return NextResponse.json({
    programs: p.length, episodes: e.length, news: n.length,
    users: u.length, schedule: s.length, articles: a.length,
  });
}

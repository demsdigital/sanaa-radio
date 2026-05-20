import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  exchangeAchievements,
  exchangeStats,
  exchangeReports,
  exchangePartners,
  exchangeItems,
} from "@/db/schema";

export async function GET() {
  try {
    const [stats, achievements, reports, partners, items] = await Promise.all([
      db.select().from(exchangeStats).where(eq(exchangeStats.active, true)).orderBy(asc(exchangeStats.sortOrder)),
      db.select().from(exchangeAchievements).where(eq(exchangeAchievements.active, true)).orderBy(asc(exchangeAchievements.sortOrder)),
      db.select().from(exchangeReports).where(eq(exchangeReports.active, true)).orderBy(asc(exchangeReports.sortOrder)),
      db.select().from(exchangePartners).where(eq(exchangePartners.active, true)).orderBy(asc(exchangePartners.sortOrder)),
      db.select().from(exchangeItems).where(eq(exchangeItems.published, true)).orderBy(asc(exchangeItems.sortOrder)),
    ]);

    return NextResponse.json({
      stats,
      achievements,
      reports,
      partners,
      items,
    });
  } catch (error) {
    console.error("GET /api/exchange error:", error);
    return NextResponse.json(
      { error: "Failed to load exchange data" },
      { status: 500 }
    );
  }
}

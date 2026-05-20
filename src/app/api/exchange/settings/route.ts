import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEFAULTS = {
  exchange_show_stats: "true",
  exchange_show_achievements: "true",
  exchange_show_reports: "true",
  exchange_show_cloud: "true",
  exchange_show_partners: "true",
  exchange_show_future: "true",
};

export async function GET() {
  try {
    const rows = await db.select().from(settings);

    const map: Record<string, string> = {};

    rows.forEach((row) => {
      map[row.key] = row.value;
    });

    return NextResponse.json({
      exchange_show_stats:
        map.exchange_show_stats ?? DEFAULTS.exchange_show_stats,

      exchange_show_achievements:
        map.exchange_show_achievements ??
        DEFAULTS.exchange_show_achievements,

      exchange_show_reports:
        map.exchange_show_reports ??
        DEFAULTS.exchange_show_reports,

      exchange_show_cloud:
        map.exchange_show_cloud ??
        DEFAULTS.exchange_show_cloud,

      exchange_show_partners:
        map.exchange_show_partners ??
        DEFAULTS.exchange_show_partners,

      exchange_show_future:
        map.exchange_show_future ??
        DEFAULTS.exchange_show_future,
    });
  } catch (error) {
    console.error("GET exchange settings error:", error);

    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    for (const [key, value] of Object.entries(body)) {
      await db
        .insert(settings)
        .values({
          key,
          value: String(value),
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: {
            value: String(value),
          },
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT exchange settings error:", error);

    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

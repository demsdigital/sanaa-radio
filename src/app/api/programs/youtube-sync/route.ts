import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { programs, episodes, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

type YouTubePlaylistItem = {
  snippet?: {
    title?: string;
    description?: string;
    resourceId?: {
      videoId?: string;
    };
  };
  contentDetails?: {
    videoId?: string;
    videoPublishedAt?: string;
  };
};

type YouTubePlaylistResponse = {
  nextPageToken?: string;
  items?: YouTubePlaylistItem[];
  error?: {
    message?: string;
  };
};

function extractPlaylistId(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("list");
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { programId } = await request.json();

  if (!programId || typeof programId !== "number") {
    return NextResponse.json({ error: "معرّف البرنامج غير صالح" }, { status: 400 });
  }

  const [program] = await db
    .select()
    .from(programs)
    .where(eq(programs.id, programId));

  if (!program) {
    return NextResponse.json({ error: "البرنامج غير موجود" }, { status: 404 });
  }

  if (!program.youtubePlaylistUrl) {
    return NextResponse.json({ error: "لم يتم إضافة رابط قائمة تشغيل يوتيوب لهذا البرنامج" }, { status: 400 });
  }

  const playlistId = extractPlaylistId(program.youtubePlaylistUrl);

  if (!playlistId) {
    return NextResponse.json({ error: "رابط قائمة التشغيل غير صالح" }, { status: 400 });
  }

  const [apiKeyRow] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "youtube_api_key"));

  const apiKey = apiKeyRow?.value?.trim();

  if (!apiKey) {
    return NextResponse.json({ error: "لم يتم إضافة مفتاح YouTube API في الإعدادات بعد" }, { status: 400 });
  }

  const existingEpisodes = await db
    .select({ youtubeUrl: episodes.youtubeUrl })
    .from(episodes)
    .where(eq(episodes.programId, program.id));

  const existingUrls = new Set(
    existingEpisodes
      .map((ep) => ep.youtubeUrl)
      .filter((url): url is string => Boolean(url))
  );

  let pageToken = "";
  let scanned = 0;
  let added = 0;

  while (true) {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", apiKey);

    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    const data = (await response.json()) as YouTubePlaylistResponse;

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "تعذر الاتصال بخدمة يوتيوب" },
        { status: response.status }
      );
    }

    const items = data.items || [];
    scanned += items.length;

    for (const item of items) {
      const videoId =
        item.contentDetails?.videoId ||
        item.snippet?.resourceId?.videoId;

      const title = item.snippet?.title?.trim();
      const description = item.snippet?.description?.trim() || null;

      if (!videoId || !title) continue;
      if (title === "Private video" || title === "Deleted video") continue;

      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

      if (existingUrls.has(youtubeUrl)) continue;

      await db.insert(episodes).values({
        programId: program.id,
        title,
        description,
        audioUrl: null,
        youtubeUrl,
        duration: null,
        publishedAt: item.contentDetails?.videoPublishedAt
          ? new Date(item.contentDetails.videoPublishedAt)
          : new Date(),
      });

      existingUrls.add(youtubeUrl);
      added += 1;
    }

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return NextResponse.json({
    success: true,
    scanned,
    added,
    message: added > 0
      ? `تمت إضافة ${added} حلقة جديدة من يوتيوب`
      : "لا توجد حلقات جديدة لإضافتها",
  });
}

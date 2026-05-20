import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !url.startsWith("https://")) {
    return new Response("Invalid file URL", { status: 400 });
  }

  const res = await fetch(url);

  if (!res.ok) {
    return new Response("File not found", { status: 404 });
  }

  const filename = decodeURIComponent(url.split("/").pop() || "audio.mp3");

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "audio/mpeg",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

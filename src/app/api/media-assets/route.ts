import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { desc, eq, or } from "drizzle-orm";

import { db } from "@/db";
import { mediaAssets, exchangeItems, exchangeReports } from "@/db/schema";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";


const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type");

  const rows = await db
    .select()
    .from(mediaAssets)
    .where(type ? eq(mediaAssets.type, type) : undefined)
    .orderBy(desc(mediaAssets.createdAt));

  return NextResponse.json(rows);
}

export async function DELETE(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const id = Number(request.nextUrl.searchParams.get("id"));

  if (!id) {
    return NextResponse.json({ error: "معرف الملف غير صحيح" }, { status: 400 });
  }

  const [asset] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);

  if (!asset) {
    return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
  }

  const usedInItems = await db
    .select({ id: exchangeItems.id })
    .from(exchangeItems)
    .where(or(eq(exchangeItems.audioUrl, asset.url), eq(exchangeItems.fileUrl, asset.url)))
    .limit(1);

  const usedInReports = await db
    .select({ id: exchangeReports.id })
    .from(exchangeReports)
    .where(eq(exchangeReports.fileUrl, asset.url))
    .limit(1);

  if (usedInItems.length > 0 || usedInReports.length > 0) {
    return NextResponse.json(
      { error: "لا يمكن حذف الملف لأنه مستخدم في مواد أو تقارير التبادل" },
      { status: 409 }
    );
  }

  await S3.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: asset.r2Key,
    })
  );

  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));

  return NextResponse.json({ success: true });
}

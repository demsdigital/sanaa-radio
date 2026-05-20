import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { db } from "@/db";
import { mediaLibrary } from "@/db/schema";
import sharp from "sharp";

export const runtime = "nodejs";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/aac"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;
  if (!payload)
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file)
    return NextResponse.json({ error: "لم يتم اختيار ملف" }, { status: 400 });

  const isImage = file.type.startsWith("image/");
  const isAudio = file.type.startsWith("audio/");

  // التحقق من نوع الملف
  if (isImage && !ALLOWED_IMAGE_TYPES.includes(file.type))
    return NextResponse.json({ error: "نوع الصورة غير مسموح به" }, { status: 400 });
  if (isAudio && !ALLOWED_AUDIO_TYPES.includes(file.type))
    return NextResponse.json({ error: "نوع الملف الصوتي غير مسموح به" }, { status: 400 });
  if (!isImage && !isAudio)
    return NextResponse.json({ error: "يُسمح فقط بالصور والملفات الصوتية" }, { status: 400 });

  // التحقق من الحجم
  if (isImage && file.size > MAX_IMAGE_SIZE)
    return NextResponse.json({ error: "حجم الصورة يتجاوز 5MB" }, { status: 400 });
  if (isAudio && file.size > MAX_AUDIO_SIZE)
    return NextResponse.json({ error: "حجم الملف الصوتي يتجاوز 100MB" }, { status: 400 });

  const originalBuffer = Buffer.from(await file.arrayBuffer());

  let uploadBuffer: Buffer = originalBuffer;
  let uploadContentType = file.type;
  let safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");

  // ضغط الصور وتحويلها إلى WebP باستثناء GIF للحفاظ على الحركة إن وجدت
  if (isImage && file.type !== "image/gif") {
    uploadBuffer = await sharp(originalBuffer)
      .rotate()
      .resize({
        width: 3840,
        height: 3840,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();

    uploadContentType = "image/webp";
    safeFilename = safeFilename.replace(/\.[^.]+$/, "") + ".webp";
  }

  const filename = `${Date.now()}-${safeFilename}`;
  const folder = isAudio ? "audio" : "images";
  const key = `${folder}/${filename}`;

  await S3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: uploadBuffer,
    ContentType: uploadContentType,
  }));

  const url = `${process.env.R2_PUBLIC_URL}/${key}`;

  // أي صورة تُرفع من أي مكان في لوحة التحكم تُسجَّل تلقائيًا في مكتبة الصور
  if (isImage) {
    await db.insert(mediaLibrary).values({
      filename,
      url,
      uploadedBy: payload.id,
    });
  }

  return NextResponse.json({ url, key });
}

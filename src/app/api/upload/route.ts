import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

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
  if (!token || !verifyToken(token))
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

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-")}`;
  const folder = isAudio ? "audio" : "images";
  const key = `${folder}/${filename}`;

  await S3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }));

  const url = `${process.env.R2_PUBLIC_URL}/${key}`;
  return NextResponse.json({ url, key });
}

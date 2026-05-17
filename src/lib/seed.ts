import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function seed() {
  const password = await hashPassword("admin123456");

  await db.insert(users).values({
    name: "مدير النظام",
    email: "admin@sanaaradio.ye",
    password,
    role: "admin",
    active: true,
  });

  console.log("✅ تم إنشاء المستخدم الأول بنجاح");
  console.log("📧 البريد: admin@sanaaradio.ye");
  console.log("🔑 كلمة المرور: admin123456");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
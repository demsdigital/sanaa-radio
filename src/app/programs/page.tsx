import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "البرامج | إذاعة الجمهورية اليمنية",
  description: "استعرض جميع برامج إذاعة الجمهورية اليمنية — البرنامج العام.",
  openGraph: { title: "البرامج | إذاعة الجمهورية اليمنية", description: "استعرض جميع برامج إذاعة الجمهورية اليمنية.", locale: "ar_YE", type: "website" },
};

import { db } from "@/db";
import { programs } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function ProgramsPage() {
  const allPrograms = await db.select().from(programs).where(eq(programs.active, true));

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <nav className="border-b border-slate-200 px-6 py-4 flex items-center gap-3 bg-white shadow-sm">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">← الرئيسية</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 text-sm">البرامج</span>
      </nav>

      <div className="bg-blue-600 py-12 px-6 text-white text-center">
        <div className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-2">أرشيف</div>
        <h1 className="text-3xl font-black">البرامج</h1>
        <p className="text-blue-200 text-sm mt-2">{allPrograms.length} برنامج</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12" dir="rtl">
        {allPrograms.length === 0 ? (
          <div className="text-slate-400 text-center py-20">لا توجد برامج بعد</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 rtl">
            {allPrograms.map((p) => (
              <Link key={p.id} href={`/programs/${p.slug}`}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <span className="text-xl">📻</span>
                </div>
                <div className="text-slate-900 font-bold text-sm mb-1">{p.name}</div>
                <div className="text-blue-600 text-xs font-medium mb-2">{p.category}</div>
                {p.description && <div className="text-slate-500 text-xs line-clamp-2">{p.description}</div>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

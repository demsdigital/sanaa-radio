import { db } from "@/db";
import { programs } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ProgramsPage() {
  const allPrograms = await db.select().from(programs).where(eq(programs.active, true));

  return (
    <div className="min-h-screen bg-[#07070d] text-white" dir="rtl">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">← الرئيسية</a>
        <span className="text-gray-700">/</span>
        <span className="text-white text-sm">البرامج</span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="text-[#1a4fd6] text-xs uppercase tracking-widest font-bold mb-2">أرشيف</div>
          <h1 className="text-white text-3xl font-black">البرامج</h1>
        </div>

        {allPrograms.length === 0 ? (
          <div className="text-gray-500 text-center py-20">لا توجد برامج بعد</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allPrograms.map((p) => (
              <a key={p.id} href={`/programs/${p.slug}`}
                className="bg-[#0e0e18] border border-white/10 rounded-xl p-5 hover:border-[#1a4fd6]/40 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-[#1a4fd6]/10 border border-[#1a4fd6]/20 flex items-center justify-center mb-3 group-hover:bg-[#1a4fd6]/20 transition-colors">
                  <span className="text-xl">📻</span>
                </div>
                <div className="text-white font-bold text-sm mb-1">{p.name}</div>
                <div className="text-[#1a4fd6] text-xs mb-2">{p.category}</div>
                {p.description && <div className="text-gray-500 text-xs line-clamp-2">{p.description}</div>}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

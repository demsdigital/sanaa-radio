import type { Metadata } from "next";
import { db } from "@/db";
import { team } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "فريق الإذاعة | إذاعة الجمهورية اليمنية",
  description: "تعرّف على فريق إذاعة الجمهورية اليمنية — البرنامج العام.",
};

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const members = await db.select().from(team)
    .where(eq(team.active, true))
    .orderBy(asc(team.sortOrder), asc(team.createdAt));

  // تجميع حسب القسم
  const departments: Record<string, typeof members> = {};
  members.forEach(m => {
    if (!departments[m.department]) departments[m.department] = [];
    departments[m.department].push(m);
  });

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white py-14 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-5 right-10 w-48 h-48 rounded-full border border-white" />
          <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full border border-white" />
        </div>
        <div className="relative z-10">
          <div className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-2">من نحن</div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">فريق الإذاعة</h1>
          <p className="text-blue-200 text-sm">إذاعة الجمهورية اليمنية — البرنامج العام</p>
          <p className="text-blue-300 text-xs mt-1">{members.length} عضو</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="border-b border-slate-200 px-6 py-3 flex items-center gap-3 bg-white">
        <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm transition-colors">الرئيسية</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500 text-sm">فريق الإذاعة</span>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {members.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">👥</div>
            <div className="text-slate-400">لا يوجد أعضاء بعد</div>
          </div>
        ) : Object.keys(departments).length === 1 ? (
          /* إذا قسم واحد فقط — شبكة مباشرة */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {members.map(m => <MemberCard key={m.id} member={m} />)}
          </div>
        ) : (
          /* أقسام متعددة */
          <div className="space-y-12">
            {Object.entries(departments).map(([dept, deptMembers]) => (
              <div key={dept}>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-slate-900 text-xl font-black">{dept}</h2>
                  <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                    {deptMembers.length} عضو
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {deptMembers.map(m => <MemberCard key={m.id} member={m} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCard({ member }: { member: { name: string; jobTitle: string; department: string; imageUrl: string | null } }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:border-blue-300 hover:shadow-md transition-all group">
      {/* صورة */}
      <div className="mb-4 flex justify-center">
        {member.imageUrl ? (
          <img src={member.imageUrl} alt={member.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 group-hover:border-blue-200 transition-colors shadow-sm" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-50 border-4 border-slate-100 flex items-center justify-center text-3xl group-hover:border-blue-200 transition-colors">
            👤
          </div>
        )}
      </div>
      {/* معلومات */}
      <div className="text-slate-900 font-bold text-sm mb-1 leading-snug">{member.name}</div>
      <div className="text-blue-600 text-xs font-medium mb-1">{member.jobTitle}</div>
      <div className="text-slate-400 text-xs">{member.department}</div>
    </div>
  );
}

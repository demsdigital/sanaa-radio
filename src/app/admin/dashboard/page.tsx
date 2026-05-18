import { db } from "@/db";
import { programs, episodes, news, users, schedule } from "@/db/schema";

export default async function DashboardPage() {
  const [progs, eps, newsItems, usrs, sched] = await Promise.all([
    db.select().from(programs),
    db.select().from(episodes),
    db.select().from(news),
    db.select().from(users),
    db.select().from(schedule),
  ]);

  const stats = [
    { label: "البرامج", value: progs.length, icon: "📻", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { label: "الحلقات", value: eps.length, icon: "🎙️", color: "bg-purple-50 border-purple-200 text-purple-700" },
    { label: "الأخبار", value: newsItems.length, icon: "📰", color: "bg-green-50 border-green-200 text-green-700" },
    { label: "المستخدمون", value: usrs.length, icon: "👥", color: "bg-orange-50 border-orange-200 text-orange-700" },
    { label: "جدول البث", value: sched.length, icon: "📅", color: "bg-red-50 border-red-200 text-red-700" },
  ];

  const recentEpisodes = eps.slice(-5).reverse();
  const recentNews = newsItems.slice(-3).reverse();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-slate-900 text-2xl font-black">لوحة التحكم</h1>
        <p className="text-slate-500 text-sm mt-1">إذاعة الجمهورية اليمنية — البرنامج العام</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`bg-white border rounded-xl p-5 ${s.color.split(" ")[1]}`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className={`text-3xl font-black mb-1 ${s.color.split(" ")[2]}`}>{s.value}</div>
            <div className="text-slate-500 text-sm font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Episodes */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-slate-900 font-bold">آخر الحلقات</h2>
            <a href="/admin/episodes" className="text-blue-600 text-xs font-medium hover:text-blue-700">عرض الكل</a>
          </div>
          {recentEpisodes.length === 0 ? (
            <div className="text-slate-400 text-center py-10 text-sm">لا توجد حلقات بعد</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentEpisodes.map((ep) => (
                <div key={ep.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🎙️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-900 text-sm font-medium truncate">{ep.title}</div>
                    <div className="text-slate-400 text-xs">{new Date(ep.publishedAt).toLocaleDateString("ar-YE")}</div>
                  </div>
                  {ep.audioUrl ? (
                    <span className="text-green-500 text-xs font-medium">✓ صوت</span>
                  ) : (
                    <span className="text-slate-300 text-xs">بدون صوت</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent News */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-slate-900 font-bold">آخر الأخبار</h2>
            <a href="/admin/news" className="text-blue-600 text-xs font-medium hover:text-blue-700">عرض الكل</a>
          </div>
          {recentNews.length === 0 ? (
            <div className="text-slate-400 text-center py-10 text-sm">لا توجد أخبار بعد</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentNews.map((item) => (
                <div key={item.id} className="px-5 py-3">
                  <div className="text-slate-900 text-sm font-medium mb-1 line-clamp-1">{item.title}</div>
                  <div className="text-slate-400 text-xs">{new Date(item.publishedAt).toLocaleDateString("ar-YE")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h2 className="text-blue-800 font-bold mb-3 text-sm">روابط سريعة</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/admin/programs", label: "+ برنامج جديد" },
            { href: "/admin/episodes", label: "+ حلقة جديدة" },
            { href: "/admin/news", label: "+ خبر جديد" },
            { href: "/admin/schedule", label: "+ جدول بث" },
            { href: "/admin/settings", label: "⚙️ الإعدادات" },
            { href: "/", label: "🌐 الموقع العام", target: "_blank" },
          ].map((link) => (
            <a key={link.href} href={link.href} target={link.target}
              className="bg-white border border-blue-200 text-blue-700 text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

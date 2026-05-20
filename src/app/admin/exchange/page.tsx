import Link from "next/link";
import { db } from "@/db";
import {
  exchangeAchievements,
  exchangeStats,
  exchangeReports,
  exchangePartners,
  exchangeItems,
} from "@/db/schema";

export default async function ExchangeAdminPage() {
  const [
    stats,
    achievements,
    reports,
    partners,
    items,
  ] = await Promise.all([
    db.select().from(exchangeStats),
    db.select().from(exchangeAchievements),
    db.select().from(exchangeReports),
    db.select().from(exchangePartners),
    db.select().from(exchangeItems),
  ]);

  const cards = [
    {
      title: "الإحصائيات",
      count: stats.length,
      icon: "📊",
      color: "from-blue-600 to-cyan-500",
    },
    {
      title: "الإنجازات",
      count: achievements.length,
      icon: "🏆",
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "التقارير",
      count: reports.length,
      icon: "📑",
      color: "from-violet-600 to-fuchsia-500",
    },
    {
      title: "الشركاء",
      count: partners.length,
      icon: "🤝",
      color: "from-emerald-600 to-green-500",
    },
    {
      title: "المواد",
      count: items.length,
      icon: "🎙️",
      color: "from-slate-700 to-slate-900",
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            التبادل البرامجي
          </h1>

          <p className="text-slate-500 mt-2">
            إدارة الإنجازات والإحصائيات والتقارير والمواد الخاصة بالتبادل البرامجي.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/exchange/stats"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            إدارة الإحصائيات
          </Link>

          <Link
            href="/admin/exchange/items"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            مواد التبادل
          </Link>

          <Link
            href="/admin/exchange/partners"
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition-colors"
          >
            الهيئات والشركاء
          </Link>

          <Link
            href="/admin/exchange/achievements"
            className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors"
          >
            إدارة الإنجازات
          </Link>

          <Link
            href="/admin/exchange/reports"
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors"
          >
            إدارة التقارير
          </Link>

          <Link
            href="/admin/exchange/settings"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors"
          >
            إعدادات الظهور
          </Link>

          <Link
            href="/program-exchange"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            فتح الصفحة العامة
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm"
          >
            <div className={`bg-gradient-to-l ${card.color} p-5 text-white`}>
              <div className="text-3xl">{card.icon}</div>

              <div className="mt-5 text-3xl font-black">
                {card.count}
              </div>
            </div>

            <div className="p-5">
              <div className="font-bold text-slate-800">
                {card.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="bg-white rounded-3xl border border-slate-200 p-6">
          <h2 className="text-xl font-black text-slate-900 mb-5">
            الخطوات القادمة
          </h2>

          <div className="space-y-3 text-slate-600">
            <Link
              href="/admin/exchange/achievements"
              className="block rounded-2xl bg-slate-50 p-4 hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              إدارة الإنجازات والتكريمات
            </Link>

            <div className="rounded-2xl bg-slate-50 p-4">
              رفع صور التقارير والاجتماعات
            </div>

            <Link
              href="/admin/exchange/stats"
              className="block rounded-2xl bg-slate-50 p-4 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              التحكم في الإحصائيات والأرقام
            </Link>

            <div className="rounded-2xl bg-slate-50 p-4">
              إظهار وإخفاء الأقسام من لوحة التحكم
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-l from-blue-950 to-slate-900 rounded-3xl p-6 text-white">
          <h2 className="text-2xl font-black mb-4">
            منصة قابلة للتوسع
          </h2>

          <p className="text-blue-100 leading-9">
            تم بناء نظام التبادل البرامجي كبنية مستقلة قابلة للنمو مستقبلًا،
            مع دعم الإنجازات، التقارير، الشركاء، المواد البرامجية، والإحصائيات
            الديناميكية من لوحة التحكم.
          </p>
        </section>
      </div>
    </div>
  );
}

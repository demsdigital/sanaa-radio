"use client";
import AdminSearch from "@/app/admin/_ui/AdminSearch";

import { useState, useEffect } from "react";
import Link from "next/link";

type Me = { id: number; name: string; role: string; permissions: string[] };
type Stats = { programs: number; episodes: number; news: number; users: number; schedule: number; articles: number };

const ALL_QUICK_LINKS = [
  { href: "/admin/programs",  label: "+ برنامج جديد",  perm: "programs" },
  { href: "/admin/episodes",  label: "+ حلقة جديدة",   perm: "episodes" },
  { href: "/admin/news",      label: "+ خبر جديد",     perm: "news" },
  { href: "/admin/articles",  label: "+ مقال جديد",    perm: "articles" },
  { href: "/admin/schedule",  label: "+ جدول بث",      perm: "schedule" },
  { href: "/admin/settings",  label: "⚙️ الإعدادات",   perm: "admin" },
  { href: "/",                label: "🌐 الموقع العام", perm: null },
];

const ALL_STATS = [
  { label: "البرامج",    key: "programs",  icon: "📻", color: "border-blue-200   text-blue-700",   bg: "bg-blue-50"   },
  { label: "الحلقات",    key: "episodes",  icon: "🎙️", color: "border-purple-200 text-purple-700", bg: "bg-purple-50" },
  { label: "الأخبار",    key: "news",      icon: "📰", color: "border-green-200  text-green-700",  bg: "bg-green-50"  },
  { label: "الكتابات",   key: "articles",  icon: "✍️", color: "border-slate-200  text-slate-700",  bg: "bg-slate-50"  },
  { label: "المستخدمون", key: "users",     icon: "👥", color: "border-orange-200 text-orange-700", bg: "bg-orange-50" },
  { label: "جدول البث",  key: "schedule",  icon: "📅", color: "border-red-200    text-red-700",    bg: "bg-red-50"    },
];

const PERM_STATS: Record<string, string | null> = {
  programs: "programs", episodes: "episodes", news: "news",
  articles: "articles", users: "admin", schedule: "schedule",
};

export default function DashboardPage() {
  const [me, setMe]           = useState<Me | null>(null);
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/dashboard/stats").then(r => r.json()),
    ]).then(([meData, statsData]) => {
      setMe(meData);
      setStats(statsData);
      setLoading(false);
    });
  }, []);

  function hasAccess(perm: string | null) {
    if (!me) return false;
    if (perm === null) return true;
    if (me.role === "admin") return true;
    if (perm === "admin") return false;
    return (me.permissions || []).includes(perm);
  }

  const visibleStats = ALL_STATS.filter(s => hasAccess(PERM_STATS[s.key] ?? null));
  const visibleLinks = ALL_QUICK_LINKS.filter(l => hasAccess(l.perm));

  if (loading) return <div className="text-slate-400 text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-slate-900 text-3xl font-black tracking-tight">لوحة التحكم</h1>
        <p className="text-slate-500 text-sm mt-1">
          مرحباً {me?.name} — {me?.role === "admin" ? "👑 مدير النظام" : "👤 عضو الفريق"}
        </p>
      </div>

      <AdminSearch />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-12">
          {visibleStats.map(s => (
            <div key={s.key} className={`bg-white border rounded-xl p-5 ${s.bg} ${s.color.split(" ")[0]}`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className={`text-3xl font-black mb-1 ${s.color.split(" ")[1]}`}>
                {stats[s.key as keyof Stats] ?? 0}
              </div>
              <div className="text-slate-500 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {visibleLinks.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-slate-900 font-black mb-4 text-base">روابط سريعة</h2>
          <div className="flex flex-wrap gap-2">
            {visibleLinks.map(link => (
              <Link key={link.href} href={link.href}
                target={link.href === "/" ? "_blank" : undefined}
                className="bg-white border border-blue-200 text-blue-700 text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SearchData = {
  programs: any[];
  news: any[];
  articles: any[];
  exchange: any[];
  media: any[];
};

export default function AdminSearch() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!q.trim()) {
        setData(null);
        return;
      }

      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [q]);

  const rows = data
    ? [
        ...data.programs.map((i) => ({ type: "📻 برنامج", title: i.name, href: `/admin/programs?edit=${i.id}` })),
        ...data.news.map((i) => ({ type: "📰 خبر", title: i.title, href: `/admin/news?edit=${i.id}` })),
        ...data.articles.map((i) => ({ type: "✍️ مقال", title: i.title, href: `/admin/articles?edit=${i.id}` })),
        ...data.exchange.map((i) => ({ type: "🌍 تبادل", title: i.title, href: `/admin/exchange/items?edit=${i.id}` })),
        ...data.media.map((i) => ({ type: "📁 ملف", title: i.filename, href: i.url || "/admin/media-assets" })),
      ]
    : [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث في النظام..."
        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400"
      />

      {loading && <div className="text-sm text-slate-400 mt-3">جاري البحث...</div>}

      {data && !loading && (
        <div className="mt-4">
          <div className="text-sm text-slate-500 mb-3">
            النتائج: {rows.length}
          </div>

          {rows.length === 0 ? (
            <div className="text-sm text-slate-400">لا توجد نتائج</div>
          ) : (
            <div className="space-y-2">
              {rows.map((r, idx) => (
                <Link
                  key={`${r.href}-${idx}`}
                  href={r.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <span className="font-bold text-slate-800 truncate">{r.title}</span>
                  <span className="text-xs text-slate-500 shrink-0">{r.type}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

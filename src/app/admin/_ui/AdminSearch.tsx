"use client";

import { useEffect, useState } from "react";

export default function AdminSearch() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!q) {
        setData(null);
        return;
      }

      setLoading(true);

      const res = await fetch(`/api/search?q=${q}`);
      const json = await res.json();

      setData(json);
      setLoading(false);
    }, 300); // debounce

    return () => clearTimeout(timeout);
  }, [q]);

  return (
    <div className="bg-white border rounded-2xl p-4 mb-6">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث في النظام..."
        className="w-full px-4 py-3 border rounded-xl"
      />

      {loading && (
        <div className="text-sm text-slate-400 mt-3">جاري البحث...</div>
      )}

      {data && !loading && (
        <div className="mt-4 text-sm space-y-1">
          <div>📻 برامج: {data.programs.length}</div>
          <div>📰 أخبار: {data.news.length}</div>
          <div>✍️ مقالات: {data.articles.length}</div>
          <div>🌍 تبادل: {data.exchange.length}</div>
          <div>📁 ملفات: {data.media.length}</div>
        </div>
      )}
    </div>
  );
}

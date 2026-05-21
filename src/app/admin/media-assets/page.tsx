"use client";

import { useEffect, useMemo, useState } from "react";

type Asset = {
  id: number;
  type: "image" | "audio" | "document" | string;
  folder: string;
  filename: string;
  originalName: string | null;
  url: string;
  r2Key: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
};

function formatSize(size?: number | null) {
  if (!size) return "غير معروف";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function label(type: string) {
  if (type === "audio") return "صوت";
  if (type === "document") return "PDF";
  return "صورة";
}

export default function MediaAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  async function load() {
    setLoading(true);
    const url = type === "all" ? "/api/media-assets" : `/api/media-assets?type=${type}`;
    const res = await fetch(url);
    const data = await res.json();
    setAssets(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [type]);



  function toggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === assets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assets.map((x) => x.id));
    }
  }

  async function deleteSelected() {
    if (selectedIds.length === 0) return;

    if (!confirm(`هل تريد حذف ${selectedIds.length} ملف/ملفات نهائيًا؟`)) {
      return;
    }

    for (const id of selectedIds) {
      const res = await fetch(`/api/media-assets?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "تعذر حذف أحد الملفات");
        return;
      }
    }

    setAssets((prev) => prev.filter((x) => !selectedIds.includes(x.id)));
    setSelectedIds([]);
  }

  async function deleteAsset(asset: Asset) {
    if (!confirm(`هل تريد حذف الملف نهائيًا؟\n${asset.originalName || asset.filename}`)) {
      return;
    }

    const res = await fetch(`/api/media-assets?id=${asset.id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "تعذر حذف الملف");
      return;
    }

    setAssets((prev) => prev.filter((x) => x.id !== asset.id));
  }

  const counts = useMemo(() => {
    return {
      all: assets.length,
      audio: assets.filter((x) => x.type === "audio").length,
      document: assets.filter((x) => x.type === "document").length,
      image: assets.filter((x) => x.type === "image").length,
    };
  }, [assets]);

  return (
    <div dir="rtl">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-slate-900 text-4xl font-black tracking-tight">مكتبة الملفات</h1>
          <p className="text-slate-500 text-lg mt-3">
            استعراض الملفات المرفوعة إلى R2: الصور، الصوتيات، وملفات PDF.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div className="flex gap-3 flex-wrap">
        {[
          ["all", "الكل"],
          ["image", "الصور"],
          ["audio", "الصوتيات"],
          ["document", "PDF"],
        ].map(([value, title]) => (
          <button
            key={value}
            onClick={() => setType(value)}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              type === value
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {title}
          </button>
        ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={toggleSelectAll}
            disabled={assets.length === 0}
            className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {selectedIds.length === assets.length && assets.length > 0 ? "إلغاء تحديد الكل" : "تحديد الكل"}
          </button>

          <button
            onClick={deleteSelected}
            disabled={selectedIds.length === 0}
            className="px-5 py-3 rounded-2xl bg-red-600 text-white font-black text-sm hover:bg-red-700 disabled:opacity-50"
          >
            حذف المحدد ({selectedIds.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-slate-400">
          جاري التحميل...
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-slate-500">
          لا توجد ملفات في هذا التصنيف.
        </div>
      ) : (
        <div className="grid xl:grid-cols-2 gap-5">
          {assets.map((asset) => (
            <article
              key={asset.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm shadow-sm"
            >
              <div className="flex gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(asset.id)}
                  onChange={() => toggleSelect(asset.id)}
                  className="mt-7 w-4 h-4 accent-blue-600 shrink-0"
                />
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 text-3xl">
                  {asset.type === "image" ? (
                    <img src={asset.url} alt="" className="w-full h-full object-cover" />
                  ) : asset.type === "audio" ? (
                    "🎧"
                  ) : (
                    "📄"
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                      {label(asset.type)}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                      {asset.folder}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                      {formatSize(asset.size)}
                    </span>
                  </div>

                  <h2 className="font-black text-slate-900 break-words leading-7">
                    {asset.originalName || asset.filename}
                  </h2>

                  <p className="text-xs text-slate-400 mt-2 break-all">
                    {asset.r2Key}
                  </p>
                </div>
              </div>

              {asset.type === "audio" && (
                <audio controls src={asset.url} className="w-full mt-4" />
              )}

              <div className="grid sm:grid-cols-4 gap-3 mt-5">
                <a
                  href={asset.url}
                  target="_blank"
                  className="text-center px-4 py-3 rounded-2xl bg-slate-100 text-slate-800 text-sm font-black hover:bg-slate-200 transition-colors"
                >
                  عرض
                </a>

                <button
                  onClick={() => navigator.clipboard.writeText(asset.url)}
                  className="px-4 py-3 rounded-2xl bg-blue-50 text-blue-700 text-sm font-black hover:bg-blue-100 transition-colors"
                >
                  نسخ الرابط
                </button>

                <a
                  href={`/api/download/file?url=${encodeURIComponent(asset.url)}`}
                  download
                  className="text-center px-4 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition-colors"
                >
                  تحميل
                </a>

                <button
                  onClick={() => deleteAsset(asset)}
                  className="px-4 py-3 rounded-2xl bg-red-50 text-red-700 text-sm font-black hover:bg-red-100 transition-colors"
                >
                  حذف
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

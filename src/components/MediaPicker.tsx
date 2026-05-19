"use client";
import { useState, useEffect } from "react";

type MediaItem = { id: number; filename: string; url: string; createdAt: string };

type Props = {
  onSelect: (url: string) => void;
  onClose: () => void;
};

export default function MediaPicker({ onSelect, onClose }: Props) {
  const [items, setItems]   = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/media").then(r => r.json()).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const filtered = items.filter(i =>
    i.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <h3 className="text-slate-900 font-bold">اختر من المكتبة</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">×</button>
        </div>

        {/* بحث */}
        <div className="p-3 border-b border-slate-100 flex-shrink-0">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم الصورة..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
        </div>

        {/* الشبكة */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-slate-400 text-center py-10 text-sm">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="text-slate-400 text-center py-10 text-sm">
              {search ? "لا توجد نتائج" : "المكتبة فارغة — ارفع صوراً أولاً"}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filtered.map(item => (
                <button key={item.id} type="button" onClick={() => { onSelect(item.url); onClose(); }}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all">
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">اختر</span>
                  </div>
                  <div className="absolute bottom-0 right-0 left-0 bg-black/50 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-[10px] truncate">{item.filename}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

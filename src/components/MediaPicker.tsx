"use client";
import { useState, useEffect } from "react";

type MediaItem = { id: number; filename: string; url: string; createdAt: string };

type Props = {
  onSelect: (url: string) => void;
  onClose: () => void;
  multiSelect?: boolean;
  onSelectMultiple?: (urls: string[]) => void;
};

export default function MediaPicker({ onSelect, onClose, multiSelect = false, onSelectMultiple }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/media").then(r => r.json()).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const filtered = items.filter(i =>
    i.filename.toLowerCase().includes(search.toLowerCase())
  );

  function handleSingleClick(url: string) {
    if (!multiSelect) {
      onSelect(url);
      onClose();
      return;
    }
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  function handleConfirmMulti() {
    const urls = Array.from(selected);
    if (urls.length === 0) return;
    if (onSelectMultiple) {
      onSelectMultiple(urls);
    } else {
      urls.forEach(url => onSelect(url));
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h3 className="text-slate-900 font-bold">
              {multiSelect ? "اختر من المكتبة (متعدد)" : "اختر من المكتبة"}
            </h3>
            {multiSelect && selected.size > 0 && (
              <p className="text-blue-600 text-xs mt-0.5">تم اختيار {selected.size} صورة</p>
            )}
          </div>
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
              {filtered.map(item => {
                const isSelected = selected.has(item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSingleClick(item.url)}
                    className={[
                      "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-400 ring-offset-1"
                        : "border-transparent hover:border-blue-500",
                    ].join(" ")}
                  >
                    <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />

                    {/* overlay */}
                    <div className={[
                      "absolute inset-0 transition-all flex items-center justify-center",
                      isSelected ? "bg-blue-600/30" : "bg-black/0 group-hover:bg-black/30",
                    ].join(" ")}>
                      {multiSelect ? (
                        <div className={[
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all",
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white/80 border-white text-transparent group-hover:text-slate-400",
                        ].join(" ")}>
                          ✓
                        </div>
                      ) : (
                        <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">اختر</span>
                      )}
                    </div>

                    {/* اسم الملف */}
                    <div className="absolute bottom-0 right-0 left-0 bg-black/50 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-white text-[10px] truncate">{item.filename}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* زر تأكيد الاختيار المتعدد */}
        {multiSelect && (
          <div className="p-3 border-t border-slate-200 flex-shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={handleConfirmMulti}
              disabled={selected.size === 0}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {selected.size === 0
                ? "اختر صورة أو أكثر"
                : selected.size === 1
                ? "إدراج الصورة"
                : `إدراج ${selected.size} صور`}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
              إلغاء
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

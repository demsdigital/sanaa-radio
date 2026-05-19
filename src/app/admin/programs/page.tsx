"use client";
import MediaPicker from "@/components/MediaPicker";
import { usePermission } from "@/lib/usePermission";
import { useState, useEffect, useRef } from "react";

type Program = {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  category: string;
  active: boolean;
};

const categories = ["أخبار", "ديني", "ثقافي", "اجتماعي", "رياضي", "ترفيهي", "عام"];

export default function ProgramsPage() {
  const [programs, setPrograms]             = useState<Program[]>([]);
    usePermission("programs");
  const [loading, setLoading]               = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [editing, setEditing]               = useState<Program | null>(null);
  const [form, setForm]                     = useState({ name: "", slug: "", description: "", imageUrl: "", category: "عام", active: true });
  const [uploading, setUploading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savingOrder, setSavingOrder]       = useState(false);
  const [orderSaved, setOrderSaved]         = useState(false);
  const fileInputRef                        = useRef<HTMLInputElement>(null);
  const dragItem                            = useRef<number | null>(null);
  const dragOverItem                        = useRef<number | null>(null);

  async function load() {
    const res = await fetch("/api/programs");
    setPrograms(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function onDragStart(index: number) { dragItem.current = index; }
  function onDragEnter(index: number) { dragOverItem.current = index; }
  function onDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    const reordered = [...programs];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, moved);
    dragItem.current = null;
    dragOverItem.current = null;
    setPrograms(reordered);
  }

  async function saveOrder() {
    setSavingOrder(true);
    await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ saveOrder: true, order: programs.map(p => p.id) }),
    });
    setSavingOrder(false);
    setOrderSaved(true);
    setTimeout(() => setOrderSaved(false), 2500);
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", imageUrl: "", category: "عام", active: true });
    setShowForm(true);
  }
  function openEdit(p: Program) {
    setEditing(p);
    setForm({ name: p.name, slug: p.slug, description: p.description || "", imageUrl: p.imageUrl || "", category: p.category, active: p.active });
    setShowForm(true);
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) { alert("صور فقط"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("الحجم أكبر من 5MB"); return; }
    setUploading(true); setUploadProgress(0);
    const interval = setInterval(() => setUploadProgress(p => Math.min(p + 15, 85)), 200);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      clearInterval(interval); setUploadProgress(100);
      setForm(prev => ({ ...prev, imageUrl: url }));
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 600);
    } catch {
      clearInterval(interval); setUploading(false); setUploadProgress(0);
      alert("فشل الرفع");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const body   = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/programs", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false); load();
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch("/api/programs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-8 gap-2 flex-wrap">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">البرامج</h1>
          <p className="text-slate-500 text-sm mt-1">{programs.length} برنامج</p>
        </div>
        <div className="flex items-center gap-3">
          {orderSaved && (
            <span className="text-green-600 text-sm font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">✓ تم حفظ الترتيب</span>
          )}
          <button onClick={saveOrder} disabled={savingOrder}
            className="flex items-center gap-1 bg-slate-700 text-white px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50">
            {savingOrder ? "جاري الحفظ..." : "💾 حفظ الترتيب"}
          </button>
          <button onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
            + إضافة برنامج
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700 text-sm mb-5 flex items-center gap-2">
        <span>☝️</span>
        <span>اسحب البطاقات لتغيير الترتيب، ثم اضغط <strong>حفظ الترتيب</strong></span>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
      ) : programs.length === 0 ? (
        <div className="text-slate-400 text-center py-20">لا توجد برامج بعد</div>
      ) : (
        <div className="space-y-3">
          {programs.map((p, index) => (
            <div key={p.id}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragEnter={() => onDragEnter(index)}
              onDragEnd={onDragEnd}
              onDragOver={e => e.preventDefault()}
              className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 flex items-center gap-2 md:gap-4 cursor-grab active:cursor-grabbing active:shadow-lg active:border-blue-300 transition-all select-none">
              <div className="text-slate-300 hover:text-slate-500 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="5" cy="4" r="1.5"/><circle cx="11" cy="4" r="1.5"/>
                  <circle cx="5" cy="8" r="1.5"/><circle cx="11" cy="8" r="1.5"/>
                  <circle cx="5" cy="12" r="1.5"/><circle cx="11" cy="12" r="1.5"/>
                </svg>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </div>
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-2xl">📻</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-slate-900 font-semibold">{p.name}</div>
                <div className="text-slate-400 text-xs mt-0.5 font-mono">{p.slug}</div>
                {p.description && <div className="text-slate-500 text-xs mt-1 line-clamp-1">{p.description}</div>}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">{p.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {p.active ? "نشط" : "موقوف"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(p)}
                  className="text-slate-600 text-xs px-2 md:px-3 py-1.5 border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                  تعديل
                </button>
                <button onClick={() => handleDelete(p.id)}
                  className="text-red-500 text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 my-8" dir="rtl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 font-bold text-lg">{editing ? "تعديل البرنامج" : "إضافة برنامج جديد"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">اسم البرنامج <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">الـ Slug (رابط) <span className="text-red-500">*</span></label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required dir="ltr" placeholder="morning-show"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors font-mono" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">الوصف</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">🖼 صورة البرنامج</label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                <div onClick={() => !uploading && fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageUpload(f); }}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    uploading ? "border-blue-300 bg-blue-50 cursor-wait"
                    : form.imageUrl ? "border-green-300 bg-green-50 hover:border-green-400"
                    : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50"
                  }`}>
                  {uploading ? (
                    <div className="space-y-2">
                      <div className="text-blue-600 text-sm font-medium">جاري الرفع...</div>
                      <div className="w-full bg-blue-100 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <div className="text-blue-400 text-xs">{uploadProgress}%</div>
                    </div>
                  ) : form.imageUrl ? (
                    <div className="space-y-2">
                      <img src={form.imageUrl} alt="معاينة" className="mx-auto h-32 rounded-lg object-cover border border-green-200" />
                      <div className="text-green-600 text-sm font-medium">✓ تم الرفع</div>
                      <div className="text-slate-400 text-xs">اضغط لتغيير الصورة</div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="text-3xl">🖼</div>
                      <div className="text-slate-600 text-sm font-medium">اسحب أو اضغط لرفع صورة</div>
                      <div className="text-slate-400 text-xs">PNG, JPG, WEBP — بحد 5MB</div>
                    </div>
                  )}
                </div>
                {form.imageUrl && !uploading && (
                  <button type="button" onClick={() => { setForm(p => ({ ...p, imageUrl: "" })); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="mt-1.5 text-red-500 text-xs hover:text-red-700">× حذف الصورة</button>
                )}
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">التصنيف</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                <label htmlFor="active" className="text-slate-700 text-sm">برنامج نشط</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                  {editing ? "حفظ التعديلات" : "إضافة البرنامج"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

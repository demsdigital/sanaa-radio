"use client";
import { useState, useEffect } from "react";

type Program = { id: number; name: string };
type Episode = { id: number; programId: number; title: string; description: string; audioUrl: string; youtubeUrl: string; duration: number; publishedAt: string };

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Episode | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ programId: "", title: "", description: "", audioUrl: "", youtubeUrl: "", duration: "" });

  async function load() {
    const [ep, pr] = await Promise.all([fetch("/api/episodes").then(r => r.json()), fetch("/api/programs").then(r => r.json())]);
    setEpisodes(ep); setPrograms(pr); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ programId: programs[0]?.id.toString() || "", title: "", description: "", audioUrl: "", youtubeUrl: "", duration: "" });
    setShowForm(true);
  }
  function openEdit(e: Episode) {
    setEditing(e);
    setForm({ programId: e.programId.toString(), title: e.title, description: e.description || "", audioUrl: e.audioUrl || "", youtubeUrl: e.youtubeUrl || "", duration: e.duration?.toString() || "" });
    setShowForm(true);
  }
  async function handleUpload(file: File) {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setForm(f => ({ ...f, audioUrl: data.url }));
    setUploading(false);
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, programId: parseInt(form.programId), duration: form.duration ? parseInt(form.duration) : null };
    const method = editing ? "PUT" : "POST";
    const payload = editing ? { ...body, id: editing.id } : body;
    await fetch("/api/episodes", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setShowForm(false); load();
  }
  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch("/api/episodes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }
  function getProgramName(id: number) { return programs.find(p => p.id === id)?.name || "غير محدد"; }
  function formatDuration(seconds: number) {
    if (!seconds) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 text-xl md:text-2xl font-bold">الحلقات</h1>
          <p className="text-slate-500 text-sm mt-1">{episodes.length} حلقة</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
          + إضافة حلقة
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
      ) : episodes.length === 0 ? (
        <div className="text-slate-400 text-center py-20">لا توجد حلقات بعد</div>
      ) : (
        <div className="space-y-3">
          {episodes.map(ep => (
            <div key={ep.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                {/* أيقونة */}
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 text-lg">🎙️</div>
                {/* معلومات */}
                <div className="flex-1 min-w-0">
                  <div className="text-slate-900 font-semibold text-sm line-clamp-1">{ep.title}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{getProgramName(ep.programId)}</span>
                    <span className="text-xs text-slate-400">{formatDuration(ep.duration)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ep.audioUrl ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                      {ep.audioUrl ? "✓ صوت" : "بدون صوت"}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(ep.publishedAt).toLocaleDateString("ar-YE")}</span>
                  </div>
                </div>
                {/* أزرار */}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(ep)} className="text-slate-600 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">تعديل</button>
                  <button onClick={() => handleDelete(ep.id)} className="text-red-500 text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-slate-900 font-bold text-lg mb-6">{editing ? "تعديل الحلقة" : "إضافة حلقة جديدة"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">البرنامج</label>
                <select value={form.programId} onChange={e => setForm({ ...form, programId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400">
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">عنوان الحلقة</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">الوصف</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 resize-none" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">الملف الصوتي</label>
                <input type="file" accept="audio/*" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-700 text-sm" />
                {uploading && <p className="text-blue-600 text-xs mt-1">جاري الرفع...</p>}
                {form.audioUrl && <p className="text-green-600 text-xs mt-1">✓ تم الرفع</p>}
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">رابط يوتيوب للحلقة</label>
                <input
                  type="url"
                  value={form.youtubeUrl}
                  onChange={e => setForm({ ...form, youtubeUrl: e.target.value })}
                  dir="ltr"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400"
                />
                <p className="text-slate-400 text-xs mt-1">سنستخدمه لاحقًا لجلب صورة غلاف الحلقة تلقائيًا.</p>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">المدة (بالثواني)</label>
                <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} dir="ltr"
                  placeholder="1800"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                  {editing ? "حفظ التعديلات" : "إضافة الحلقة"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-lg text-sm hover:bg-slate-50 transition-colors">
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

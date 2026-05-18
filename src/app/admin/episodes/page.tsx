"use client";
import { useState, useEffect } from "react";

type Program = { id: number; name: string };
type Episode = {
  id: number;
  programId: number;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  publishedAt: string;
};

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Episode | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ programId: "", title: "", description: "", audioUrl: "", duration: "" });

  async function load() {
    const [ep, pr] = await Promise.all([fetch("/api/episodes").then(r => r.json()), fetch("/api/programs").then(r => r.json())]);
    setEpisodes(ep);
    setPrograms(pr);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ programId: programs[0]?.id.toString() || "", title: "", description: "", audioUrl: "", duration: "" });
    setShowForm(true);
  }

  function openEdit(e: Episode) {
    setEditing(e);
    setForm({ programId: e.programId.toString(), title: e.title, description: e.description || "", audioUrl: e.audioUrl || "", duration: e.duration?.toString() || "" });
    setShowForm(true);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
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
    setShowForm(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch("/api/episodes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  function getProgramName(id: number) {
    return programs.find(p => p.id === id)?.name || "غير محدد";
  }

  function formatDuration(seconds: number) {
    if (!seconds) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">الحلقات</h1>
          <p className="text-slate-800 text-sm mt-1">{episodes.length} حلقة</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600/90 transition-colors">
          + إضافة حلقة
        </button>
      </div>

      {loading ? (
        <div className="text-slate-800 text-center py-20">جاري التحميل...</div>
      ) : episodes.length === 0 ? (
        <div className="text-slate-800 text-center py-20">لا توجد حلقات بعد</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-right text-slate-800 text-xs font-medium px-6 py-4">الحلقة</th>
                <th className="text-right text-slate-800 text-xs font-medium px-6 py-4">البرنامج</th>
                <th className="text-right text-slate-800 text-xs font-medium px-6 py-4">المدة</th>
                <th className="text-right text-slate-800 text-xs font-medium px-6 py-4">صوت</th>
                <th className="text-right text-slate-800 text-xs font-medium px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {episodes.map((ep) => (
                <tr key={ep.id} className="border-b border-slate-100 hover:bg-white/2">
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">{ep.title}</div>
                    <div className="text-slate-800 text-xs mt-1">{new Date(ep.publishedAt).toLocaleDateString("ar-YE")}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-800 text-sm">{getProgramName(ep.programId)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-800 text-sm">{formatDuration(ep.duration)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${ep.audioUrl ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-slate-800"}`}>
                      {ep.audioUrl ? "✓ موجود" : "لا يوجد"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(ep)} className="text-slate-800 hover:text-slate-900 text-xs px-3 py-1 border border-slate-200 rounded hover:border-white/30 transition-colors">تعديل</button>
                      <button onClick={() => handleDelete(ep.id)} className="text-red-500 hover:text-red-300 text-xs px-3 py-1 border border-red-500/20 rounded hover:border-red-500/40 transition-colors">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6">
            <h2 className="text-slate-900 font-bold text-lg mb-6">{editing ? "تعديل الحلقة" : "إضافة حلقة جديدة"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-800 text-sm mb-2">البرنامج</label>
                <select value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400">
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-800 text-sm mb-2">عنوان الحلقة</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-slate-800 text-sm mb-2">الوصف</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-slate-800 text-sm mb-2">الملف الصوتي</label>
                <input type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm" />
                {uploading && <p className="text-blue-600 text-xs mt-1">جاري الرفع...</p>}
                {form.audioUrl && <p className="text-green-400 text-xs mt-1">✓ تم الرفع</p>}
              </div>
              <div>
                <label className="block text-slate-800 text-sm mb-2">المدة (بالثواني)</label>
                <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} dir="ltr" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" placeholder="1800" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-slate-900 py-3 rounded-lg text-sm font-bold hover:bg-blue-600/90 transition-colors">
                  {editing ? "حفظ التعديلات" : "إضافة الحلقة"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-800 py-3 rounded-lg text-sm hover:bg-white/5 transition-colors">
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

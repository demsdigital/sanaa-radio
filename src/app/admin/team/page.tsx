"use client";
import { useState, useEffect, useRef } from "react";

type Member = {
  id: number;
  name: string;
  jobTitle: string;
  department: string;
  imageUrl: string;
  sortOrder: number;
  active: boolean;
};

const DEPARTMENTS = ["إدارة", "برامج", "أخبار", "تقني", "إداري", "عام"];

const empty = { name: "", jobTitle: "", department: "عام", imageUrl: "", active: true };

export default function AdminTeamPage() {
  const [members, setMembers]     = useState<Member[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Member | null>(null);
  const [form, setForm]           = useState(empty);
  const [uploading, setUploading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderSaved, setOrderSaved]   = useState(false);
  const [delId, setDelId]         = useState<number | null>(null);
  const fileRef                   = useRef<HTMLInputElement>(null);
  const dragItem                  = useRef<number | null>(null);
  const dragOverItem              = useRef<number | null>(null);

  async function load() {
    const res = await fetch("/api/team");
    setMembers(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function onDragStart(i: number) { dragItem.current = i; }
  function onDragEnter(i: number) { dragOverItem.current = i; }
  function onDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    const reordered = [...members];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, moved);
    dragItem.current = null; dragOverItem.current = null;
    setMembers(reordered);
  }

  async function saveOrder() {
    setSavingOrder(true);
    await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ saveOrder: true, order: members.map(m => m.id) }),
    });
    setSavingOrder(false); setOrderSaved(true);
    setTimeout(() => setOrderSaved(false), 2500);
  }

  function openAdd() { setEditing(null); setForm(empty); setShowForm(true); }
  function openEdit(m: Member) {
    setEditing(m);
    setForm({ name: m.name, jobTitle: m.jobTitle, department: m.department, imageUrl: m.imageUrl || "", active: m.active });
    setShowForm(true);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    setForm(f => ({ ...f, imageUrl: url }));
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const body   = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/team", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowForm(false); load();
  }

  async function handleDelete(id: number) {
    await fetch("/api/team", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDelId(null); load();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">فريق الإذاعة</h1>
          <p className="text-slate-500 text-sm mt-1">{members.length} عضو</p>
        </div>
        <div className="flex items-center gap-3">
          {orderSaved && <span className="text-green-600 text-sm font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">✓ تم حفظ الترتيب</span>}
          <button onClick={saveOrder} disabled={savingOrder}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50">
            {savingOrder ? "جاري الحفظ..." : "💾 حفظ الترتيب"}
          </button>
          <button onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
            + إضافة عضو
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700 text-sm mb-5 flex items-center gap-2">
        <span>☝️</span>
        <span>اسحب البطاقات لتغيير الترتيب، ثم اضغط <strong>حفظ الترتيب</strong></span>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-4xl mb-3">👥</div>
          <div className="text-slate-400 mb-4">لا يوجد أعضاء بعد</div>
          <button onClick={openAdd} className="text-blue-600 text-sm font-bold hover:underline">+ أضف أول عضو</button>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m, index) => (
            <div key={m.id}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragEnter={() => onDragEnter(index)}
              onDragEnd={onDragEnd}
              onDragOver={e => e.preventDefault()}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing active:shadow-lg active:border-blue-300 transition-all select-none">
              {/* مقبض */}
              <div className="text-slate-300 hover:text-slate-500 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="5" cy="4" r="1.5"/><circle cx="11" cy="4" r="1.5"/>
                  <circle cx="5" cy="8" r="1.5"/><circle cx="11" cy="8" r="1.5"/>
                  <circle cx="5" cy="12" r="1.5"/><circle cx="11" cy="12" r="1.5"/>
                </svg>
              </div>
              {/* رقم */}
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </div>
              {/* صورة */}
              {m.imageUrl ? (
                <img src={m.imageUrl} alt={m.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-2xl border-2 border-slate-100">👤</div>
              )}
              {/* معلومات */}
              <div className="flex-1 min-w-0">
                <div className="text-slate-900 font-semibold">{m.name}</div>
                <div className="text-blue-600 text-xs font-medium mt-0.5">{m.jobTitle}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{m.department}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.active ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                    {m.active ? "نشط" : "مخفي"}
                  </span>
                </div>
              </div>
              {/* أزرار */}
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(m)}
                  className="text-slate-600 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                  تعديل
                </button>
                <button onClick={() => setDelId(m.id)}
                  className="text-red-500 text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal إضافة/تعديل */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 my-8" dir="rtl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 font-bold text-lg">{editing ? "تعديل العضو" : "إضافة عضو جديد"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">الاسم الكامل <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">المسمى الوظيفي <span className="text-red-500">*</span></label>
                <input value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} required
                  placeholder="مذيع، محرر، مدير..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">القسم</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {/* الصورة */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">الصورة الشخصية</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                <div className="flex gap-2">
                  <input type="url" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..." dir="ltr"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 font-mono" />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {uploading ? "..." : "رفع ↑"}
                  </button>
                </div>
                {form.imageUrl && (
                  <div className="mt-2 flex justify-center">
                    <img src={form.imageUrl} alt="معاينة" className="w-20 h-20 rounded-full object-cover border-2 border-blue-200" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                <label htmlFor="active" className="text-slate-700 text-sm">إظهار في الصفحة</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                  {editing ? "حفظ التعديلات" : "إضافة العضو"}
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

      {/* تأكيد الحذف */}
      {delId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDelId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-slate-900 font-bold mb-2">حذف العضو؟</h3>
            <p className="text-slate-500 text-sm mb-5">هذا الإجراء لا يمكن التراجع عنه</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm">إلغاء</button>
              <button onClick={() => handleDelete(delId)} className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold">حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

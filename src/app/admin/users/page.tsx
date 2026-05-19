"use client";
import { usePermission } from "@/lib/usePermission";
import { useState, useEffect } from "react";

type Permission = "news" | "programs" | "schedule" | "episodes" | "articles";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: Permission[];
  active: boolean;
  createdAt: string;
};

const PERMISSIONS: { key: Permission; label: string; icon: string; desc: string }[] = [
  { key: "news",      label: "الأخبار",          icon: "📰", desc: "إضافة وتعديل الأخبار" },
  { key: "programs",  label: "البرامج",           icon: "📻", desc: "إدارة البرامج وترتيبها" },
  { key: "episodes",  label: "الحلقات",           icon: "🎙️", desc: "إضافة وتعديل الحلقات" },
  { key: "schedule",  label: "الخارطة البرامجية", icon: "📅", desc: "إدارة جدول البرامج" },
  { key: "articles",  label: "الكتابات",          icon: "✍️", desc: "إدارة المقالات (قريباً)" },
];

export default function UsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
    usePermission("admin");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [showPwd, setShowPwd]   = useState(false);
  const [pwdReady, setPwdReady] = useState(false);
  const [form, setForm]       = useState({
    name: "", email: "", password: "", role: "team", active: true,
    permissions: [] as Permission[],
  });

  async function load() {
    const res = await fetch("/api/users");
    setUsers(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setPwdReady(true);
    setForm({ name: "", email: "", password: "", role: "team", active: true, permissions: [] });
    setShowForm(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setPwdReady(false);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, active: u.active, permissions: u.permissions || [] });
    setShowForm(true);
    setTimeout(() => setPwdReady(true), 100);
  }

  function togglePerm(key: Permission) {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method  = editing ? "PUT" : "POST";
    const payload = editing ? { ...form, id: editing.id } : form;
    await fetch("/api/users", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  function PermBadge({ perm }: { perm: string }) {
    const p = PERMISSIONS.find(x => x.key === perm);
    if (!p) return null;
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
        {p.icon} {p.label}
      </span>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">المستخدمون</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} مستخدم</p>
        </div>
        <button onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
          + إضافة مستخدم
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
      ) : users.length === 0 ? (
        <div className="text-slate-400 text-center py-20">لا يوجد مستخدمون</div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4">
              {/* أفاتار */}
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-black flex items-center justify-center flex-shrink-0 text-sm">
                {u.name.charAt(0)}
              </div>

              {/* معلومات */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-900 font-semibold">{u.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {u.role === "admin" ? "👑 مدير" : "👤 فريق"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                  }`}>
                    {u.active ? "نشط" : "موقوف"}
                  </span>
                </div>
                <div className="text-slate-400 text-xs mt-0.5" dir="ltr">{u.email}</div>
                {u.role === "team" && u.permissions && u.permissions.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {u.permissions.map(p => <PermBadge key={p} perm={p} />)}
                  </div>
                )}
                {u.role === "team" && (!u.permissions || u.permissions.length === 0) && (
                  <div className="text-amber-500 text-xs mt-1">⚠️ لا توجد صلاحيات محددة</div>
                )}
              </div>

              {/* أزرار */}
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(u)}
                  className="text-slate-600 text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                  تعديل
                </button>
                <button onClick={() => handleDelete(u.id)}
                  className="text-red-500 text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 my-8" dir="rtl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900 font-bold text-lg">{editing ? "تعديل المستخدم" : "إضافة مستخدم جديد"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">الاسم</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required dir="ltr"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">
                  {editing ? "كلمة المرور الجديدة (اتركها فارغة للإبقاء)" : "كلمة المرور"}
                </label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    required={!editing} dir="ltr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-400 pl-10" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">الدور</label>
                <div className="flex gap-3">
                  {[{ val: "team", label: "👤 فريق", desc: "صلاحيات محددة" }, { val: "admin", label: "👑 مدير", desc: "كل الصلاحيات" }].map(r => (
                    <button key={r.val} type="button" onClick={() => setForm({ ...form, role: r.val })}
                      className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        form.role === r.val ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"
                      }`}>
                      <div>{r.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* الصلاحيات — تظهر فقط لـ team */}
              {form.role === "team" && (
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">الصلاحيات</label>
                  <div className="space-y-2 bg-slate-50 rounded-xl p-3 border border-slate-200">
                    {PERMISSIONS.map(p => (
                      <label key={p.key} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox"
                          checked={form.permissions.includes(p.key)}
                          onChange={() => togglePerm(p.key)}
                          className="w-4 h-4 accent-blue-600 flex-shrink-0" />
                        <span className="text-lg">{p.icon}</span>
                        <div className="flex-1">
                          <div className="text-slate-800 text-sm font-medium group-hover:text-blue-600 transition-colors">{p.label}</div>
                          <div className="text-slate-400 text-xs">{p.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-blue-600" />
                <label htmlFor="active" className="text-slate-700 text-sm">حساب نشط</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                  {editing ? "حفظ التعديلات" : "إضافة المستخدم"}
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

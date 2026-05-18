"use client";
import { useState, useEffect } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "team", active: true });

  async function load() {
    const res = await fetch("/api/users");
    setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", email: "", password: "", role: "team", active: true });
    setShowForm(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, active: u.active });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">المستخدمون</h1>
          <p className="text-slate-400 text-sm mt-1">{users.length} مستخدم</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600/90 transition-colors">
          + إضافة مستخدم
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
      ) : users.length === 0 ? (
        <div className="text-slate-400 text-center py-20">لا يوجد مستخدمون</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-right text-slate-500 text-xs font-medium px-6 py-4">المستخدم</th>
                <th className="text-right text-slate-500 text-xs font-medium px-6 py-4">الدور</th>
                <th className="text-right text-slate-500 text-xs font-medium px-6 py-4">الحالة</th>
                <th className="text-right text-slate-500 text-xs font-medium px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-white/2">
                  <td className="px-6 py-4">
                    <div className="text-slate-900 font-medium">{u.name}</div>
                    <div className="text-slate-400 text-xs mt-1" dir="ltr">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${u.role === "admin" ? "bg-blue-600/20 text-blue-600" : "bg-gray-500/20 text-slate-500"}`}>
                      {u.role === "admin" ? "مدير" : "فريق"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${u.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-500"}`}>
                      {u.active ? "نشط" : "موقوف"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="text-slate-500 hover:text-slate-900 text-xs px-3 py-1 border border-slate-200 rounded hover:border-white/30 transition-colors">تعديل</button>
                      <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-300 text-xs px-3 py-1 border border-red-500/20 rounded hover:border-red-500/40 transition-colors">حذف</button>
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
            <h2 className="text-slate-900 font-bold text-lg mb-6">{editing ? "تعديل المستخدم" : "إضافة مستخدم جديد"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-sm mb-2">الاسم</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-slate-500 text-sm mb-2">البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required dir="ltr" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-slate-500 text-sm mb-2">{editing ? "كلمة المرور الجديدة (اتركها فارغة للإبقاء)" : "كلمة المرور"}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} dir="ltr" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-slate-500 text-sm mb-2">الدور</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-400">
                  <option value="team">فريق</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="active" className="text-slate-500 text-sm">حساب نشط</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-slate-900 py-3 rounded-lg text-sm font-bold hover:bg-blue-600/90 transition-colors">
                  {editing ? "حفظ التعديلات" : "إضافة المستخدم"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 text-slate-500 py-3 rounded-lg text-sm hover:bg-white/5 transition-colors">
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

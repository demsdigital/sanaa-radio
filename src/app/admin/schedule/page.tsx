"use client";
import { useState, useEffect } from "react";

const DAYS = [
  { value: "daily", label: "يومي" },
  { value: "sat",   label: "السبت" },
  { value: "sun",   label: "الأحد" },
  { value: "mon",   label: "الاثنين" },
  { value: "tue",   label: "الثلاثاء" },
  { value: "wed",   label: "الأربعاء" },
  { value: "thu",   label: "الخميس" },
  { value: "fri",   label: "الجمعة" },
];

const COLORS = [
  { value: "blue",   label: "أزرق",   dot: "bg-blue-500" },
  { value: "red",    label: "أحمر",   dot: "bg-red-500" },
  { value: "green",  label: "أخضر",   dot: "bg-green-500" },
  { value: "yellow", label: "أصفر",   dot: "bg-yellow-500" },
  { value: "purple", label: "بنفسجي", dot: "bg-purple-500" },
  { value: "orange", label: "برتقالي",dot: "bg-orange-500" },
  { value: "slate",  label: "رمادي",  dot: "bg-slate-400" },
];

const colorBg: Record<string, string> = {
  blue:"bg-blue-50 border-blue-200 text-blue-900",
  red:"bg-red-50 border-red-200 text-red-900",
  green:"bg-green-50 border-green-200 text-green-900",
  yellow:"bg-yellow-50 border-yellow-200 text-yellow-900",
  purple:"bg-purple-50 border-purple-200 text-purple-900",
  orange:"bg-orange-50 border-orange-200 text-orange-900",
  slate:"bg-slate-50 border-slate-200 text-slate-800",
};

type Item = { id: number; label: string; day: string; timeStart: string; timeEnd: string; type: string; color: string };

type Version = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  isDefault: boolean;
  startsAt?: string;
  endsAt?: string;
};
const empty = { label:"", day:"daily", timeStart:"", timeEnd:"", type:"recorded", color:"blue" };

export default function AdminSchedulePage() {
  const [items,     setItems]     = useState<Item[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [versions,  setVersions]  = useState<Version[]>([]);
  const [versionId, setVersionId] = useState<string>("default");
  const [filterDay, setFilterDay] = useState("daily");
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState<Item | null>(null);
  const [form,      setForm]      = useState(empty);
  const [saving,    setSaving]    = useState(false);
  const [creatingVersion, setCreatingVersion] = useState(false);
  const [delId,     setDelId]     = useState<number|null>(null);

  async function loadVersions() {
    const res = await fetch("/api/schedule-versions");
    setVersions(await res.json());
  }

  async function load() {
    const query = versionId === "default" ? "" : `?versionId=${versionId}`;
    const res = await fetch(`/api/schedule${query}`);
    setItems(await res.json());
    setLoading(false);
  }
  useEffect(() => { loadVersions(); }, []);
  useEffect(() => { load(); }, [versionId]);

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function createVersion() {
    const name = prompt("اسم الخارطة الجديدة");
    if (!name) return;

    const startsAt = prompt("تاريخ البداية YYYY-MM-DD");
    if (!startsAt) return;

    const endsAt = prompt("تاريخ النهاية YYYY-MM-DD");
    if (!endsAt) return;

    const cloneFromDefault = confirm("هل تريد نسخ الخارطة الأساسية إلى هذه النسخة؟");

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-");

    setCreatingVersion(true);

    await fetch("/api/schedule-versions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        active: true,
        isDefault: false,
        startsAt: startsAt + "T00:00:00.000Z",
        endsAt: endsAt + "T23:59:59.000Z",
        cloneFromDefault,
      }),
    });

    await loadVersions();

    setCreatingVersion(false);
  }


  async function editVersionDates() {
    if (versionId === "default") {
      alert("الخارطة الأساسية لا تحتاج تواريخ");
      return;
    }

    const current = versions.find(v => String(v.id) === versionId);
    if (!current) return;

    const startsAt = prompt(
      "تاريخ البداية YYYY-MM-DD",
      current.startsAt?.slice(0,10) || ""
    );

    if (!startsAt) return;

    const endsAt = prompt(
      "تاريخ النهاية YYYY-MM-DD",
      current.endsAt?.slice(0,10) || ""
    );

    if (!endsAt) return;

    await fetch("/api/schedule-versions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: current.id,
        startsAt: startsAt + "T00:00:00.000Z",
        endsAt: endsAt + "T23:59:59.000Z",
      }),
    });

    await loadVersions();

    alert("تم تحديث التواريخ");
  }


  function openNew() { setEditing(null); setForm(empty); setModal(true); }
  function openEdit(item: Item) {
    setEditing(item);
    setForm({ label: item.label, day: item.day, timeStart: item.timeStart, timeEnd: item.timeEnd, type: item.type, color: item.color });
    setModal(true);
  }

  async function handleSave() {
    setSaving(true);
    if (editing) {
      await fetch("/api/schedule", {
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          id: editing.id,
          ...form,
          versionId: versionId === "default" ? null : Number(versionId),
        })
      });
    } else {
      await fetch("/api/schedule", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          ...form,
          versionId: versionId === "default" ? null : Number(versionId),
        })
      });
    }
    setSaving(false); setModal(false); load();
  }

  async function handleDelete(id: number) {
    await fetch("/api/schedule", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    setDelId(null); load();
  }

  const filtered = items
    .filter(i => i.day === filterDay || (filterDay !== "daily" && i.day === "daily"))
    .sort((a,b) => a.timeStart.localeCompare(b.timeStart));

  if (loading) return <div className="text-slate-400 text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 text-xl md:text-2xl font-bold">الخارطة البرامجية</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} برنامج إجمالاً</p>
        </div>

            <button onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
          <span>+</span> إضافة
        </button>
      </div>

      {/* نسخ الخارطة */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-bold text-slate-900">نسخة الخارطة</div>
            <div className="text-xs text-slate-500 mt-1">
              اختر الخارطة الأساسية أو الموسمية
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={createVersion}
              disabled={creatingVersion}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              + نسخة جديدة
            </button>

            <select
              value={versionId}
              onChange={(e) => setVersionId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm"
            >
              <option value="default">الخارطة الأساسية</option>

              {versions.map(v => (
                <option key={v.id} value={String(v.id)}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {versionId !== "default" && (() => {
          const current = versions.find(v => String(v.id) === versionId);
          if (!current) return null;

          return (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-bold text-blue-950">{current.name}</div>
                  <div className="text-xs text-blue-700 mt-1">
                    نسخة موسمية — تظهر تلقائيًا داخل الفترة المحددة
                  </div>
                </div>

                <button
                  onClick={editVersionDates}
                  className="bg-white border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-100"
                >
                  تعديل تاريخ النسخة
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="bg-white rounded-lg border border-blue-100 p-3">
                  <div className="text-xs text-slate-500 mb-1">تاريخ البداية</div>
                  <div className="font-bold text-slate-900" dir="ltr">
                    {current.startsAt ? current.startsAt.slice(0, 10) : "غير محدد"}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-blue-100 p-3">
                  <div className="text-xs text-slate-500 mb-1">تاريخ النهاية</div>
                  <div className="font-bold text-slate-900" dir="ltr">
                    {current.endsAt ? current.endsAt.slice(0, 10) : "غير محدد"}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* فلتر الأيام — scroll أفقي على الموبايل */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
        {DAYS.map(d => (
          <button key={d.value} onClick={() => setFilterDay(d.value)}
            className={"px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex-shrink-0 " + (
              filterDay === d.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            )}>
            {d.label}
            <span className="mr-1 text-xs opacity-70">
              ({d.value === "daily"
                ? items.filter(i => i.day === "daily").length
                : items.filter(i => i.day === d.value || i.day === "daily").length})
            </span>
          </button>
        ))}
      </div>

      {/* الجدول */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-4xl mb-3">📅</div>
          <div className="text-slate-400 mb-4">لا توجد برامج</div>
            <button onClick={openNew} className="text-blue-600 text-sm font-bold hover:underline">+ أضف برنامجاً</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const cls = colorBg[item.color] || colorBg.slate;
            return (
              <div key={item.id} className={"rounded-xl border p-3 " + cls}>
                {/* صف المعلومات */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-shrink-0 min-w-[72px] text-center">
                    <div className="font-black text-sm" dir="ltr">{item.timeStart}</div>
                    <div className="text-xs opacity-60" dir="ltr">— {item.timeEnd}</div>
                  </div>
                  <div className="w-px h-8 bg-current opacity-20 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{item.label}</div>
                    <div className="text-xs opacity-60 mt-0.5">
                      {DAYS.find(d => d.value === item.day)?.label}
                      {item.day === "daily" && " • يومي"}
                    </div>
                  </div>
                  {item.type === "live" ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> مباشر
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full flex-shrink-0">تسجيل</span>
                  )}
                </div>
                {/* صف الأزرار */}
                <div className="flex gap-2 justify-end">
            <button onClick={() => openEdit(item)}
                    className="px-3 py-1 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
                    تعديل
                  </button>
            <button onClick={() => setDelId(item.id)}
                    className="px-3 py-1 text-xs font-bold bg-white border border-slate-200 text-red-500 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors">
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal إضافة/تعديل */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-slate-900 font-bold text-lg mb-5">
              {editing ? "تعديل البرنامج" : "إضافة برنامج جديد"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">اسم البرنامج</label>
                <input value={form.label} onChange={e => f("label", e.target.value)} placeholder="نشرة الأخبار"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">اليوم</label>
                <div className="flex items-center gap-2">
            <button
              onClick={createVersion}
              disabled={creatingVersion}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              + نسخة جديدة
            </button>

            <select value={form.day} onChange={e => f("day", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400">
                  {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">وقت البداية</label>
                  <input type="time" value={form.timeStart} onChange={e => f("timeStart", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5">وقت النهاية</label>
                  <input type="time" value={form.timeEnd} onChange={e => f("timeEnd", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">النوع</label>
                <div className="flex gap-3">
                  {[{v:"recorded",l:"تسجيل"},{v:"live",l:"مباشر"}].map(t => (
            <button key={t.v} type="button" onClick={() => f("type", t.v)}
                      className={"flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all " + (form.type === t.v ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600")}>
                      {t.v === "live" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-1.5" />}
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">اللون</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
            <button key={c.value} type="button" onClick={() => f("color", c.value)}
                      className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all " + (form.color === c.value ? "border-blue-500 bg-blue-50" : "border-slate-200")}>
                      <span className={"w-3 h-3 rounded-full " + c.dot} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
            <button onClick={() => setModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                إلغاء
              </button>
            <button onClick={handleSave} disabled={saving || !form.label || !form.timeStart || !form.timeEnd}
                className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
                {saving ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* تأكيد الحذف */}
      {delId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDelId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-slate-900 font-bold mb-2">حذف البرنامج؟</h3>
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

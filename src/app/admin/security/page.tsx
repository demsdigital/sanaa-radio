"use client";
import { useState, useEffect } from "react";

export default function SecurityPage() {
  const [status, setStatus] = useState<"loading" | "disabled" | "setup" | "enabled">("loading");
  const required = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("required") === "1";
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadStatus(); }, []);

  async function loadStatus() {
    const res = await fetch("/api/auth/me").then(r => r.json());
    if (res.totpEnabled) setStatus("enabled");
    else setStatus("disabled");
  }

  async function startSetup() {
    setStatus("setup");
    setError("");
    const res = await fetch("/api/auth/totp-setup").then(r => r.json());
    setQrCode(res.qrCode);
    setSecret(res.secret);
  }

  async function handleActivate() {
    if (code.length !== 6) { setError("أدخل كوداً مكوناً من 6 أرقام"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/auth/totp-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).then(r => r.json());
    setSaving(false);
    if (res.success) {
      setStatus("enabled");
      setSuccess("✅ تم تفعيل المصادقة الثنائية بنجاح");
      setCode("");
    } else {
      setError(res.error || "كود غير صحيح");
    }
  }

  async function handleDisable() {
    if (!confirm("هل أنت متأكد من إلغاء تفعيل المصادقة الثنائية؟")) return;
    const res = await fetch("/api/auth/totp-disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).then(r => r.json());
    if (res.success) {
      setStatus("disabled");
      setSuccess("تم إلغاء تفعيل المصادقة الثنائية");
      setCode("");
    } else {
      setError(res.error || "كود غير صحيح");
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-slate-900 text-2xl font-bold">الأمان</h1>
        <p className="text-slate-500 text-sm mt-1">إعدادات المصادقة الثنائية لحسابك</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm">
          {success}
        </div>
      )}

      {/* الحالة: مفعّل */}
      {status === "enabled" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">✅</div>
            <div>
              <div className="text-slate-900 font-bold">المصادقة الثنائية مفعّلة</div>
              <div className="text-slate-500 text-sm">حسابك محمي بكود TOTP</div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <p className="text-slate-600 text-sm mb-3">لإلغاء التفعيل، أدخل الكود من تطبيق المصادقة:</p>
            <input
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000" maxLength={6} dir="ltr"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-400 mb-3"
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button onClick={handleDisable}
              className="w-full border border-red-200 text-red-600 py-2.5 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">
              إلغاء تفعيل المصادقة الثنائية
            </button>
          </div>
        </div>
      )}

      {/* الحالة: غير مفعّل */}
      {status === "disabled" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl">⚠️</div>
            <div>
              <div className="text-slate-900 font-bold">المصادقة الثنائية غير مفعّلة</div>
              <div className="text-slate-500 text-sm">{required ? "يجب تفعيل المصادقة الثنائية للمتابعة" : "يُنصح بتفعيلها لحماية حسابك"}</div>
            </div>
          </div>
          <button onClick={startSetup}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
            🔐 تفعيل المصادقة الثنائية
          </button>
        </div>
      )}

      {/* الحالة: إعداد */}
      {status === "setup" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-slate-900 font-bold mb-1">الخطوة 1 — امسح الكود بتطبيق المصادقة</h2>
            <p className="text-slate-500 text-sm mb-4">استخدم Google Authenticator أو Authy أو أي تطبيق TOTP</p>
            {qrCode ? (
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-48 h-48 rounded-xl border border-slate-200" />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto bg-slate-100 rounded-xl animate-pulse" />
            )}
          </div>

          <div>
            <h2 className="text-slate-900 font-bold mb-1">أو أدخل الكود يدوياً</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-mono text-sm text-slate-700 break-all select-all text-center">
              {secret || "جاري التحميل..."}
            </div>
          </div>

          <div>
            <h2 className="text-slate-900 font-bold mb-3">الخطوة 2 — أدخل الكود للتحقق</h2>
            <input
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000" maxLength={6} dir="ltr"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-400 mb-3"
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="flex gap-3">
              <button onClick={handleActivate} disabled={saving || code.length !== 6}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? "جاري التحقق..." : "تفعيل"}
              </button>
              <button onClick={() => { setStatus("disabled"); setCode(""); setError(""); }}
                className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className="text-slate-400 text-center py-20">جاري التحميل...</div>
      )}
    </div>
  );
}

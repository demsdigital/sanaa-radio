"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SecurityPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "disabled" | "setup" | "enabled">("loading");
  const [required, setRequired] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRequired(params.get("required") === "1");
    loadStatus();
  }, []);

  async function loadStatus() {
    const res = await fetch("/api/auth/me").then(r => r.json());
    if (res.totpEnabled) setStatus("enabled");
    else {
      setStatus("disabled");
      const params = new URLSearchParams(window.location.search);
      if (params.get("required") === "1") startSetupDirect();
    }
  }

  async function startSetupDirect() {
    setStatus("setup");
    const res = await fetch("/api/auth/totp-setup").then(r => r.json());
    setQrCode(res.qrCode);
    setSecret(res.secret);
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
      if (required) setTimeout(() => router.push("/admin/dashboard"), 1500);
    } else {
      setError(res.error || "كود غير صحيح");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
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

  if (required && status === "setup") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-slate-900 text-2xl font-black mb-2">تفعيل التحقق بخطوتين</h1>
            <p className="text-slate-500 text-sm">مطلوب لحماية حسابك قبل المتابعة</p>
          </div>
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm text-center">
              {success}
            </div>
          )}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-slate-700 text-sm font-bold mb-3">📱 تحتاج تطبيق مصادقة — حمّل أحدهما:</p>
              <div className="grid grid-cols-2 gap-3">
                <a href="https://apps.apple.com/app/authy/id494168017" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-blue-300 transition-colors">
                  <span className="text-2xl">🔵</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Authy</div>
                    <div className="text-xs text-slate-400">App Store</div>
                  </div>
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.authy.authy" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-blue-300 transition-colors">
                  <span className="text-2xl">🔵</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Authy</div>
                    <div className="text-xs text-slate-400">Google Play</div>
                  </div>
                </a>
                <a href="https://apps.apple.com/app/google-authenticator/id388497605" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-blue-300 transition-colors">
                  <span className="text-2xl">🔴</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Google Auth</div>
                    <div className="text-xs text-slate-400">App Store</div>
                  </div>
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-blue-300 transition-colors">
                  <span className="text-2xl">🔴</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Google Auth</div>
                    <div className="text-xs text-slate-400">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
            <div>
              <p className="text-slate-700 text-sm font-bold mb-3">امسح الكود بالتطبيق:</p>
              {qrCode ? (
                <div className="flex justify-center">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48 rounded-xl border border-slate-200" />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto bg-slate-100 rounded-xl animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-slate-600 text-xs mb-2">أو أدخل هذا الكود يدوياً في التطبيق:</p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-mono text-xs text-slate-700 break-all select-all text-center">
                {secret || "جاري التحميل..."}
              </div>
            </div>
            <div>
              <p className="text-slate-700 text-sm font-bold mb-2">أدخل الكود من التطبيق للتأكيد:</p>
              <input
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000" maxLength={6} dir="ltr"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-400 mb-3"
              />
              {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
              <button onClick={handleActivate} disabled={saving || code.length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? "جاري التحقق..." : "تفعيل والمتابعة"}
              </button>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full mt-4 text-slate-400 text-sm hover:text-slate-600 transition-colors py-2">
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
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
      {status === "disabled" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl">⚠️</div>
            <div>
              <div className="text-slate-900 font-bold">المصادقة الثنائية غير مفعّلة</div>
              <div className="text-slate-500 text-sm">يُنصح بتفعيلها لحماية حسابك</div>
            </div>
          </div>
          <button onClick={startSetup}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
            🔐 تفعيل المصادقة الثنائية
          </button>
        </div>
      )}
      {status === "setup" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-slate-900 font-bold mb-1">الخطوة 1 — امسح الكود بتطبيق المصادقة</h2>
            <p className="text-slate-500 text-sm mb-4">استخدم Google Authenticator أو Authy</p>
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

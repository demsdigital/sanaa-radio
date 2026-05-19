"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]         = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState<"login" | "2fa">("login");
  const [userId, setUserId]     = useState<number | null>(null);
  const [tempToken, setTempToken] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "خطأ في تسجيل الدخول"); return; }
    if (data.requiresSetup) {
      router.push("/admin/security?required=1");
    } else if (data.requires2FA) {
      setUserId(data.userId);
      setTempToken(data.tempToken);
      setStep("2fa");
    } else {
      router.push("/admin/dashboard");
    }
  }

  async function handle2FA(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/totp-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, userId, tempToken }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "كود غير صحيح"); return; }
    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#07070d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#1a4fd6]/10 border border-[#1a4fd6]/30 flex items-center justify-center mb-4">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="4" fill="#1a4fd6"/>
              <path d="M12 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="#1a4fd6" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M6 20c0-7.73 6.27-14 14-14s14 6.27 14 14" stroke="#1a4fd6" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".5"/>
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold">إذاعة الجمهورية اليمنية</h1>
          <p className="text-gray-500 text-sm mt-1">البرنامج العام — لوحة التحكم</p>
        </div>

        {/* خطوة 1: بريد + كلمة مرور */}
        {step === "login" && (
          <form onSubmit={handleLogin} autoComplete="off"
            className="bg-[#0e0e18] border border-white/10 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required dir="ltr" autoComplete="off"
                className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6] transition-colors" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">كلمة المرور</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required dir="ltr" autoComplete="new-password" placeholder="••••••••"
                className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6] transition-colors" />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-[#1a4fd6] hover:bg-[#1a4fd6]/90 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors">
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        )}

        {/* خطوة 2: كود TOTP */}
        {step === "2fa" && (
          <form onSubmit={handle2FA} autoComplete="off"
            className="bg-[#0e0e18] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="text-center mb-2">
              <div className="text-3xl mb-2">🔐</div>
              <div className="text-white font-bold">التحقق بخطوتين</div>
              <div className="text-gray-500 text-sm mt-1">أدخل الكود من تطبيق المصادقة</div>
            </div>
            <input
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000" maxLength={6} dir="ltr" autoComplete="one-time-code"
              className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-4 text-white text-3xl font-mono tracking-widest text-center focus:outline-none focus:border-[#1a4fd6] transition-colors"
            />
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading || code.length !== 6}
              className="w-full bg-[#1a4fd6] hover:bg-[#1a4fd6]/90 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors">
              {loading ? "جاري التحقق..." : "تأكيد"}
            </button>
            <button type="button" onClick={() => { setStep("login"); setCode(""); setError(""); }}
              className="w-full text-gray-500 text-sm hover:text-gray-300 transition-colors">
              ← رجوع
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

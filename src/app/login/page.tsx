"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError(data.error || "خطأ في تسجيل الدخول");
      setLoading(false);
    }
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
          <h1 className="text-white text-xl font-bold font-sans">إذاعة الجمهورية اليمنية</h1>
          <p className="text-gray-500 text-sm mt-1">البرنامج العام — لوحة التحكم</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#0e0e18] border border-white/10 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6] transition-colors"
              placeholder=""
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
              className="w-full bg-[#14141f] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1a4fd6] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a4fd6] hover:bg-[#1a4fd6]/90 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
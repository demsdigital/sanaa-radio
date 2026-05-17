"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/admin/dashboard", label: "الرئيسية", icon: "🏠" },
  { href: "/admin/programs", label: "البرامج", icon: "📻" },
  { href: "/admin/episodes", label: "الحلقات", icon: "🎙️" },
  { href: "/admin/schedule", label: "الجدول", icon: "📅" },
  { href: "/admin/news", label: "الأخبار", icon: "📰" },
  { href: "/admin/users", label: "المستخدمون", icon: "👥" },
  { href: "/admin/settings", label: "الإعدادات", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#07070d] flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0e0e18] border-l border-white/10 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1a4fd6]/20 border border-[#1a4fd6]/40 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="4" fill="#1a4fd6"/>
                <path d="M12 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="#1a4fd6" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M6 20c0-7.73 6.27-14 14-14s14 6.27 14 14" stroke="#1a4fd6" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".5"/>
              </svg>
            </div>
            <div>
              <div className="text-white text-sm font-bold">إذاعة الجمهورية</div>
              <div className="text-gray-500 text-xs">لوحة التحكم</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-[#1a4fd6] text-white font-bold"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <span>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 mr-64 p-8">
        {children}
      </main>
    </div>
  );
}

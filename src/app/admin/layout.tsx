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
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-slate-200 flex flex-col fixed h-full shadow-sm">
        {/* Logo */}
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="4" fill="white"/>
                <path d="M12 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M6 20c0-7.73 6.27-14 14-14s14 6.27 14 14" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".7"/>
              </svg>
            </div>
            <div>
              <div className="text-slate-900 text-sm font-bold leading-tight">إذاعة الجمهورية</div>
              <div className="text-blue-600 text-xs font-medium">لوحة التحكم</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-blue-600 text-slate-900 font-bold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-200">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
            <span>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 mr-64 p-8">
        {children}
      </main>
    </div>
  );
}

"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

type Me = { id: number; name: string; role: string; permissions: string[] };

const allNavItems = [
  { href: "/admin/dashboard", label: "الرئيسية",    icon: "🏠", perm: null },
  { href: "/admin/programs",  label: "البرامج",      icon: "📻", perm: "programs" },
  { href: "/admin/episodes",  label: "الحلقات",      icon: "🎙️", perm: "episodes" },
  { href: "/admin/schedule",  label: "الجدول",       icon: "📅", perm: "schedule" },
  { href: "/admin/news",      label: "الأخبار",      icon: "📰", perm: "news" },
  { href: "/admin/team",      label: "الفريق",       icon: "👥", perm: "admin" },
  { href: "/admin/media",     label: "مكتبة الصور",  icon: "🖼️", perm: null },
  { href: "/admin/articles",  label: "الكتابات",     icon: "✍️", perm: "articles" },
  { href: "/admin/users",     label: "المستخدمون",   icon: "👥", perm: "admin" },
  { href: "/admin/settings",  label: "الإعدادات",    icon: "⚙️", perm: "admin" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [me, setMe]         = useState<Me | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(data => {
      if (!data || data.error) { router.push("/login"); return; }
      setMe(data);
    });
  }, []);

  // أغلق الـ drawer عند تغيير الصفحة
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function hasAccess(perm: string | null): boolean {
    if (!me) return false;
    if (perm === null) return true;
    if (me.role === "admin") return true;
    if (perm === "admin") return false;
    return (me.permissions || []).includes(perm);
  }

  const navItems = allNavItems.filter(item => hasAccess(item.perm));

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-slate-200 flex-shrink-0">
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
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === item.href
                ? "bg-blue-600 text-white font-bold"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-slate-200 flex-shrink-0">
        {me && (
          <div className="px-4 py-2 mb-1">
            <div className="text-slate-800 text-sm font-medium truncate">{me.name}</div>
            <div className="text-slate-400 text-xs">{me.role === "admin" ? "👑 مدير" : "👤 فريق"}</div>
          </div>
        )}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
          <span>🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* ── موبايل: شريط علوي ── */}
      <header className="md:hidden fixed top-0 right-0 left-0 z-40 bg-white border-b border-slate-200 flex items-center justify-between px-4 h-14 shadow-sm">
        <button onClick={() => setDrawerOpen(true)}
          className="flex flex-col gap-1.5 w-8 h-8 items-center justify-center">
          <span className="block w-5 h-0.5 bg-slate-700 rounded" />
          <span className="block w-5 h-0.5 bg-slate-700 rounded" />
          <span className="block w-5 h-0.5 bg-slate-700 rounded" />
        </button>
        <div className="text-slate-900 text-sm font-bold">لوحة التحكم</div>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="4" fill="white"/>
            <path d="M12 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
      </header>

      {/* ── موبايل: Drawer ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          {/* drawer من اليمين */}
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="text-slate-900 font-bold text-sm">القائمة</span>
              <button onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-xl text-slate-500">
                ×
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── ديسكتوب: Sidebar ── */}
      <aside className="hidden md:flex w-64 bg-white border-l border-slate-200 flex-col fixed inset-y-0 right-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* ── Main ── */}
      <main className="md:mr-64 p-4 md:p-8 pt-16 md:pt-8">
        {children}
      </main>

    </div>
  );
}

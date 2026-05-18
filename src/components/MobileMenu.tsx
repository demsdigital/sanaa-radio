"use client";
import { useState } from "react";
import Link from "next/link";

type NavLink = { href: string; label: string; condition?: boolean };

type Props = {
  links: NavLink[];
  socials: { key: string; label: string; bg: string; url: string }[];
};

export default function MobileMenu({ links, socials }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* زر الهامبرغر */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
        aria-label="القائمة">
        <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${open ? "rotate-45 translate-y-1.5" : ""}`} />
        <span className={`block w-5 h-0.5 bg-slate-700 my-1 transition-all duration-300 ${open ? "opacity-0" : ""}`} />
        <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
      </button>

      {/* القائمة المنسدلة */}
      {open && (
        <>
          {/* overlay */}
          <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setOpen(false)} />

          {/* القائمة */}
          <div className="absolute top-full right-0 left-0 z-40 bg-white border-b border-slate-200 shadow-lg md:hidden" dir="rtl">
            <div className="px-4 py-3 space-y-1">
              {links.filter(l => l.condition !== false).map(link => (
                <Link key={link.href} href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium text-sm">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* سوشال ميديا */}
            {socials.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100">
                <div className="text-slate-400 text-xs mb-2 font-medium">تابعنا</div>
                <div className="flex gap-2 flex-wrap">
                  {socials.map(soc => (
                    <a key={soc.key} href={soc.url} target="_blank" rel="noopener noreferrer"
                      title={soc.label}
                      onClick={() => setOpen(false)}
                      className="text-xs px-3 py-1.5 rounded-full text-white font-medium"
                      style={{ background: soc.bg }}>
                      {soc.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

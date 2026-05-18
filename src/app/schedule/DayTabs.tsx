"use client";
import { useRouter, useSearchParams } from "next/navigation";

const days = [
  { value: "sat", label: "السبت",    en: "SAT" },
  { value: "sun", label: "الأحد",    en: "SUN" },
  { value: "mon", label: "الاثنين",  en: "MON" },
  { value: "tue", label: "الثلاثاء", en: "TUE" },
  { value: "wed", label: "الأربعاء", en: "WED" },
  { value: "thu", label: "الخميس",   en: "THU" },
  { value: "fri", label: "الجمعة",   en: "FRI" },
];

export default function DayTabs({ counts, today }: { counts: Record<string,number>; today: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get("day") || today;
  return (
    <div className="grid grid-cols-7 gap-2 mb-8">
      {days.map((d) => {
        const isSelected = d.value === selected;
        const isToday = d.value === today;
        return (
          <button key={d.value} onClick={() => router.push(`/schedule?day=${d.value}`)}
            className={`rounded-xl p-3 text-center border transition-all ${isSelected ? "bg-blue-600 border-blue-500 text-white shadow-lg" : isToday ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-700 hover:border-blue-200"}`}>
            <div className={`text-xs font-bold mb-1 ${isSelected ? "text-blue-100" : "text-slate-400"}`}>{d.en}</div>
            <div className="font-black text-sm">{d.label}</div>
            <div className={`text-xs mt-1 ${isSelected ? "text-blue-100" : "text-slate-400"}`}>{counts[d.value] || 0}</div>
            {isToday && <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${isSelected ? "bg-white animate-pulse" : "bg-blue-500"}`} />}
          </button>
        );
      })}
    </div>
  );
}

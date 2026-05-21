"use client";

export default function AdminHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-black text-slate-900">{title}</h1>
      {desc && <p className="text-slate-500 text-sm mt-2">{desc}</p>}
    </div>
  );
}

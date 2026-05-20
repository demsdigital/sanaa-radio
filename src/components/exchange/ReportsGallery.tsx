"use client";

import { useState } from "react";

type Report = {
  id: number;
  title: string;
  year: number | null;
  description: string | null;
  imageUrl: string | null;
  fileUrl: string | null;
};

export default function ReportsGallery({
  reports,
}: {
  reports: Report[];
}) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <>
      <div className="columns-1 md:columns-2 xl:columns-3 gap-5 space-y-5">
        {reports.map((item, index) => (
          <article
            key={item.id}
            className="break-inside-avoid overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 group"
          >
            <div className="relative overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className={`w-full object-cover bg-slate-100 transition-transform duration-500 group-hover:scale-105 cursor-zoom-in ${
                    index % 3 === 0
                      ? "h-[420px]"
                      : index % 2 === 0
                      ? "h-[320px]"
                      : "h-[260px]"
                  }`}
                  onClick={() => setActiveImage(item.imageUrl)}
                />
              ) : (
                <div className="w-full h-[260px] bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center text-6xl">
                  📑
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />

              <div className="absolute bottom-0 right-0 left-0 p-6 text-white">
                {item.year && (
                  <div className="inline-flex px-3 py-1 rounded-full bg-white/15 backdrop-blur text-sm font-black mb-3">
                    {item.year}
                  </div>
                )}

                <h3 className="text-2xl font-black leading-tight">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="mt-3 text-white/90 leading-8 text-sm">
                    {item.description}
                  </p>
                )}

                <div className="flex gap-3 mt-5 flex-wrap">
                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      className="inline-flex px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                      عرض الملف
                    </a>
                  )}

                  {item.imageUrl && (
                    <button
                      onClick={() => setActiveImage(item.imageUrl)}
                      className="inline-flex px-4 py-2 rounded-xl bg-white/15 backdrop-blur text-white text-sm font-bold hover:bg-white/25 transition-colors"
                    >
                      تكبير الصورة
                    </button>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveImage(null)}
        >
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-5 left-5 w-12 h-12 rounded-full bg-white/10 text-white text-2xl hover:bg-white/20 transition-colors"
          >
            ×
          </button>

          <img
            src={activeImage}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

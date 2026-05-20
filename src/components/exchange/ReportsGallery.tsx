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

              {item.year && (
                <div className="absolute bottom-4 left-4 inline-flex px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur text-white text-sm font-black">
                  {item.year}
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="text-xl font-black leading-snug text-slate-900">
                {item.title}
              </h3>

              {item.description && (
                <p className="mt-3 text-slate-600 leading-7 text-sm">
                  {item.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                {item.imageUrl && (
                  <button
                    onClick={() => setActiveImage(item.imageUrl)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100 text-slate-800 text-sm font-black hover:bg-slate-200 transition-colors"
                  >
                    🔍 تكبير الصورة
                  </button>
                )}

                {item.fileUrl && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    className="w-full text-center px-4 py-3 rounded-2xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 transition-colors"
                  >
                    📄 عرض PDF
                  </a>
                )}

                {item.fileUrl && (
                  <a
                    href={`/api/download/file?url=${encodeURIComponent(item.fileUrl)}`}
                    download
                    className="w-full text-center px-4 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition-colors sm:col-span-2"
                  >
                    ⬇ تحميل PDF
                  </a>
                )}
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

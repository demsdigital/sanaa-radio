"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  id: number;
  label: string;
  value: string;
  suffix: string | null;
  description: string | null;
};

function AnimatedValue({ value, suffix }: { value: string; suffix: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
      setDisplay(value);
      return;
    }

    const el = ref.current;
    if (!el) return;

    let started = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;

        started = true;

        const duration = 1200;
        const startTime = performance.now();

        function tick(now: number) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(numeric * eased);

          setDisplay(String(current));

          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.3 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-black text-blue-700">
      {display}
      {suffix || ""}
    </div>
  );
}

export default function ExchangeStatsCounter({ stats }: { stats: Stat[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5"
          >
            <AnimatedValue value={item.value} suffix={item.suffix} />

            <div className="mt-2 font-bold">{item.label}</div>

            {item.description && (
              <div className="mt-1 text-sm text-slate-500">
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

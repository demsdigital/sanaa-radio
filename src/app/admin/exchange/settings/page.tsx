"use client";

import { useEffect, useState } from "react";

type ExchangeSettings = {
  exchange_enabled: string;
  exchange_show_stats: string;
  exchange_show_achievements: string;
  exchange_show_reports: string;
  exchange_show_cloud: string;
  exchange_show_partners: string;
  exchange_show_future: string;
};

export default function ExchangeSettingsPage() {
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<ExchangeSettings>({
    exchange_enabled: "true",
    exchange_show_stats: "true",
    exchange_show_achievements: "true",
    exchange_show_reports: "true",
    exchange_show_cloud: "true",
    exchange_show_partners: "true",
    exchange_show_future: "true",
  });

  async function load() {
    const res = await fetch("/api/exchange/settings");
    const data = await res.json();

    setSettings(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(key: keyof ExchangeSettings) {
    const updated = {
      ...settings,
      [key]: settings[key] === "true" ? "false" : "true",
    };

    setSettings(updated);

    await fetch("/api/exchange/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updated),
    });
  }

  const items = [
    {
      key: "exchange_enabled" as const,
      title: "صفحة التبادل البرامجي كاملة",
      description: "إظهار أو إخفاء صفحة التبادل البرامجي من الموقع العام بالكامل",
    },
    {
      key: "exchange_show_stats" as const,
      title: "قسم الإحصائيات",
      description: "إظهار أو إخفاء أرقام التبادل البرامجي",
    },
    {
      key: "exchange_show_achievements" as const,
      title: "قسم الإنجازات",
      description: "إظهار أو إخفاء التكريمات والإنجازات",
    },
    {
      key: "exchange_show_reports" as const,
      title: "قسم التقارير",
      description: "إظهار أو إخفاء التقارير والصور الرسمية",
    },
    {
      key: "exchange_show_cloud" as const,
      title: "قسم الشبكة السحابية",
      description: "إظهار أو إخفاء قسم التبادل الرقمي السحابي",
    },
    {
      key: "exchange_show_partners" as const,
      title: "قسم الهيئات والشركاء",
      description: "إظهار أو إخفاء الهيئات والجهات المشاركة",
    },
    {
      key: "exchange_show_future" as const,
      title: "قسم الرؤية المستقبلية",
      description: "إظهار أو إخفاء قسم الرؤية المستقبلية",
    },
  ];

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-slate-900 text-3xl font-black">
          إعدادات صفحة التبادل البرامجي
        </h1>

        <p className="text-slate-500 text-base mt-2">
          التحكم في ظهور صفحة التبادل البرامجي وأقسامها في الموقع العام.
        </p>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-20">
          جاري التحميل...
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {items.map((item) => {
            const active = settings[item.key] === "true";

            return (
              <div
                key={item.key}
                className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-black text-slate-900 text-lg">
                      {item.title}
                    </h2>

                    <p className="text-base text-slate-500 mt-2 leading-8">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => toggle(item.key)}
                    className={`px-5 py-3 rounded-2xl text-base font-black transition-colors ${
                      active
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {active ? "ظاهر" : "مخفي"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

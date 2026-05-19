import { db } from "@/db";
import { settings } from "@/db/schema";

export default async function Ticker() {
  const rows = await db.select().from(settings);
  const s: Record<string, string> = {};
  rows.forEach((r) => (s[r.key] = r.value));

  if (s.ticker_visible === "false" || !s.ticker) return null;

  return (
    <div className="bg-red-600 fixed top-0 left-0 right-0 z-50 py-1.5 overflow-hidden">
      <div className="flex items-center">
        <span className="bg-white text-red-600 text-xs font-black px-3 py-0.5 rounded mr-3 flex-shrink-0 z-10">
          عاجل
        </span>
        <div className="overflow-hidden flex-1 max-w-full">
          <div className="whitespace-nowrap animate-marquee inline-block text-white text-sm font-medium">
            {s.ticker} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {s.ticker}
          </div>
        </div>
      </div>
    </div>
  );
}

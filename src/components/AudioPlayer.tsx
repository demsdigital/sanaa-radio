"use client";
import { useState, useRef, useEffect } from "react";

type Props = {
  streamUrl: string;
  stationName: string;
  onAirLabel: string;
};

export default function AudioPlayer({ streamUrl, stationName, onAirLabel }: Props) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [visible, setVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume / 100;
  }, [volume, muted]);

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      audio.src = "";
      setPlaying(false);
    } else {
      setLoading(true);
      audio.src = streamUrl;
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      } finally {
        setLoading(false);
      }
    }
  }

  if (!visible) return null;

  return (
    <>
      <audio ref={audioRef} preload="none" />

      <div
        dir="rtl"
        className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #1a3a7c 60%, #2563eb 100%)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.4)",
        }}>

        {/* الشريط المُصغَّر */}
        {minimized ? (
          <div className="flex items-center justify-between px-4 py-2 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              {/* زر تشغيل صغير */}
              <button onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0">
                {loading ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : playing ? (
                  <span className="text-white text-xs">⏸</span>
                ) : (
                  <span className="text-white text-xs">▶</span>
                )}
              </button>
              <div className="flex items-center gap-2">
                {playing && (
                  <span className="flex gap-0.5 items-end h-4">
                    {[3,5,7,4,6].map((h, i) => (
                      <span key={i} className="w-0.5 bg-blue-300 rounded-full animate-pulse"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                )}
                <span className="text-white text-xs font-medium">{onAirLabel}</span>
              </div>
            </div>
            <button onClick={() => setMinimized(false)}
              className="text-white/60 hover:text-white text-xs transition-colors">
              ↑ توسيع
            </button>
          </div>
        ) : (
          /* الشريط الكامل */
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">

              {/* أيقونة وموجات */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center ${playing ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-transparent" : ""}`}>
                    <span className="text-lg">📻</span>
                  </div>
                  {playing && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse" />
                  )}
                </div>
              </div>

              {/* معلومات البث */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {playing && (
                    <span className="flex gap-0.5 items-end h-3.5">
                      {[3,5,4,6,3,5,4].map((h, i) => (
                        <span key={i} className="w-0.5 bg-blue-300 rounded-full animate-pulse"
                          style={{ height: `${h}px`, animationDelay: `${i * 0.12}s` }} />
                      ))}
                    </span>
                  )}
                  <span className="text-white font-bold text-sm truncate">{onAirLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    playing
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-white/10 text-white/60"
                  }`}>
                    {playing ? "● على الهواء" : "○ متوقف"}
                  </span>
                  <span className="text-blue-200 text-xs">{stationName}</span>
                </div>
              </div>

              {/* زر التشغيل الرئيسي */}
              <button onClick={togglePlay}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 font-bold text-lg ${
                  playing
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white text-blue-700 hover:bg-blue-50"
                }`}
                style={{ boxShadow: playing ? "0 0 20px rgba(239,68,68,0.4)" : "0 0 20px rgba(255,255,255,0.2)" }}>
                {loading ? (
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : playing ? "⏸" : "▶"}
              </button>

              {/* الصوت */}
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setMuted(!muted)}
                  className="text-white/70 hover:text-white transition-colors text-sm w-6 text-center">
                  {muted || volume === 0 ? "🔇" : volume < 50 ? "🔉" : "🔊"}
                </button>
                <input
                  type="range" min={0} max={100} value={muted ? 0 : volume}
                  onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
                  className="w-20 accent-blue-400 cursor-pointer"
                />
              </div>

              {/* أزرار التحكم */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setMinimized(true)}
                  className="text-white/50 hover:text-white/90 transition-colors text-xs px-2 py-1 hover:bg-white/10 rounded">
                  ↓
                </button>
                <button onClick={() => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; } setPlaying(false); setVisible(false); }}
                  className="text-white/50 hover:text-white/90 transition-colors text-xs px-2 py-1 hover:bg-white/10 rounded">
                  ✕
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}
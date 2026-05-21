"use client";

import { useState, useRef } from "react";

export default function AudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }

  return (
    <div className="flex items-center gap-3 bg-white border rounded-xl p-3">
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold"
      >
        {playing ? "⏸" : "▶"}
      </button>

      <div className="text-sm text-slate-600 truncate flex-1">
        Audio Player
      </div>

      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}

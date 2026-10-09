"use client";

import { useEffect, useRef, useState } from "react";

export function LivePreview({
  frames,
  fps,
}: {
  frames: string[];
  fps: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing && frames.length > 0) {
      intervalRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % frames.length);
      }, 1000 / fps);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, frames.length, fps]);

  if (frames.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Live preview</h2>
        <span className="text-xs text-slate-400">
          Frame {index + 1} / {frames.length}
        </span>
      </div>

      <div className="bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frames[index]}
          alt={`preview frame ${index}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="bg-orange-500 hover:bg-orange-600 transition-colors text-white font-medium px-4 py-2 rounded-lg text-sm"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={index}
          onChange={(e) => {
            setPlaying(false);
            setIndex(Number(e.target.value));
          }}
          className="w-full accent-orange-500"
        />
      </div>
      <p className="text-xs text-slate-400 mt-2">
        This is exactly how it will look once the blocks are running in Scratch.
      </p>
    </div>
  );
}

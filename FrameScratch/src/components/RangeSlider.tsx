"use client";

import { useRef } from "react";

type Props = {
  min: number;
  max: number;
  step?: number;
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
};

export function RangeSlider({ min, max, step = 0.1, start, end, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const span = Math.max(max - min, step);
  const pct = (v: number) => ((v - min) / span) * 100;

  const valueAt = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round((min + ratio * span) / step) * step;
  };

  const move = (which: "start" | "end", v: number) => {
    if (which === "start") {
      onChange(Math.max(min, Math.min(v, end - step)), end);
    } else {
      onChange(start, Math.min(max, Math.max(v, start + step)));
    }
  };

  const handleProps = (which: "start" | "end") => ({
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        move(which, valueAt(e.clientX));
      }
    },
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
      const current = which === "start" ? start : end;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        move(which, current - 1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        move(which, current + 1);
      }
    },
  });

  const onTrackDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const v = valueAt(e.clientX);
    move(Math.abs(v - start) <= Math.abs(v - end) ? "start" : "end", v);
  };

  const handleClass =
    "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-orange-500 border-2 border-white shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-orange-300";

  return (
    <div className="px-2.5 py-2 select-none" onPointerDown={onTrackDown}>
      <div ref={trackRef} className="relative h-1.5 w-full rounded-full bg-slate-200">
        <div
          className="absolute h-full rounded-full bg-orange-500"
          style={{ left: `${pct(start)}%`, width: `${pct(end) - pct(start)}%` }}
        />
        <div
          role="slider"
          tabIndex={0}
          aria-label="Trim start"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={start}
          className={handleClass}
          style={{ left: `${pct(start)}%`, touchAction: "none" }}
          {...handleProps("start")}
        />
        <div
          role="slider"
          tabIndex={0}
          aria-label="Trim end"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={end}
          className={handleClass}
          style={{ left: `${pct(end)}%`, touchAction: "none" }}
          {...handleProps("end")}
        />
      </div>
    </div>
  );
}
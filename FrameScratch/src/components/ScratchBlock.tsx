"use client";

import { ReactNode, useEffect, useState } from "react";

type BlockColor = "orange" | "purple";

const colorMap: Record<BlockColor, { base: string; dark: string }> = {
  orange: { base: "#FFAB19", dark: "#CF8B17" },
  purple: { base: "#9966FF", dark: "#774DCB" },
};

function useDelayedVisible(delay: number, animate: boolean) {
  const [visible, setVisible] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [animate, delay]);
  return visible;
}

function FlagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline-block mr-1.5 -mt-0.5">
      <path d="M4 21V4c0-.55.45-1 1-1 2.5 2 5.5 2 8-1 2.5 2.5 5 1 6-.5v10c-1 1.5-3.5 2.5-6 .5-2.5-2-5.5-2-8 1" fill="#4CAF50" stroke="#3d8b40" strokeWidth="0.5"/>
    </svg>
  );
}

export function HatBlock({
  children,
  delay = 0,
  animate = true,
}: {
  children: ReactNode;
  delay?: number;
  animate?: boolean;
}) {
  const visible = useDelayedVisible(delay, animate);
  return (
    <div
      className={`relative text-white font-bold text-sm select-none transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
      }`}
      style={{
        backgroundColor: colorMap.orange.base,
        borderBottom: `3px solid ${colorMap.orange.dark}`,
        borderRadius: "10px 10px 4px 4px",
        padding: "10px 16px 8px 16px",
        minWidth: "160px",
      }}
    >
      <FlagIcon />
      {children}
    </div>
  );
}

export function CommandBlock({
  color,
  children,
  delay = 0,
  animate = true,
}: {
  color: BlockColor;
  children: ReactNode;
  delay?: number;
  animate?: boolean;
}) {
  const visible = useDelayedVisible(delay, animate);
  const c = colorMap[color];
  return (
    <div
      className={`relative text-white font-bold text-sm select-none transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
      }`}
      style={{
        backgroundColor: c.base,
        borderBottom: `3px solid ${c.dark}`,
        borderRadius: "4px",
        padding: "6px 14px",
        marginLeft: "8px",
        width: "fit-content",
      }}
    >
      <span
        className="absolute -top-[6px] left-3 w-3.5 h-1.5"
        style={{ backgroundColor: c.base, borderRadius: "2px 2px 0 0" }}
      />
      {children}
    </div>
  );
}

export function ForeverWrap({
  color = "orange",
  children,
  delay = 0,
  animate = true,
}: {
  color?: BlockColor;
  children: ReactNode;
  delay?: number;
  animate?: boolean;
}) {
  const visible = useDelayedVisible(delay, animate);
  const c = colorMap[color];
  return (
    <div
      className={`relative text-white font-bold text-sm select-none transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
      }`}
      style={{
        backgroundColor: c.base,
        borderBottom: `3px solid ${c.dark}`,
        borderRadius: "4px",
        marginLeft: "8px",
        width: "fit-content",
        paddingBottom: "10px",
      }}
    >
      <span
        className="absolute -top-[6px] left-3 w-3.5 h-1.5"
        style={{ backgroundColor: c.base, borderRadius: "2px 2px 0 0" }}
      />
      <div className="px-3.5 pt-1.5 pb-1">forever</div>
      <div className="ml-3 mr-2 rounded" style={{ backgroundColor: c.dark, padding: "6px" }}>
        <div className="flex flex-col gap-1.5">{children}</div>
      </div>
      <div className="h-2" />
    </div>
  );
}

export function ScratchStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-start">{children}</div>;
}

import { ReactNode } from "react";

type BlockColor = "orange" | "purple" | "green";

const colorMap: Record<BlockColor, string> = {
  orange: "#FF8C1A",
  purple: "#8C52FF",
  green: "#40BF4A",
};

export function ScratchBlock({
  color,
  children,
}: {
  color: BlockColor;
  children: ReactNode;
}) {
  return (
    <div
      className="relative text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm w-fit select-none"
      style={{ backgroundColor: colorMap[color] }}
    >
      <div
        className="absolute -top-1.5 left-4 w-4 h-1.5 rounded-t-sm"
        style={{ backgroundColor: colorMap[color] }}
      />
      {children}
    </div>
  );
}

export function ScratchStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

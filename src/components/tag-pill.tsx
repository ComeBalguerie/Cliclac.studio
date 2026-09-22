import type { ReactNode, MouseEvent } from "react";

export function TagPill({
  active = false,
  onClick,
  children,
  as = "button",
}: {
  active?: boolean;
  onClick?: (e: MouseEvent) => void;
  children: ReactNode;
  as?: "button" | "span";
}) {
  const base =
    "inline-flex items-center rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all";
  const style = active
    ? {
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        boxShadow: "inset 0 0 0 2px var(--foreground)",
      }
    : {
        backgroundColor: "var(--highlight)",
        color: "var(--foreground)",
        boxShadow: "inset 0 0 0 2px var(--foreground)",
      };
  if (as === "span") {
    return (
      <span className={base} style={style}>
        {children}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} tag-pill hover:opacity-80`}
      style={style}
    >
      {children}
    </button>
  );
}

export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const filtered = items.filter(Boolean);
  if (filtered.length === 0) return null;
  const row = filtered.map((item) => `${item} ✳ `).join("");
  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div className="marquee-track">
        <span>{row}</span>
        <span>{row}</span>
      </div>
    </div>
  );
}

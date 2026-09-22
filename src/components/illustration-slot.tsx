import type { ReactNode } from "react";

/** Emplacement d'illustration : affiche la SVG fournie, ou un placeholder animé. */
export function IllustrationSlot({
  src,
  alt = "",
  className = "",
  children,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  children?: ReactNode;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        aria-hidden={alt ? undefined : true}
      />
    );
  }
  return (
    <div className={`illustration-placeholder ${className}`} aria-hidden="true">
      {children ?? <span className="ph-dot" />}
    </div>
  );
}

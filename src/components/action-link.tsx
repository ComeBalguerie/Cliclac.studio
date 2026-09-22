import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const base = "btn-cta";

const styles = {
  solid: "",
  outline: "btn-cta-outline",
} as const;

type Variant = keyof typeof styles;

export function ActionAnchor({
  href,
  children,
  variant = "solid",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className={`${base} ${styles[variant]}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function ActionLink({
  to,
  children,
  variant = "outline",
}: {
  to: string;
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <Link to={to} className={`${base} ${styles[variant]}`}>
      {children}
    </Link>
  );
}

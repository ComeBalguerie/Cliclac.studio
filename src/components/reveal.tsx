import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

type Direction = "up" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  left: { x: -40, y: 0 },
  right: { x: 40, y: 0 },
  none: { x: 0, y: 0 },
};

export function useMotionEnabled() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  return !reduced && !isMobile;
}

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.45,
  scale,
  className,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  scale?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const { x, y } = offsets[direction];

  // Sur mobile ou reduced-motion, rendre un div simple : évite tout état
  // framer-motion figé à opacity 0 pendant la détection du breakpoint.
  if (reduced || isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y, scale: scale ?? 1 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.22, 0.61, 0.36, 1] }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

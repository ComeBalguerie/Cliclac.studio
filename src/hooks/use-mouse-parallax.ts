import { useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Suit la souris et renvoie des valeurs amorties (px), à combiner avec
 * `useTransform` pour créer des couches de parallaxe à vitesses différentes.
 * Désactivé au tactile et sous prefers-reduced-motion.
 */
export function useMouseParallax(strength = 24) {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 50, damping: 18, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 50, damping: 18, mass: 0.6 });
  const enabled = !reduced && !isMobile;

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      x.set(nx * strength);
      y.set(ny * strength);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, strength, x, y]);

  return { x: springX, y: springY, enabled };
}

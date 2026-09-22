import { useEffect, useRef, useState } from "react";
import { useMotionEnabled } from "@/components/reveal";

/** Counts from 0 to `value` when scrolled into view. */
export function CountUp({
  value,
  suffix = "%",
  duration = 2000,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const enabled = useMotionEnabled();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [n, setN] = useState(enabled ? 0 : value);

  useEffect(() => {
    if (!enabled) {
      setN(value);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setN(Math.round(value * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [enabled, value, duration]);

  return (
    <span ref={ref} className={className}>
      {n}
      {suffix}
    </span>
  );
}

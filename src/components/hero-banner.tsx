import { useEffect, useRef, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { heroQuery } from "@/lib/queries";

function sampleLuminance(
  source: HTMLImageElement | HTMLVideoElement,
): "light" | "dark" | null {
  const sw = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
  const sh = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
  if (!sw || !sh) return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const min = Math.min(sw, sh);
    ctx.drawImage(source, 0, Math.max(0, sh - min * 0.3), min * 0.5, min * 0.3, 0, 0, 160, 64);
    const { data } = ctx.getImageData(0, 0, 160, 64);
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return total / (data.length / 4) < 128 ? "light" : "dark";
  } catch {
    return null;
  }
}

export function HeroBanner({ className = "" }: { className?: string }) {
  const { data: heroData } = useSuspenseQuery(heroQuery());
  const [index, setIndex] = useState(0);
  const [color, setColor] = useState<"light" | "dark">("light");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const images = heroData?.type === "carousel" ? heroData.images : [];

  useEffect(() => {
    if (images.length < 2) return;
    const id = window.setInterval(() => setIndex((current) => (current + 1) % images.length), 4000);
    return () => window.clearInterval(id);
  }, [images.length]);

  useEffect(() => {
    if (!heroData || heroData.type !== "carousel") return;
    const img = imgRefs.current[index];
    if (!img) return;
    const update = () => {
      const next = sampleLuminance(img);
      if (next) setColor(next);
    };
    if (img.complete) update();
    else img.addEventListener("load", update, { once: true });
  }, [heroData, index]);

  useEffect(() => {
    if (!heroData || heroData.type !== "video") return;
    const id = window.setInterval(() => {
      const next = videoRef.current ? sampleLuminance(videoRef.current) : null;
      if (next) setColor(next);
    }, 500);
    return () => window.clearInterval(id);
  }, [heroData]);

  if (!heroData) return null;

  if (heroData.type === "video" && heroData.video_url) {
    return (
      <div className={`hero-media relative w-full overflow-hidden ${className}`} style={{ height: "var(--hero-height, 50vh)", minHeight: 320 }}>
        <video ref={videoRef} src={heroData.video_url} autoPlay loop muted playsInline crossOrigin="anonymous" className="h-full w-full object-cover" />
        <div className="hero-media-overlay absolute inset-0" />
        <span className={`hero-contrast-label absolute bottom-6 left-6 z-10 ${color === "light" ? "text-background" : "text-foreground"}`}>
          Cliclac studio
        </span>
      </div>
    );
  }

  if (images.length === 0) return <div className={`hero-media ${className}`} style={{ height: "var(--hero-height, 50vh)" }} />;

  return (
    <div className={`hero-media relative w-full overflow-hidden ${className}`} style={{ height: "var(--hero-height, 50vh)", minHeight: 320 }}>
      {images.map((src, i) => (
        <img
          key={`${src}-${i}`}
          ref={(element) => { imgRefs.current[i] = element; }}
          src={src}
          alt=""
          crossOrigin="anonymous"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
      <div className="hero-media-overlay absolute inset-0" />
      <span className={`hero-contrast-label absolute bottom-6 left-6 z-10 ${color === "light" ? "text-background" : "text-foreground"}`}>
        Cliclac studio
      </span>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import { heroQuery, type HeroSettings } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/hero")({
  staticData: { sitemap: false },
  component: AdminHero,
  head: () => ({ meta: [{ title: "Hero | Admin" }, { name: "robots", content: "noindex" }] }),
});

async function uploadToBucket(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `hero-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("project-media")
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from("project-media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signErr || !data) throw signErr ?? new Error("Signed URL failed");
  return data.signedUrl;
}

function AdminHero() {
  const { data } = useQuery(heroQuery());
  const qc = useQueryClient();
  const [type, setType] = useState<HeroSettings["type"]>("carousel");
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setType(data.type);
      setImages(data.images);
      setVideoUrl(data.video_url);
    }
  }, [data]);

  async function onImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of files) urls.push(await uploadToBucket(f));
      setImages((s) => [...s, ...urls]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload échoué");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToBucket(file);
      setVideoUrl(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload échoué");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase.from("settings").upsert({
        key: "hero",
        value: { type, images, video_url: videoUrl },
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["settings", "hero"] });
      toast.success("Enregistré");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  function move(i: number, dir: -1 | 1) {
    setImages((s) => {
      const j = i + dir;
      if (j < 0 || j >= s.length) return s;
      const c = [...s];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav />
      <main className="mx-auto w-full max-w-[900px] px-6 py-10 md:px-12">
        <h1 className="mb-8 text-[28px]" style={{ fontWeight: 300 }}>Hero</h1>

        <div className="mb-8 flex items-center gap-3">
          <span className="nav-caps text-[11px]">Carousel</span>
          <Switch
            checked={type === "video"}
            onCheckedChange={(v) => setType(v ? "video" : "carousel")}
          />
          <span className="nav-caps text-[11px]">Video</span>
        </div>

        {type === "carousel" ? (
          <div>
            <Label className="nav-caps text-[11px]">Images</Label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onImages}
              className="mt-2 block text-sm font-light"
            />
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {images.map((src, i) => (
                  <div key={src + i}>
                    <img src={src} alt="" className="w-full" />
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => move(i, -1)} className="hover-red">←</button>
                        <button type="button" onClick={() => move(i, 1)} className="hover-red">→</button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImages((s) => s.filter((_, j) => j !== i))}
                        className="hover-red"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <Label className="nav-caps text-[11px]">Video (mp4)</Label>
            <input
              type="file"
              accept="video/mp4,video/*"
              onChange={onVideo}
              className="mt-2 block text-sm font-light"
            />
            {videoUrl && (
              <video src={videoUrl} className="mt-4 max-h-64" controls muted />
            )}
          </div>
        )}

        <div className="mt-8 flex gap-4 border-t border-[var(--line)] pt-6">
          <Button onClick={save} disabled={saving || uploading}>
            {saving ? "…" : "Save"}
          </Button>
        </div>
      </main>
    </div>
  );
}
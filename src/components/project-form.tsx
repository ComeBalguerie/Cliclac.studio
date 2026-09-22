import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { allTagsQuery, type ProjectRow, type GalleryImage } from "@/lib/queries";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { slugify } from "@/lib/slug";
import { TagPill } from "@/components/tag-pill";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableGalleryItem({
  g,
  onRemove,
}: {
  g: GalleryImage;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: g.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <img
        src={g.image_url}
        alt=""
        className="w-full cursor-grab active:cursor-grabbing select-none"
        draggable={false}
        {...attributes}
        {...listeners}
      />
      <div className="mt-1 flex items-center justify-end text-[11px]">
        <button type="button" onClick={onRemove} className="hover-red">
          Remove
        </button>
      </div>
    </div>
  );
}

type FormState = {
  title: string;
  short_description: string;
  long_description: string;
  client: string;
  year: string;
  sector: string;
  discipline: string;
  case_study_problem: string;
  case_study_approach: string;
  case_study_results: string;
  status: "published" | "draft";
  display_order: number;
  cover_image_url: string;
};

export function ProjectForm({
  project,
  initialTagIds = [],
  initialGallery = [],
}: {
  project?: ProjectRow;
  initialTagIds?: string[];
  initialGallery?: GalleryImage[];
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: allTags = [] } = useQuery(allTagsQuery());

  const [form, setForm] = useState<FormState>({
    title: project?.title ?? "",
    short_description: project?.short_description ?? "",
    long_description: project?.long_description ?? "",
    client: project?.client ?? "",
    year: project?.year ?? "",
    sector: project?.sector ?? "",
    discipline: project?.discipline ?? "",
    case_study_problem: project?.case_study_problem ?? "",
    case_study_approach: project?.case_study_approach ?? "",
    case_study_results: project?.case_study_results ?? "",
    status: (project?.status as "published" | "draft") ?? "draft",
    display_order: project?.display_order ?? 0,
    cover_image_url: project?.cover_image_url ?? "",
  });
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds);
  const [tagInput, setTagInput] = useState("");
  const [gallery, setGallery] = useState<GalleryImage[]>(initialGallery);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setGallery((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  useEffect(() => {
    setTagIds(initialTagIds);
  }, [initialTagIds.join(",")]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function uploadFile(file: File): Promise<string> {
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("project-media")
      .upload(path, file, { cacheControl: "31536000", upsert: false });
    if (error) throw error;
    // Bucket is private (workspace blocks public buckets). Use a long-lived
    // signed URL so <img src> works without runtime resolution.
    const { data, error: signErr } = await supabase.storage
      .from("project-media")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (signErr || !data) throw signErr ?? new Error("Signed URL failed");
    return data.signedUrl;
  }

  async function uploadCoverFile(file: File) {
    setUploading(true);
    try {
      const url = await uploadFile(file);
      set("cover_image_url", url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload échoué");
    } finally {
      setUploading(false);
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadCoverFile(file);
    e.target.value = "";
  }

  async function uploadGalleryFiles(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: GalleryImage[] = [];
      for (const file of files) {
        const url = await uploadFile(file);
        uploaded.push({
          id: `tmp-${crypto.randomUUID()}`,
          project_id: project?.id ?? "",
          image_url: url,
          display_order: gallery.length + uploaded.length,
        });
      }
      setGallery((g) => [...g, ...uploaded]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload échoué");
    } finally {
      setUploading(false);
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    await uploadGalleryFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  }


  async function addTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = allTags.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) {
      if (!tagIds.includes(existing.id)) setTagIds((s) => [...s, existing.id]);
    } else {
      const slug = slugify(trimmed);
      const { data, error } = await supabase
        .from("tags")
        .insert({ name: trimmed, slug })
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      qc.invalidateQueries({ queryKey: ["tags"] });
      setTagIds((s) => [...s, data.id]);
    }
    setTagInput("");
  }

  const suggestions = tagInput
    ? allTags
        .filter(
          (t) =>
            t.name.toLowerCase().includes(tagInput.toLowerCase()) &&
            !tagIds.includes(t.id),
        )
        .slice(0, 6)
    : [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        short_description: form.short_description || null,
        long_description: form.long_description || null,
        client: form.client || null,
        year: form.year || null,
        sector: form.sector || null,
        discipline: form.discipline || null,
        case_study_problem: form.case_study_problem || null,
        case_study_approach: form.case_study_approach || null,
        case_study_results: form.case_study_results || null,
        status: form.status,
        display_order: form.display_order,
        cover_image_url: form.cover_image_url || null,
      };
      let id = project?.id;
      if (id) {
        const { error } = await supabase.from("projects").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        id = data.id;
      }

      // Sync tags
      await supabase.from("project_tags").delete().eq("project_id", id!);
      if (tagIds.length > 0) {
        const { error } = await supabase
          .from("project_tags")
          .insert(tagIds.map((tag_id) => ({ project_id: id!, tag_id })));
        if (error) throw error;
      }

      // Sync gallery: delete old and re-insert
      await supabase.from("gallery_images").delete().eq("project_id", id!);
      if (gallery.length > 0) {
        const { error } = await supabase.from("gallery_images").insert(
          gallery.map((g, i) => ({
            project_id: id!,
            image_url: g.image_url,
            display_order: i,
          })),
        );
        if (error) throw error;
      }

      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projet enregistré");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  const selectedTags = allTags.filter((t) => tagIds.includes(t.id));

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <Label className="nav-caps text-[11px]">Title</Label>
        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
          className="mt-2"
        />
      </div>

      <div>
        <Label className="nav-caps text-[11px]">Short description</Label>
        <Input
          value={form.short_description}
          onChange={(e) => set("short_description", e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="nav-caps text-[11px]">Long description</Label>
        <Textarea
          value={form.long_description}
          onChange={(e) => set("long_description", e.target.value)}
          rows={8}
          className="mt-2"
        />
      </div>

      <div className="space-y-6 border-t border-[var(--line)] pt-6">
        <p className="nav-caps text-[11px] text-[color:var(--muted-foreground)]">
          Case study (affiché sur la page projet, masqué si vide)
        </p>
        <div>
          <Label className="nav-caps text-[11px]">Contexte / problème</Label>
          <Textarea
            value={form.case_study_problem}
            onChange={(e) => set("case_study_problem", e.target.value)}
            rows={5}
            className="mt-2"
          />
        </div>
        <div>
          <Label className="nav-caps text-[11px]">Approche</Label>
          <Textarea
            value={form.case_study_approach}
            onChange={(e) => set("case_study_approach", e.target.value)}
            rows={5}
            className="mt-2"
          />
        </div>
        <div>
          <Label className="nav-caps text-[11px]">Résultats</Label>
          <Textarea
            value={form.case_study_results}
            onChange={(e) => set("case_study_results", e.target.value)}
            rows={5}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label className="nav-caps text-[11px]">Tags</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedTags.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTagIds((s) => s.filter((id) => id !== t.id))}
              className="hover-red"
            >
              <TagPill as="span">{t.name} ×</TagPill>
            </button>
          ))}
        </div>
        <div className="relative mt-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="Add a tag then press Enter"
          />
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 border border-[var(--line)] bg-background">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => addTag(s.name)}
                  className="hover-red block w-full px-3 py-2 text-left text-[13px] font-light"
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(["client", "year", "sector", "discipline"] as const).map((k) => (
          <div key={k}>
            <Label className="nav-caps text-[11px] capitalize">{k}</Label>
            <Input
              value={form[k]}
              onChange={(e) => set(k, e.target.value)}
              className="mt-2"
            />
          </div>
        ))}
      </div>

      <div>
        <Label className="nav-caps text-[11px]">Cover image</Label>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          className="hidden"
        />
        {form.cover_image_url ? (
          <div className="mt-3 space-y-3">
            <img
              src={form.cover_image_url}
              alt="Aperçu de l'image de couverture"
              className="max-h-72 w-auto border border-[var(--line)]"
            />
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => coverInputRef.current?.click()}
              >
                Remplacer l'image
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => set("cover_image_url", "")}
                className="hover-red"
              >
                Supprimer la cover
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => coverInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadCoverFile(file);
            }}
            className="mt-3 flex w-full flex-col items-center justify-center gap-2 border border-dashed border-[var(--line)] px-6 py-10 text-center transition-colors hover:border-foreground disabled:opacity-50"
          >
            <span className="nav-caps text-[11px]">
              {uploading ? "Import en cours…" : "Importer une image"}
            </span>
            <span className="text-[13px] font-light text-[color:var(--muted-foreground)]">
              Cliquez ici ou glissez-déposez un fichier
            </span>
          </button>
        )}
      </div>

      <div>
        <Label className="nav-caps text-[11px]">Gallery</Label>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryUpload}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => galleryInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files ?? []);
            if (files.length > 0) void uploadGalleryFiles(files);
          }}
          className="mt-3 flex w-full flex-col items-center justify-center gap-2 border border-dashed border-[var(--line)] px-6 py-8 text-center transition-colors hover:border-foreground disabled:opacity-50"
        >
          <span className="nav-caps text-[11px]">
            {uploading ? "Import en cours…" : "Ajouter des images"}
          </span>
          <span className="text-[13px] font-light text-[color:var(--muted-foreground)]">
            Sélection multiple ou glisser-déposer · glissez les vignettes pour
            les réordonner
          </span>
        </button>
        {gallery.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={gallery.map((g) => g.id)}
              strategy={rectSortingStrategy}
            >
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {gallery.map((g, i) => (
                  <SortableGalleryItem
                    key={g.id}
                    g={g}
                    onRemove={() =>
                      setGallery((s) => s.filter((_, j) => j !== i))
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>


      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label className="nav-caps text-[11px]">Display order</Label>
          <Input
            type="number"
            value={form.display_order}
            onChange={(e) =>
              set("display_order", parseInt(e.target.value, 10) || 0)
            }
            className="mt-2"
          />
        </div>
        <div className="flex items-end gap-3">
          <Switch
            checked={form.status === "published"}
            onCheckedChange={(v) => set("status", v ? "published" : "draft")}
          />
          <span className="nav-caps text-[11px]">
            {form.status === "published" ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      <div className="flex gap-4 border-t border-[var(--line)] pt-6">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? "…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate({ to: "/admin" })}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
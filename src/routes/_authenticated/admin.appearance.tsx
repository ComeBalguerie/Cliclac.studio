import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  APPEARANCE_DEFAULTS,
  APPEARANCE_GLOBAL_KEY,
  APPEARANCE_PAGES,
  GOOGLE_FONTS,
  appearanceQuery,
  mergeAppearance,
  pageKey,
  type AppearanceOverride,
  type AppearancePageId,
  type AppearanceSettings,
} from "@/lib/appearance";

export const Route = createFileRoute("/_authenticated/admin/appearance")({
  staticData: { sitemap: false },
  component: AdminAppearance,
  head: () => ({
    meta: [{ title: "Apparence | Admin" }, { name: "robots", content: "noindex" }],
  }),
});

type Profile = "global" | AppearancePageId;

const colorFields: Array<[keyof AppearanceSettings, string]> = [
  ["color_background", "Fond"],
  ["color_foreground", "Texte"],
  ["color_accent", "Accent (hover, prix)"],
  ["color_line", "Filets / bordures"],
  ["color_tag_bg", "Fond des tags"],
  ["color_muted_foreground", "Texte secondaire"],
];

const numberFields: Array<[keyof AppearanceSettings, string, string?]> = [
  ["project_columns", "Colonnes projets (desktop)", "1 à 4"],
  ["container_width", "Largeur max du contenu (px)"],
  ["page_margin_desktop", "Marge latérale desktop (px)"],
  ["page_margin_mobile", "Marge latérale mobile (px)"],
  ["hero_height", "Hauteur du hero (vh)"],
  ["radius", "Arrondi des angles (px)"],
  ["logo_size", "Taille du logo (px)"],
  ["logo_weight", "Graisse du logo (300–700)"],
  ["nav_size", "Taille des items de nav (px)"],
  ["heading_weight", "Graisse des titres (300–700)"],
  ["body_weight", "Graisse du corps (300–500)"],
];

function AdminAppearance() {
  const { data } = useQuery(appearanceQuery());
  const qc = useQueryClient();
  const [profile, setProfile] = useState<Profile>("global");
  const [globalV, setGlobalV] = useState<AppearanceSettings>(APPEARANCE_DEFAULTS);
  const [overrides, setOverrides] = useState<
    Partial<Record<AppearancePageId, AppearanceOverride>>
  >({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!data) return;
    setGlobalV(data.global);
    setOverrides(data.pages);
  }, [data]);

  const isGlobal = profile === "global";
  const override = isGlobal ? {} : (overrides[profile] ?? {});
  /** values shown in the form for the current profile */
  const v: AppearanceSettings = isGlobal
    ? globalV
    : mergeAppearance(globalV, override);

  const overrideCount = isGlobal ? 0 : Object.keys(override).length;

  function isOverridden(key: keyof AppearanceSettings) {
    return !isGlobal && key in override;
  }

  function set<K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K],
  ) {
    if (isGlobal) {
      setGlobalV((s) => ({ ...s, [key]: value }));
      return;
    }
    setOverrides((s) => ({
      ...s,
      [profile]: { ...(s[profile as AppearancePageId] ?? {}), [key]: value },
    }));
  }

  function clearField(key: keyof AppearanceSettings) {
    if (isGlobal) return;
    setOverrides((s) => {
      const next = { ...(s[profile as AppearancePageId] ?? {}) };
      delete next[key];
      return { ...s, [profile]: next };
    });
  }

  function resetProfile() {
    if (isGlobal) {
      setGlobalV(APPEARANCE_DEFAULTS);
      return;
    }
    setOverrides((s) => ({ ...s, [profile]: {} }));
  }

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `logo-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("project-media")
        .upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) throw error;
      const { data: signed, error: signErr } = await supabase.storage
        .from("project-media")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signErr || !signed) throw signErr ?? new Error("Signed URL failed");
      set("logo_image_url", signed.signedUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload échoué");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function save() {
    setSaving(true);
    const key = isGlobal ? APPEARANCE_GLOBAL_KEY : pageKey(profile);
    const value = isGlobal ? globalV : override;
    const { error } = await supabase
      .from("settings")
      .upsert({ key, value: value as never }, { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["settings", "appearance"] });
    toast.success(
      isGlobal ? "Apparence globale enregistrée" : "Réglages de la page enregistrés",
    );
  }

  function Field({
    fieldKey,
    label,
    hint,
    children,
  }: {
    fieldKey: keyof AppearanceSettings;
    label: string;
    hint?: string;
    children: React.ReactNode;
  }) {
    const overridden = isOverridden(fieldKey);
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="nav-caps flex items-center gap-2 text-[11px]">
            {label}
            {overridden ? (
              <span
                className="inline-block h-[6px] w-[6px] rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
              />
            ) : null}
          </Label>
          {!isGlobal ? (
            overridden ? (
              <button
                type="button"
                onClick={() => clearField(fieldKey)}
                className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted-foreground)] hover:text-[color:var(--accent)]"
              >
                Hériter
              </button>
            ) : (
              <span className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted-foreground)]">
                Hérité
              </span>
            )
          ) : null}
        </div>
        {children}
        {hint ? (
          <p className="text-[11px] text-[color:var(--muted-foreground)]">{hint}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav />
      <main className="mx-auto w-full max-w-[1100px] px-6 py-10 md:px-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px]" style={{ fontWeight: 300 }}>
            Apparence
          </h1>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="nav-caps text-[11px]"
              onClick={resetProfile}
            >
              {isGlobal ? "Réinitialiser" : "Réinitialiser cette page"}
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="nav-caps text-[11px]"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-y border-[var(--line)] py-4">
          {([{ id: "global", label: "Global" }, ...APPEARANCE_PAGES] as Array<{
            id: Profile;
            label: string;
          }>).map((p) => {
            const active = profile === p.id;
            const count =
              p.id === "global"
                ? 0
                : Object.keys(overrides[p.id as AppearancePageId] ?? {}).length;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setProfile(p.id)}
                className="nav-caps px-3 py-1 text-[11px]"
                style={{
                  border: "1px solid var(--line)",
                  backgroundColor: active ? "var(--foreground)" : "transparent",
                  color: active ? "var(--background)" : "var(--foreground)",
                }}
              >
                {p.label}
                {count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>

        <p className="py-4 text-[12px] text-[color:var(--muted-foreground)]">
          {isGlobal
            ? "Ces réglages s'appliquent à tout le site. Chaque page peut ensuite les surcharger."
            : `${overrideCount} réglage${overrideCount > 1 ? "s" : ""} spécifique${
                overrideCount > 1 ? "s" : ""
              } à cette page. Les autres champs suivent le réglage global.`}
        </p>

        <section className="border-t border-[var(--line)] py-8">
          <h2 className="nav-caps mb-6">Typographie</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Field fieldKey="font_heading" label="Police des titres">
              <select
                value={v.font_heading}
                onChange={(e) => set("font_heading", e.target.value)}
                className="h-10 w-full border border-[var(--line)] bg-background px-3 text-sm"
              >
                {GOOGLE_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
            <Field fieldKey="font_body" label="Police du corps">
              <select
                value={v.font_body}
                onChange={(e) => set("font_body", e.target.value)}
                className="h-10 w-full border border-[var(--line)] bg-background px-3 text-sm"
              >
                {GOOGLE_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              fieldKey="nav_tracking"
              label="Letter-spacing nav (em)"
              hint="0.15 par défaut"
            >
              <Input
                type="number"
                step="0.01"
                value={v.nav_tracking}
                onChange={(e) => set("nav_tracking", Number(e.target.value))}
              />
            </Field>
          </div>
        </section>

        <section className="border-t border-[var(--line)] py-8">
          <h2 className="nav-caps mb-6">Couleurs</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {colorFields.map(([key, label]) => (
              <Field key={key} fieldKey={key} label={label}>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={String(v[key])}
                    onChange={(e) =>
                      set(key, e.target.value as AppearanceSettings[typeof key])
                    }
                    className="h-10 w-12 border border-[var(--line)] bg-background"
                  />
                  <Input
                    value={String(v[key])}
                    onChange={(e) =>
                      set(key, e.target.value as AppearanceSettings[typeof key])
                    }
                  />
                </div>
              </Field>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--line)] py-8">
          <h2 className="nav-caps mb-6">Logo</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Field
              fieldKey="logo_image_url"
              label="Logo image"
              hint="Laisse vide pour afficher le nom en texte."
            >
              <div className="flex items-center gap-4">
                {v.logo_image_url ? (
                  <img
                    src={v.logo_image_url}
                    alt="Logo"
                    className="h-10 w-auto object-contain"
                  />
                ) : null}
                <input type="file" accept="image/*" onChange={onLogo} />
                {uploading ? <span className="text-xs">Upload…</span> : null}
              </div>
            </Field>
            {v.logo_image_url ? (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  className="nav-caps text-[11px]"
                  onClick={() => set("logo_image_url", null)}
                >
                  Retirer le logo
                </Button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="border-t border-[var(--line)] py-8">
          <h2 className="nav-caps mb-6">Mise en page</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {numberFields.map(([key, label, hint]) => (
              <Field key={key} fieldKey={key} label={label} hint={hint}>
                <Input
                  type="number"
                  value={Number(v[key])}
                  onChange={(e) =>
                    set(key, Number(e.target.value) as AppearanceSettings[typeof key])
                  }
                />
              </Field>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import { siteSettingsQuery, SITE_DEFAULTS } from "@/lib/queries";
import type { SiteSettings } from "@/lib/content-defaults";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  staticData: { sitemap: false },
  component: AdminSettings,
  head: () => ({
    meta: [{ title: "Settings | Admin" }, { name: "robots", content: "noindex" }],
  }),
});

const fields: { key: keyof SiteSettings; label: string; hint?: string }[] = [
  { key: "name", label: "Nom affiché" },
  { key: "email", label: "Email de contact", hint: "hello@cliclac.studio" },
  { key: "phone", label: "Téléphone", hint: "06 50 71 44 25" },
  { key: "instagram", label: "Instagram", hint: "https://www.instagram.com/cliclac.studio" },
  { key: "location", label: "Localisation" },
];

function AdminSettings() {
  const { data } = useQuery(siteSettingsQuery());
  const qc = useQueryClient();
  const [form, setForm] = useState<SiteSettings>(SITE_DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  async function save() {
    setSaving(true);
    try {
      const value: SiteSettings = {
        name: form.name.trim() || SITE_DEFAULTS.name,
        email: form.email.trim() || SITE_DEFAULTS.email,
        phone: form.phone.trim() || SITE_DEFAULTS.phone,
        instagram: form.instagram.trim() || SITE_DEFAULTS.instagram,
        location: form.location.trim() || SITE_DEFAULTS.location,
      };
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "site", value });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["settings", "site"] });
      toast.success("Enregistré");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav />
      <main className="mx-auto w-full max-w-[700px] px-6 py-10 md:px-12">
        <h1 className="mb-8 text-[28px]" style={{ fontWeight: 800 }}>
          Réglages du site
        </h1>
        <div className="space-y-6">
          {fields.map((f) => (
            <div key={f.key}>
              <Label className="nav-caps text-[11px]">{f.label}</Label>
              <Input
                value={form[f.key]}
                placeholder={f.hint}
                onChange={(e) =>
                  setForm((s) => ({ ...s, [f.key]: e.target.value }))
                }
                className="mt-2"
              />
            </div>
          ))}
          <div className="flex gap-4 border-t border-[var(--line)] pt-6">
            <Button onClick={save} disabled={saving}>
              {saving ? "…" : "Save"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

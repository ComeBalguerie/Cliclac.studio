import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import { homeQuery } from "@/lib/queries";
import type { Pillar } from "@/lib/content-defaults";
import { supabase } from "@/integrations/supabase/client";
import { ListEditor, withIds, stripIds, type WithId } from "@/components/admin/list-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionToggle } from "@/components/admin/section-toggle";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/home")({
  staticData: { sitemap: false },
  component: AdminHome,
  head: () => ({
    meta: [{ title: "Home | Admin" }, { name: "robots", content: "noindex" }],
  }),
});

type PillarRow = Pillar & WithId;

function AdminHome() {
  const { data } = useQuery(homeQuery());
  const qc = useQueryClient();
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [heroSubtext, setHeroSubtext] = useState("");
  const [projectsTitle, setProjectsTitle] = useState("");
  const [projectsSubtitle, setProjectsSubtitle] = useState("");

  const [ctaPrimary, setCtaPrimary] = useState("");
  const [ctaSecondary, setCtaSecondary] = useState("");
  const [services, setServices] = useState("");
  const [stats, setStats] = useState("");
  const [pillars, setPillars] = useState<PillarRow[]>([]);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const setVisible = (key: string) => (visible: boolean) =>
    setHidden((h) => ({ ...h, [key]: !visible }));

  useEffect(() => {
    if (!data) return;
    setHeadline(data.headline);
    setSubheadline(data.subheadline);
    setHeroSubtext(data.hero_subtext);
    setProjectsTitle(data.projects_title);
    setProjectsSubtitle(data.projects_subtitle);

    setCtaPrimary(data.cta_primary_label);
    setCtaSecondary(data.cta_secondary_label);
    setServices(data.services.join("\n"));
    setStats(data.stats.join("\n"));
    setPillars(withIds(data.pillars));
    setHidden(data.hidden ?? {});
  }, [data]);

  const lines = (v: string) =>
    v.split("\n").map((s) => s.trim()).filter(Boolean);

  async function save() {
    setSaving(true);
    try {
      const serviceList = lines(services);
      const statList = lines(stats);
      const pillarList = stripIds(pillars).filter((p) => p.title.trim());
      const { error } = await supabase.from("settings").upsert({
        key: "home",
        value: {
          headline: headline.trim(),
          subheadline: subheadline.trim(),
          hero_subtext: heroSubtext.trim(),
          projects_title: projectsTitle.trim(),
          projects_subtitle: projectsSubtitle.trim(),
          cta_primary_label: ctaPrimary.trim(),
          cta_secondary_label: ctaSecondary.trim(),
          services: serviceList,
          stats: statList,
          pillars: pillarList,
          hidden,
        },
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["settings", "home"] });
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
      <main className="mx-auto w-full max-w-[900px] px-6 py-10 md:px-12">
        <h1 className="mb-8 text-[28px]" style={{ fontWeight: 300 }}>
          Home page
        </h1>
        <div className="space-y-8">
          <div className="space-y-2">
            <Label className="nav-caps text-[11px]">Sections affichées</Label>
            <SectionToggle label="Bloc d'accroche" visible={!hidden.hero} onChange={setVisible("hero")} />
            <SectionToggle label="Liste des services" visible={!hidden.services} onChange={setVisible("services")} />
            <SectionToggle label="Piliers" visible={!hidden.pillars} onChange={setVisible("pillars")} />
            <SectionToggle label="Chiffres clés" visible={!hidden.stats} onChange={setVisible("stats")} />
            <SectionToggle label="Titre section projets" visible={!hidden.projects} onChange={setVisible("projects")} />
          </div>
          <div>
            <Label className="nav-caps text-[11px]">Accroche (titre H1)</Label>
            <Textarea
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="nav-caps text-[11px]">
              Sous-titre (une ligne par retour à la ligne)
            </Label>
            <Textarea
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="nav-caps text-[11px]">
              Preuve sous le sous-titre
            </Label>
            <Input
              value={heroSubtext}
              onChange={(e) => setHeroSubtext(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="nav-caps text-[11px]">Titre section projets</Label>
              <Input
                value={projectsTitle}
                onChange={(e) => setProjectsTitle(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="nav-caps text-[11px]">
                Sous-titre section projets
              </Label>
              <Input
                value={projectsSubtitle}
                onChange={(e) => setProjectsSubtitle(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="nav-caps text-[11px]">Bouton principal</Label>
              <Input
                value={ctaPrimary}
                onChange={(e) => setCtaPrimary(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="nav-caps text-[11px]">Bouton secondaire</Label>
              <Input
                value={ctaSecondary}
                onChange={(e) => setCtaSecondary(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label className="nav-caps text-[11px]">Services (un par ligne)</Label>
            <Textarea
              value={services}
              onChange={(e) => setServices(e.target.value)}
              rows={6}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="nav-caps text-[11px]">Piliers</Label>
            <div className="mt-3">
              <ListEditor<PillarRow>
                items={pillars}
                onChange={setPillars}
                create={() => ({ _id: crypto.randomUUID(), title: "", body: "" })}
                addLabel="+ Ajouter un pilier"
              >
                {(item, update) => (
                  <div className="space-y-3">
                    <Input
                      value={item.title}
                      placeholder="Titre"
                      onChange={(e) => update({ title: e.target.value } as Partial<PillarRow>)}
                    />
                    <Textarea
                      value={item.body}
                      placeholder="Texte"
                      rows={3}
                      onChange={(e) => update({ body: e.target.value } as Partial<PillarRow>)}
                    />
                  </div>
                )}
              </ListEditor>
            </div>
          </div>
          <div>
            <Label className="nav-caps text-[11px]">
              Chiffres clés / preuves (un par ligne)
            </Label>
            <Textarea
              value={stats}
              onChange={(e) => setStats(e.target.value)}
              rows={5}
              className="mt-2"
            />
          </div>
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

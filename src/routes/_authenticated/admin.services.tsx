import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import { servicesQuery } from "@/lib/queries";
import type { ServicePackage } from "@/lib/content-defaults";
import { supabase } from "@/integrations/supabase/client";
import { ListEditor, withIds, stripIds, type WithId } from "@/components/admin/list-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionToggle } from "@/components/admin/section-toggle";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/services")({
  staticData: { sitemap: false },
  component: AdminServices,
  head: () => ({
    meta: [{ title: "Services | Admin" }, { name: "robots", content: "noindex" }],
  }),
});

type PackageRow = ServicePackage & WithId;

function AdminServices() {
  const { data } = useQuery(servicesQuery());
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [includedTitle, setIncludedTitle] = useState("");
  const [included, setIncluded] = useState("");
  const [stepsTitle, setStepsTitle] = useState("");
  const [steps, setSteps] = useState("");
  const [footerNote, setFooterNote] = useState("");
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const setVisible = (key: string) => (visible: boolean) =>
    setHidden((h) => ({ ...h, [key]: !visible }));

  useEffect(() => {
    if (!data) return;
    setTitle(data.title);
    setIntro(data.intro);
    setCtaLabel(data.cta_label);
    setPackages(withIds(data.packages));
    setIncludedTitle(data.included_title);
    setIncluded(data.included.join("\n"));
    setStepsTitle(data.steps_title);
    setSteps(data.steps.join("\n"));
    setFooterNote(data.footer_note);
    setHidden(data.hidden ?? {});
  }, [data]);

  const lines = (v: string) =>
    v.split("\n").map((s) => s.trim()).filter(Boolean);

  async function save() {
    setSaving(true);
    try {
      const pkgs = stripIds(packages)
        .filter((p) => p.title.trim() || p.label.trim())
        .map((p) => ({
          ...p,
          items: Array.isArray(p.items) ? p.items.filter(Boolean) : [],
        }));
      const includedList = lines(included);
      const stepList = lines(steps);
      const { error } = await supabase.from("settings").upsert({
        key: "services",
        value: {
          title: title.trim(),
          intro: intro.trim(),
          cta_label: ctaLabel.trim(),
          packages: pkgs,
          included_title: includedTitle.trim(),
          included: includedList,
          steps_title: stepsTitle.trim(),
          steps: stepList,
          footer_note: footerNote.trim(),
          hidden,
        },
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["settings", "services"] });
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
          Services & tarifs
        </h1>
        <div className="space-y-8">
          <div className="space-y-2">
            <Label className="nav-caps text-[11px]">Sections affichées</Label>
            <SectionToggle label="Titre & intro" visible={!hidden.hero} onChange={setVisible("hero")} />
            <SectionToggle label="Offres" visible={!hidden.packages} onChange={setVisible("packages")} />
            <SectionToggle label="Ce qui est inclus" visible={!hidden.included} onChange={setVisible("included")} />
            <SectionToggle label="Comment ça marche" visible={!hidden.steps} onChange={setVisible("steps")} />
            <SectionToggle label="Note de fin" visible={!hidden.footer} onChange={setVisible("footer")} />
          </div>
          <div>
            <Label className="nav-caps text-[11px]">Titre de page</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="nav-caps text-[11px]">Intro</Label>
            <Textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="nav-caps text-[11px]">Bouton haut de page</Label>
            <Input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="nav-caps text-[11px]">Offres</Label>
            <div className="mt-3">
              <ListEditor<PackageRow>
                items={packages}
                onChange={setPackages}
                create={() => ({
                  _id: crypto.randomUUID(),
                  label: "",
                  title: "",
                  pitch: "",
                  why: "",
                  items: [],
                  budget: "",
                  timeline: "",
                  cta_label: "En parler",
                })}
                addLabel="+ Ajouter une offre"
              >
                {(item, update) => (
                  <div className="space-y-3">
                    <Input
                      value={item.label}
                      placeholder="Label (ex : Option 1 | Full branding)"
                      onChange={(e) =>
                        update({ label: e.target.value } as Partial<PackageRow>)
                      }
                    />
                    <Input
                      value={item.title}
                      placeholder="Titre"
                      onChange={(e) =>
                        update({ title: e.target.value } as Partial<PackageRow>)
                      }
                    />
                    <Input
                      value={item.pitch}
                      placeholder="Pitch"
                      onChange={(e) =>
                        update({ pitch: e.target.value } as Partial<PackageRow>)
                      }
                    />
                    <Textarea
                      value={item.why}
                      placeholder="Pourquoi ce prix"
                      rows={3}
                      onChange={(e) =>
                        update({ why: e.target.value } as Partial<PackageRow>)
                      }
                    />

                    <Textarea
                      value={item.items.join("\n")}
                      placeholder="Inclus (un par ligne)"
                      rows={5}
                      onChange={(e) =>
                        update({
                          items: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        } as Partial<PackageRow>)
                      }
                    />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <Input
                        value={item.budget}
                        placeholder="Budget"
                        onChange={(e) =>
                          update({ budget: e.target.value } as Partial<PackageRow>)
                        }
                      />
                      <Input
                        value={item.timeline}
                        placeholder="Délai"
                        onChange={(e) =>
                          update({ timeline: e.target.value } as Partial<PackageRow>)
                        }
                      />
                      <Input
                        value={item.cta_label}
                        placeholder="Libellé bouton"
                        onChange={(e) =>
                          update({ cta_label: e.target.value } as Partial<PackageRow>)
                        }
                      />
                    </div>
                  </div>
                )}
              </ListEditor>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="nav-caps text-[11px]">Titre « inclus »</Label>
              <Input
                value={includedTitle}
                onChange={(e) => setIncludedTitle(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="nav-caps text-[11px]">
                Inclus dans chaque projet (un par ligne)
              </Label>
              <Textarea
                value={included}
                onChange={(e) => setIncluded(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="nav-caps text-[11px]">Titre « process »</Label>
              <Input
                value={stepsTitle}
                onChange={(e) => setStepsTitle(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="nav-caps text-[11px]">
                Étapes (une par ligne)
              </Label>
              <Textarea
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="nav-caps text-[11px]">Note de bas de page</Label>
              <Input
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                className="mt-2"
              />
            </div>
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

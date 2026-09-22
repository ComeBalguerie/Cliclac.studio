import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import { aboutQuery } from "@/lib/queries";
import type { ProcessStep, ClientType } from "@/lib/content-defaults";
import { supabase } from "@/integrations/supabase/client";
import { ListEditor, withIds, stripIds, type WithId } from "@/components/admin/list-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionToggle } from "@/components/admin/section-toggle";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/about")({
  staticData: { sitemap: false },
  component: AdminAbout,
  head: () => ({
    meta: [{ title: "About | Admin" }, { name: "robots", content: "noindex" }],
  }),
});

type StepRow = ProcessStep & WithId;
type ClientRow = ClientType & WithId;

function AdminAbout() {
  const { data } = useQuery(aboutQuery());
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [credentials, setCredentials] = useState("");
  const [paragraphs, setParagraphs] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [processTitle, setProcessTitle] = useState("");
  const [processIntro, setProcessIntro] = useState("");
  const [processNote, setProcessNote] = useState("");
  const [process, setProcess] = useState<StepRow[]>([]);
  const [clientsTitle, setClientsTitle] = useState("");
  const [clientsIntro, setClientsIntro] = useState("");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const setVisible = (key: string) => (visible: boolean) =>
    setHidden((h) => ({ ...h, [key]: !visible }));

  useEffect(() => {
    if (!data) return;
    setTitle(data.title);
    setCredentials(data.credentials.join("\n"));
    setParagraphs(data.paragraphs.join("\n\n"));
    setImageUrl(data.image_url);
    setProcessTitle(data.process_title);
    setProcessIntro(data.process_intro);
    setProcessNote(data.process_note);
    setProcess(withIds(data.process));
    setClientsTitle(data.clients_title);
    setClientsIntro(data.clients_intro);
    setClients(withIds(data.clients));
    setHidden(data.hidden ?? {});
  }, [data]);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `about-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("project-media")
        .upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) throw error;
      const { data: signed, error: signErr } = await supabase.storage
        .from("project-media")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signErr || !signed) throw signErr ?? new Error("Signed URL failed");
      setImageUrl(signed.signedUrl);
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
      const paras = paragraphs
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      const credentialList = credentials
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const steps = stripIds(process).filter((p) => p.label.trim());
      const clientList = stripIds(clients).filter((c) => c.title.trim());
      const { error } = await supabase.from("settings").upsert({
        key: "about",
        value: {
          title: title.trim(),
          credentials: credentialList,
          paragraphs: paras,
          image_url: imageUrl,
          process_title: processTitle.trim(),
          process_intro: processIntro.trim(),
          process: steps,
          process_note: processNote.trim(),
          clients_title: clientsTitle.trim(),
          clients_intro: clientsIntro.trim(),
          clients: clientList,
          hidden,
        },
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["settings", "about"] });
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
          About page
        </h1>
        <div className="space-y-8">
          <div className="space-y-2">
            <Label className="nav-caps text-[11px]">Sections affichées</Label>
            <SectionToggle label="Présentation & image" visible={!hidden.intro} onChange={setVisible("intro")} />
            <SectionToggle label="Process" visible={!hidden.process} onChange={setVisible("process")} />
            <SectionToggle label="Avec qui je travaille" visible={!hidden.clients} onChange={setVisible("clients")} />
          </div>
          <div>
            <Label className="nav-caps text-[11px]">Titre</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="nav-caps text-[11px]">
              Crédibilité (une ligne par credential)
            </Label>
            <Textarea
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="nav-caps text-[11px]">
              Récit (un paragraphe par bloc, séparés par une ligne vide)
            </Label>
            <Textarea
              value={paragraphs}
              onChange={(e) => setParagraphs(e.target.value)}
              rows={12}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="nav-caps text-[11px]">Image</Label>
            <input
              type="file"
              accept="image/*"
              onChange={upload}
              className="mt-2 block text-sm font-light"
            />
            {imageUrl && <img src={imageUrl} alt="" className="mt-4 max-h-64" />}
          </div>

          <div className="space-y-4 border-t border-[var(--line)] pt-6">
            <div>
              <Label className="nav-caps text-[11px]">Titre process</Label>
              <Input
                value={processTitle}
                onChange={(e) => setProcessTitle(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="nav-caps text-[11px]">Intro process</Label>
              <Textarea
                value={processIntro}
                onChange={(e) => setProcessIntro(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="nav-caps text-[11px]">Répartition</Label>
              <div className="mt-3">
                <ListEditor<StepRow>
                  items={process}
                  onChange={setProcess}
                  create={() => ({
                    _id: crypto.randomUUID(),
                    pct: "",
                    label: "",
                    note: "",
                  })}
                  addLabel="+ Ajouter une étape"
                >
                  {(item, update) => (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr]">
                        <Input
                          value={item.pct}
                          placeholder="40%"
                          onChange={(e) =>
                            update({ pct: e.target.value } as Partial<StepRow>)
                          }
                        />
                        <Input
                          value={item.label}
                          placeholder="Stratégie & audit"
                          onChange={(e) =>
                            update({ label: e.target.value } as Partial<StepRow>)
                          }
                        />
                      </div>
                      <Input
                        value={item.note}
                        placeholder="Note courte (ex : On ne pixellise pas sans comprendre.)"
                        onChange={(e) =>
                          update({ note: e.target.value } as Partial<StepRow>)
                        }
                      />
                    </div>
                  )}
                </ListEditor>
              </div>
            </div>
            <div>
              <Label className="nav-caps text-[11px]">Note après le process</Label>
              <Textarea
                value={processNote}
                onChange={(e) => setProcessNote(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-[var(--line)] pt-6">
            <div>
              <Label className="nav-caps text-[11px]">Titre « avec qui »</Label>
              <Input
                value={clientsTitle}
                onChange={(e) => setClientsTitle(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="nav-caps text-[11px]">Intro « avec qui »</Label>
              <Input
                value={clientsIntro}
                onChange={(e) => setClientsIntro(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="nav-caps text-[11px]">Clients idéaux</Label>
              <div className="mt-3">
                <ListEditor<ClientRow>
                  items={clients}
                  onChange={setClients}
                  create={() => ({
                    _id: crypto.randomUUID(),
                    title: "",
                    body: "",
                  })}
                  addLabel="+ Ajouter un profil"
                >
                  {(item, update) => (
                    <div className="space-y-3">
                      <Input
                        value={item.title}
                        placeholder="Entrepreneurs haut de gamme"
                        onChange={(e) =>
                          update({ title: e.target.value } as Partial<ClientRow>)
                        }
                      />
                      <Textarea
                        value={item.body}
                        rows={3}
                        placeholder="Description"
                        onChange={(e) =>
                          update({ body: e.target.value } as Partial<ClientRow>)
                        }
                      />
                    </div>
                  )}
                </ListEditor>
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-t border-[var(--line)] pt-6">
            <Button onClick={save} disabled={saving || uploading}>
              {saving ? "…" : "Save"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

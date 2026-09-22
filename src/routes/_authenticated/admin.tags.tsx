import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import { allTagsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { slugify } from "@/lib/slug";

export const Route = createFileRoute("/_authenticated/admin/tags")({
  staticData: { sitemap: false },
  component: AdminTags,
  head: () => ({ meta: [{ title: "Tags | Admin" }, { name: "robots", content: "noindex" }] }),
});

function AdminTags() {
  const { data: tags = [] } = useQuery(allTagsQuery());
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Record<string, string>>({});

  async function rename(id: string, name: string) {
    const { error } = await supabase
      .from("tags")
      .update({ name, slug: slugify(name) })
      .eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["tags"] });
    setEditing((s) => {
      const c = { ...s };
      delete c[id];
      return c;
    });
    toast.success("Tag renommé");
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce tag ?")) return;
    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["tags"] });
    toast.success("Tag supprimé");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav />
      <main className="mx-auto w-full max-w-[700px] px-6 py-10 md:px-12">
        <h1 className="mb-8 text-[28px]" style={{ fontWeight: 300 }}>Tags</h1>
        {tags.length === 0 ? (
          <p className="text-sm font-light text-[color:var(--muted-foreground)]">
            Aucun tag. Les tags se créent depuis un projet.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {tags.map((t) => {
              const isEditing = editing[t.id] !== undefined;
              return (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  {isEditing ? (
                    <Input
                      value={editing[t.id]}
                      onChange={(e) =>
                        setEditing((s) => ({ ...s, [t.id]: e.target.value }))
                      }
                      className="flex-1"
                    />
                  ) : (
                    <div className="flex-1">
                      <div className="text-[15px] font-light">{t.name}</div>
                      <div className="text-[11px] text-[color:var(--muted-foreground)]">
                        {t.slug}
                      </div>
                    </div>
                  )}
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={() => rename(t.id, editing[t.id])}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setEditing((s) => {
                            const c = { ...s };
                            delete c[t.id];
                            return c;
                          })
                        }
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        className="nav-caps hover-red text-[11px]"
                        onClick={() =>
                          setEditing((s) => ({ ...s, [t.id]: t.name }))
                        }
                      >
                        Rename
                      </button>
                      <button
                        className="nav-caps hover-red text-[11px]"
                        onClick={() => remove(t.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
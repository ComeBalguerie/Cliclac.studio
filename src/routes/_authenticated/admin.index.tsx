import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { allProjectsQuery, type ProjectRow } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/admin-nav";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/")({
  staticData: { sitemap: false },
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin | Cliclac studio" }, { name: "robots", content: "noindex" }] }),
});

function SortableProjectRow({
  p,
  onDelete,
}: {
  p: ProjectRow;
  onDelete: (p: ProjectRow) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: p.id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        background: isDragging ? "var(--tag-bg)" : undefined,
      }}
      className="flex flex-wrap items-center gap-4 py-4"
    >
      <button
        type="button"
        aria-label="Réordonner"
        className="cursor-grab select-none px-1 text-[color:var(--muted-foreground)] active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <div className="min-w-0 flex-1">
        <div className="text-[18px]" style={{ fontWeight: 300 }}>
          {p.title}
        </div>
        <div className="text-[12px] text-[color:var(--muted-foreground)]">
          Order {p.display_order} · {p.status}
        </div>
      </div>
      <span
        className="nav-caps text-[11px]"
        style={{ color: p.status === "published" ? "var(--foreground)" : "#999" }}
      >
        {p.status}
      </span>
      <Link
        to="/admin/projects/$id"
        params={{ id: p.id }}
        className="nav-caps hover-red text-[11px]"
      >
        Edit
      </Link>
      <Button
        variant="ghost"
        size="sm"
        className="nav-caps hover-red text-[11px]"
        onClick={() => onDelete(p)}
      >
        Delete
      </Button>
    </li>
  );
}

function AdminDashboard() {
  const { data: projects = [], isLoading } = useQuery(allProjectsQuery());
  const qc = useQueryClient();
  const [items, setItems] = useState<ProjectRow[]>([]);

  useEffect(() => {
    setItems(projects);
  }, [projects]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projet supprimé");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const reorder = useMutation({
    mutationFn: async (ordered: ProjectRow[]) => {
      await Promise.all(
        ordered.map((p, i) =>
          supabase.from("projects").update({ display_order: i }).eq("id", p.id),
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Ordre enregistré");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((p) => p.id === active.id);
    const newIndex = items.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex).map((p, i) => ({
      ...p,
      display_order: i,
    }));
    setItems(next);
    reorder.mutate(next);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav />
      <main className="mx-auto w-full max-w-[var(--container-width,1440px)] px-6 py-10 md:px-12">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-[28px]" style={{ fontWeight: 300 }}>Projects</h1>
          <Link
            to="/admin/projects/new"
            className="nav-caps hover-red border border-foreground px-4 py-2"
          >
            + New project
          </Link>
        </div>
        <p className="mb-8 text-[12px] text-[color:var(--muted-foreground)]">
          Glisse les projets par la poignée ⠿ pour changer leur ordre d'affichage.
        </p>

        {isLoading ? (
          <p className="text-sm font-light">Chargement…</p>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm font-light text-[color:var(--muted-foreground)]">
            Aucun projet. Créez-en un pour commencer.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={items.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {items.map((p) => (
                  <SortableProjectRow
                    key={p.id}
                    p={p}
                    onDelete={(proj) => {
                      if (confirm(`Supprimer "${proj.title}" ?`)) del.mutate(proj.id);
                    }}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </main>
    </div>
  );
}

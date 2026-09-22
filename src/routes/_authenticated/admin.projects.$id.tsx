import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminNav } from "@/components/admin-nav";
import { ProjectForm } from "@/components/project-form";
import { projectDetailQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/projects/$id")({
  staticData: { sitemap: false },
  component: EditProject,
  head: () => ({ meta: [{ title: "Edit project | Admin" }, { name: "robots", content: "noindex" }] }),
});

function EditProject() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery(projectDetailQuery(id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav />
      <main className="mx-auto w-full max-w-[900px] px-6 py-10 md:px-12">
        <h1 className="mb-8 text-[28px]" style={{ fontWeight: 300 }}>
          Edit project
        </h1>
        {isLoading || !data ? (
          <p className="text-sm font-light">Chargement…</p>
        ) : !data.project ? (
          <p className="text-sm font-light">Projet introuvable.</p>
        ) : (
          <ProjectForm
            project={data.project}
            initialTagIds={data.tag_ids}
            initialGallery={data.gallery}
          />
        )}
      </main>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { AdminNav } from "@/components/admin-nav";
import { ProjectForm } from "@/components/project-form";

export const Route = createFileRoute("/_authenticated/admin/projects/new")({
  staticData: { sitemap: false },
  component: NewProject,
  head: () => ({ meta: [{ title: "New project | Admin" }, { name: "robots", content: "noindex" }] }),
});

function NewProject() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav />
      <main className="mx-auto w-full max-w-[900px] px-6 py-10 md:px-12">
        <h1 className="mb-8 text-[28px]" style={{ fontWeight: 300 }}>
          New project
        </h1>
        <ProjectForm />
      </main>
    </div>
  );
}
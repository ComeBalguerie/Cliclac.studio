import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CtaContact } from "@/components/cta-contact";
import { ProjectNav } from "@/components/project-nav";
import { TagPill } from "@/components/tag-pill";
import { publishedProjectsQuery } from "@/lib/queries";

const withoutEmDash = (text: string) => text.replaceAll(" — ", ", ").replaceAll("—", ",");

export const Route = createFileRoute("/projects/$id")({
  staticData: { sitemap: true },
  loader: async ({ context, params }) => {
    const projects = await context.queryClient.ensureQueryData(
      publishedProjectsQuery(),
    );
    const project = projects.find((p) => p.id === params.id);
    if (!project) throw notFound();
    return { project };
  },
  component: ProjectPage,
  notFoundComponent: () => (
    <div className="page-editorial min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-[var(--container-width,1440px)] px-6 py-32 text-center text-sm font-light md:px-12">
        <p>Projet introuvable.</p>
        <Link to="/" className="nav-caps hover-red mt-6 inline-block text-foreground">
          Retour aux projets
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-[var(--container-width,1440px)] px-6 py-32 text-center text-sm font-light md:px-12">
        Une erreur est survenue.
      </main>
      <SiteFooter />
    </div>
  ),
  head: ({ params, loaderData }) => {
    const title = loaderData?.project.title ?? "Projet";
    const desc = loaderData?.project.short_description ?? "Projet Cliclac studio.";
    const image = loaderData?.project.cover_image_url ?? undefined;
    const url = `https://cliclacstudio.lovable.app/projects/${params.id}`;
    const meta: Array<{ title?: string; name?: string; property?: string; content?: string }> = [
      { title: `${title} | Cliclac studio` },
      { name: "description", content: desc },
      { property: "og:title", content: `${title} | Cliclac studio` },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (image && /^https?:\/\//.test(image)) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
    }
    return { meta, links: [{ rel: "canonical", href: url }] };
  },
});

function ProjectPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: projects } = useSuspenseQuery(publishedProjectsQuery());
  const index = projects.findIndex((p) => p.id === id);
  const project = index >= 0 ? projects[index] : null;
  if (!project) return null;
  const previous = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main
        className="mx-auto w-full max-w-[var(--container-width,1440px)] py-10 md:py-16"
        style={{
          paddingLeft: "var(--page-margin)",
          paddingRight: "var(--page-margin)",
        }}
      >
        <Link to="/" className="nav-caps text-[color:var(--muted-foreground)] hover:opacity-70">
          ← Réalisations
        </Link>
        <h1 className="mt-6 text-[40px] leading-[1.05] tracking-[-0.01em] md:text-[64px]">
          {project.title}
        </h1>
        {project.short_description && (
          <p className="mt-4 max-w-3xl text-[15px] font-light text-foreground/80">
            {withoutEmDash(project.short_description)}
          </p>
        )}
        {project.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <TagPill
                key={t.id}
                onClick={() => navigate({ to: "/", search: { tag: t.slug } })}
              >
                {t.name}
              </TagPill>
            ))}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            {project.cover_image_url && (
              <img
                src={project.cover_image_url}
                 alt={`${project.title}, visuel principal`}
                className="block w-full"
                loading="lazy"
              />
            )}
          </div>
          <div>
            {project.long_description && (
              <div className="whitespace-pre-line text-[15px] font-light leading-relaxed">
                 {withoutEmDash(project.long_description)}
              </div>
            )}
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 text-[13px] font-light">
              <Meta label="Client" value={project.client} />
              <Meta label="Année" value={project.year} />
              <Meta label="Secteur" value={project.sector} />
              <Meta label="Discipline" value={project.discipline} />
            </dl>
          </div>
        </div>

        {(project.case_study_problem ||
          project.case_study_approach ||
          project.case_study_results) && (
           <section className="case-study-stack">
            <CaseStudyBlock label="Le contexte" text={project.case_study_problem} />
            <CaseStudyBlock label="L'approche" text={project.case_study_approach} />
            <CaseStudyBlock label="Les résultats" text={project.case_study_results} />
          </section>
        )}

        {project.gallery.length > 0 && (
          <div className="mt-12 flex flex-col gap-6">
            {project.gallery.map((g, i) => (
              <img
                key={g.id}
                src={g.image_url}
                 alt={`${project.title}, visuel ${i + 2}`}
                className="w-full"
                loading="lazy"
              />
            ))}
          </div>
        )}

        <ProjectNav previous={previous} next={next} />
      </main>
      <CtaContact
        title="Un projet comme celui-ci ?"
         note="Raconte le contexte, l'échéance et l'ambition. On revient vers toi sous 48 h."
      />
      <SiteFooter />
    </div>
  );
}

function CaseStudyBlock({
  label,
  text,
}: {
  label: string;
  text: string | null;
}) {
  if (!text) return null;
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <h2 className="nav-caps md:col-span-4">{label}</h2>
       <p className="whitespace-pre-line text-[16px] font-light leading-relaxed md:col-span-8">
         {withoutEmDash(text)}
      </p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[color:var(--muted-foreground)]">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}

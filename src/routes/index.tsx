import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import { z } from "zod";
import { Reveal } from "@/components/reveal";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CtaContact } from "@/components/cta-contact";
import { TagPill } from "@/components/tag-pill";
import { HomeHero } from "@/components/home-hero";
import { HeroBanner } from "@/components/hero-banner";
import { Marquee } from "@/components/marquee";
import { ActionLink } from "@/components/action-link";
import { ProjectMosaic } from "@/components/project-mosaic";
import { useSiteSettings } from "@/hooks/use-site-settings";
import {
  publishedProjectsQuery,
  allTagsQuery,
  heroQuery,
  homeQuery,
} from "@/lib/queries";
import { ILLUSTRATIONS } from "@/lib/illustrations";

const searchSchema = z.object({ tag: z.string().optional() });

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  validateSearch: (s) => searchSchema.parse(s),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(publishedProjectsQuery()),
      context.queryClient.ensureQueryData(allTagsQuery()),
      context.queryClient.ensureQueryData(heroQuery()),
      context.queryClient.ensureQueryData(homeQuery()),
    ]);
  },
  component: WorkPage,
  head: () => ({
    meta: [
      { title: "Cliclac studio | Créateur d'identités visuelles singulières" },
      {
        name: "description",
        content:
          "Cliclac studio : branding illustré et illustration à Nice. Des identités qui racontent des histoires, avec du trait, du punch et beaucoup de caractère.",
      },
      { property: "og:title", content: "Cliclac studio | Créateur d'identités visuelles singulières" },
      {
        property: "og:description",
        content:
          "Branding illustré, illustration et identités visuelles pour les marques qui n'ont pas peur de montrer qui elles sont.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://cliclacstudio.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Cliclac studio | Créateur d'identités visuelles singulières" },
      { name: "twitter:description", content: "Branding illustré, illustration et identités visuelles pour les marques qui n'ont pas peur de montrer qui elles sont." },
    ],
    links: [{ rel: "canonical", href: "https://cliclacstudio.lovable.app/" }],
  }),
});

function WorkPage() {
  const { data: projects } = useSuspenseQuery(publishedProjectsQuery());
  const { data: tags } = useSuspenseQuery(allTagsQuery());
  const { data: home } = useSuspenseQuery(homeQuery());
  const { data: hero } = useSuspenseQuery(heroQuery());
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const activeTag = search.tag ?? null;
  const projectsRef = useRef<HTMLElement>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach((project) =>
      project.tags.forEach((tag) => map.set(tag.slug, (map.get(tag.slug) ?? 0) + 1)),
    );
    return map;
  }, [projects]);

  const visibleTags = tags.filter((tag) => counts.has(tag.slug));
  const filtered = activeTag
    ? projects.filter((project) => project.tags.some((tag) => tag.slug === activeTag))
    : projects;

  const scrollToProjects = () => {
    const el = projectsRef.current;
    if (!el) return;
    const header = document.querySelector("header");
    const offset = header ? header.getBoundingClientRect().height + 16 : 96;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleTagClick = (slug: string | null) => {
    const next = slug && activeTag !== slug ? slug : undefined;
    navigate({ to: ".", search: { tag: next }, resetScroll: false });
    requestAnimationFrame(() => scrollToProjects());
  };

  const heroHasMedia =
    hero && ((hero.type === "carousel" && hero.images.length > 0) || (hero.type === "video" && hero.video_url));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <HomeHero />

      {!home.hidden.services && home.services.length > 0 && (
        <Marquee items={home.services} />
      )}

      {heroHasMedia && (
        <HeroBanner />
      )}

      <main className="mx-auto w-full max-w-[var(--container-width,1440px)] px-[var(--page-margin)]">
        {!home.hidden.pillars && home.pillars.length > 0 && (
          <section className="home-pillars grid grid-cols-1 gap-12 section-pad md:grid-cols-12">
            <div className="md:col-span-4">
              <Reveal direction="up">
                <h2 className="text-[38px] font-extrabold uppercase leading-[1.02] tracking-[-0.02em] md:text-[52px]">
                  Ce qu'on fait
                </h2>
              </Reveal>
            </div>
            <div className="grid grid-cols-1 gap-5 md:col-span-8 md:grid-cols-3">
              {home.pillars.map((pillar, index) => (
                <Reveal key={pillar.title} direction="up" delay={index * 0.12}>
                  <div className={`expertise-cartouche expertise-cartouche-${(index % 3) + 1}`}>
                    <img src={ILLUSTRATIONS.sparkle1} alt="" aria-hidden="true" className="sparkle sparkle-float mb-4 w-6" />
                    <h3 className="text-[24px] font-extrabold leading-[1.05]">{pillar.title}</h3>
                    <p className="mt-4 text-[16px] leading-[1.6]">{pillar.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <Reveal>
          <section ref={projectsRef} id="projets" className="flex flex-wrap items-end justify-between gap-5 pt-8 pb-8">
            {!home.hidden.projects && (
              <>
                <div>
                  {home.projects_title && (
                    <h2 className="text-[44px] font-extrabold uppercase leading-[1.02] tracking-[-0.02em] md:text-[72px]">
                      {home.projects_title}
                    </h2>
                  )}
                  {home.projects_subtitle && (
                    <p className="mt-3 text-[16px] text-[color:var(--muted-foreground)]">{home.projects_subtitle}</p>
                  )}
                </div>
                <ActionLink to="/about">Le studio</ActionLink>
              </>
            )}
          </section>
        </Reveal>

        {visibleTags.length > 0 && (
          <Reveal>
            <div className="filter-band flex flex-wrap gap-2 py-6">
              <button
                type="button"
                onClick={() => handleTagClick(null)}
                className="tag-pill inline-flex items-center rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all"
                style={activeTag
                  ? { backgroundColor: "var(--tag-bg)", color: "var(--background)" }
                  : { backgroundColor: "var(--highlight)", color: "var(--foreground)", boxShadow: "inset 0 0 0 2px var(--foreground)" }}
              >
                Tout ({projects.length})
              </button>
              {visibleTags.map((tag) => (
                <TagPill
                  key={tag.id}
                  active={activeTag === tag.slug}
                  onClick={() => handleTagClick(tag.slug)}
                >
                  {tag.name} ({counts.get(tag.slug)})
                </TagPill>
              ))}
            </div>
          </Reveal>
        )}

        {filtered.length === 0 ? (
          projects.length === 0 ? (
            <Reveal>
              <div className="flex flex-col items-center gap-6 py-24 text-center">
                <img src={ILLUSTRATIONS.perso3} alt="" aria-hidden="true" className="hero-illu w-40 md:w-56" />
                <p className="manifesto text-[28px] md:text-[40px]">
                  Les réalisations arrivent, on finit de peaufiner la grille.
                </p>
                <p className="max-w-md text-[16px] text-[color:var(--muted-foreground)]">
                  En attendant, découvre ce qu'on peut dessiner pour toi.
                </p>
                <ActionLink to="/services">Découvrir les services</ActionLink>
              </div>
            </Reveal>
          ) : (
            <div className="py-32 text-center">
              <p className="text-[16px]">Aucun projet pour ce filtre.</p>
              <button type="button" onClick={() => handleTagClick(null)} className="nav-caps mt-6 inline-block cursor-pointer text-foreground underline underline-offset-4">
                Voir tous les projets
              </button>
            </div>
          )
        ) : (
          <section className="projects-editorial-band">
            {filtered.map((project, index) => (
              <Reveal key={project.id} direction="up">
                <ProjectMosaic project={project} index={index} onTagClick={handleTagClick} />
              </Reveal>
            ))}
          </section>
        )}

        {!home.hidden.hero && (
          <Reveal>
            <section className="manifesto-band py-20 md:py-28">
              <p className="manifesto">
                Une marque avec du caractère, c'est pas une option, c'est le point de départ.
              </p>
              <img src={ILLUSTRATIONS.sparkle2} alt="" aria-hidden="true" className="sparkle sparkle-float-delayed mx-auto mt-8 w-10" />
            </section>
          </Reveal>
        )}
      </main>
      <CtaContact />
      <SiteFooter />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/reveal";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ActionAnchor } from "@/components/action-link";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ILLUSTRATIONS } from "@/lib/illustrations";

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact | Cliclac studio, hello@cliclac.studio" },
      {
        name: "description",
        content:
          "Un projet de branding illustré ou d'illustration ? Écris à hello@cliclac.studio ou appelle le 06 50 71 44 25. Nice, Côte d'Azur.",
      },
      { property: "og:title", content: "Contact | Cliclac studio" },
      {
        property: "og:description",
         content: "Un projet d'identité illustrée ? Écris-nous, on répond vite.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://cliclacstudio.lovable.app/contact" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact | Cliclac studio" },
      { name: "twitter:description", content: "Un projet d'identité illustrée ? Écris-nous, on répond vite." },
    ],
    links: [{ rel: "canonical", href: "https://cliclacstudio.lovable.app/contact" }],
  }),
});

function ContactPage() {
  const SITE = useSiteSettings();
  const mailto = SITE.mailto;
  return (
    <div className="page-editorial flex min-h-screen flex-col bg-background text-foreground">
      <SiteNav />
      <main
        className="mx-auto w-full max-w-[var(--container-width,1440px)] flex-1 py-16 md:py-24"
        style={{ paddingLeft: "var(--page-margin)", paddingRight: "var(--page-margin)" }}
      >
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <h1 className="text-[42px] font-extrabold uppercase leading-[1.02] tracking-[-0.02em] md:text-[72px]">
              Écrivons-nous.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed">
              Un projet d'identité illustrée, une campagne, un personnage ?
              Raconte, on adore les points de départ un peu fous.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ActionAnchor href={mailto}>Écris-nous</ActionAnchor>
              <ActionAnchor href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`} variant="outline">
                {SITE.phone}
              </ActionAnchor>
            </div>
            <div className="mt-8 flex flex-wrap gap-8">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-caps text-foreground hover:opacity-70"
              >
                 Instagram · @cliclac.studio
              </a>
              <a href={mailto} className="nav-caps text-foreground hover:opacity-70">
                {SITE.email}
              </a>
            </div>
          </div>
          <Reveal direction="right" className="md:col-span-5">
            <img src={ILLUSTRATIONS.perso3} alt="" aria-hidden="true" className="hero-illu mx-auto w-3/4" />
          </Reveal>
        </div>

        <section className="section-color-block mt-16 grid grid-cols-1 gap-12 p-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="nav-caps text-[color:var(--muted-foreground)]">
              Dans ton message
            </p>
            <ul className="mt-4 space-y-2 text-[16px]">
              <li>✳ Le contexte de la marque et son ambition</li>
              <li>✳ Le périmètre envisagé (identité, refresh, illustration…)</li>
              <li>✳ L'échéance et l'ordre d'idée du budget</li>
            </ul>
          </div>
          <div className="md:col-span-6">
            <p className="nav-caps text-[color:var(--muted-foreground)]">
              Basé à
            </p>
            <p className="mt-4 text-[16px]">{SITE.location}</p>
            <p className="mt-8 text-[14px] text-[color:var(--muted-foreground)]">
              Réponse sous 48 h ouvrées, souvent bien plus vite.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

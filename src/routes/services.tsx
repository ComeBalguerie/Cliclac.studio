import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Reveal } from "@/components/reveal";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CtaContact } from "@/components/cta-contact";
import { ActionAnchor } from "@/components/action-link";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { servicesQuery } from "@/lib/queries";

export const Route = createFileRoute("/services")({
  staticData: { sitemap: true },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(servicesQuery());
  },
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Services | Cliclac studio, branding illustré" },
      { name: "description", content: "Identité illustrée complète, refresh illustré ou illustration sur mesure. Trois façons de travailler ensemble, autour du trait et du caractère." },
      { property: "og:title", content: "Services | Cliclac studio" },
      { property: "og:description", content: "Identité illustrée complète, refresh illustré ou illustration sur mesure. Trois façons de travailler ensemble." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://cliclacstudio.lovable.app/services" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Services | Cliclac studio" },
      { name: "twitter:description", content: "Identité illustrée complète, refresh illustré ou illustration sur mesure." },
    ],
    links: [{ rel: "canonical", href: "https://cliclacstudio.lovable.app/services" }],
  }),
});

function ServicesPage() {
  const { data: content } = useSuspenseQuery(servicesQuery());
  const SITE = useSiteSettings();
  const packageId = (label: string) => `package-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="page-editorial min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto w-full max-w-[var(--container-width,1440px)] px-[var(--page-margin)]">
        {!content.hidden.hero && (
          <Reveal direction="up">
            <section className="grid grid-cols-1 gap-8 section-pad md:grid-cols-12">
              <div className="md:col-span-8">
                <p className="nav-caps mb-5 text-[color:var(--muted-foreground)]">Ce qu'on sait faire</p>
                {content.title && <h1 className="text-[42px] font-extrabold uppercase leading-[1.02] tracking-[-0.02em] md:text-[72px]">{content.title}</h1>}
                {content.intro && <p className="mt-7 max-w-2xl text-[19px] leading-[1.6] text-[color:var(--muted-foreground)]">{content.intro}</p>}
              </div>
              {content.cta_label && (
                <div className="flex items-start md:col-span-4 md:justify-end md:pt-10">
                  <ActionAnchor href={SITE.mailto}>{content.cta_label}</ActionAnchor>
                </div>
              )}
            </section>
          </Reveal>
        )}

        {!content.hidden.packages && content.packages.length > 0 && (
          <section className="grid grid-cols-1 gap-6 py-10 md:grid-cols-2 xl:grid-cols-3">
              {content.packages.map((pack, index) => (
                <Reveal key={pack.label} direction="up" delay={index * 0.1}>
                  <article id={packageId(pack.label)} className={`card-surface service-card-${(index % 3) + 1} flex h-full scroll-mt-36 flex-col`}>
                    <p className="nav-caps text-[color:var(--muted-foreground)]">{pack.label}</p>
                    <h2 className="mt-5 text-[30px] font-extrabold leading-[1.05]">{pack.title}</h2>
                    <p className="mt-4 text-[16px] leading-[1.6]">{pack.pitch}</p>
                    {pack.why && <div className="mt-6 border-l-[3px] border-[var(--foreground)] pl-4"><p className="nav-caps text-[11px] text-[color:var(--muted-foreground)]">Pourquoi comme ça</p><p className="mt-2 text-[14px] leading-[1.6] text-[color:var(--muted-foreground)]">{pack.why}</p></div>}
                    <ul className="mt-7 space-y-2 text-[15px] leading-[1.6]">{pack.items.map((item) => <li key={item}>✳ {item}</li>)}</ul>
                    <dl className="mt-9 flex flex-col gap-5 pt-5">
                      {pack.budget && <div className="min-w-0"><dt className="nav-caps text-[11px] text-[color:var(--muted-foreground)]">Budget</dt><dd className="price-red mt-2 whitespace-nowrap text-[26px]">{pack.budget}</dd></div>}
                      {pack.timeline && <div className="min-w-0"><dt className="nav-caps text-[11px] text-[color:var(--muted-foreground)]">Délai</dt><dd className="mt-2 text-[16px] font-semibold">{pack.timeline}</dd></div>}
                    </dl>
                    {pack.cta_label && <div className="mt-9"><ActionAnchor href={SITE.mailto} variant="outline">{pack.cta_label}</ActionAnchor></div>}
                  </article>
                </Reveal>
              ))}
          </section>
        )}

        {!content.hidden.included && (content.included_title || content.included.length > 0) && (
          <Reveal>
            <section className="section-color-block section-pad grid grid-cols-1 gap-8 md:grid-cols-12">
              {content.included_title && <h2 className="accent-rule text-[32px] font-extrabold leading-[1.05] md:col-span-4 md:text-[44px]">{content.included_title}</h2>}
              <ul className="grid grid-cols-1 gap-3 text-[16px] leading-[1.6] sm:grid-cols-2 md:col-span-8">{content.included.map((item, index) => <Reveal key={item} direction="right" delay={index * 0.04}><li>✳ {item}</li></Reveal>)}</ul>
            </section>
          </Reveal>
        )}

        {!content.hidden.steps && (content.steps_title || content.steps.length > 0) && (
          <Reveal>
            <section className="section-color-block section-color-block-blue grid grid-cols-1 gap-8 py-20 md:grid-cols-12">
              {content.steps_title && <h2 className="nav-caps md:col-span-4">{content.steps_title}</h2>}
              <ol className="grid gap-3 md:col-span-8">{content.steps.map((step, index) => <li key={step} className="flex gap-6 rounded-[18px] bg-[var(--surface)] px-5 py-5 text-[16px]"><span className="font-extrabold text-[color:var(--muted-foreground)]">0{index + 1}</span><span>{step}</span></li>)}</ol>
            </section>
          </Reveal>
        )}

        {!content.hidden.footer && content.footer_note && (
          <section className="section-color-block py-16">
            <p className="max-w-2xl text-[18px] font-medium">{content.footer_note} <a href={SITE.mailto} className="underline underline-offset-4">{SITE.email}</a></p>
          </section>
        )}
      </main>
      <CtaContact title="Prêt à dessiner ton projet ?" note="Écris-nous le contexte, les envies et l'échéance. On revient vers toi avec des idées et un devis." />
      <SiteFooter />
    </div>
  );
}

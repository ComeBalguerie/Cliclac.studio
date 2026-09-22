import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CtaContact } from "@/components/cta-contact";
import { aboutQuery } from "@/lib/queries";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ILLUSTRATIONS } from "@/lib/illustrations";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(aboutQuery());
  },
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "Le studio | Cliclac studio, branding illustré à Nice" },
      { name: "description", content: "Cliclac studio : branding illustré et illustration. Des identités pensées comme des mondes, dessinées à Nice." },
      { property: "og:title", content: "Le studio | Cliclac studio" },
      { property: "og:description", content: "Branding illustré, illustration et identités visuelles. Le studio qui dessine les marques." },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: "https://cliclacstudio.lovable.app/about" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Le studio | Cliclac studio" },
      { name: "twitter:description", content: "Branding illustré, illustration et identités visuelles. Le studio qui dessine les marques." },
    ],
    links: [{ rel: "canonical", href: "https://cliclacstudio.lovable.app/about" }],
  }),
});

function AboutPage() {
  const { data } = useSuspenseQuery(aboutQuery());
  const SITE = useSiteSettings();
  const image = data.image_url;

  return (
    <div className="page-editorial min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto w-full max-w-[var(--container-width,1440px)] px-[var(--page-margin)]">
        {!data.hidden.intro && (
          <section className="grid grid-cols-1 gap-10 section-pad md:grid-cols-12 md:gap-12">
            <Reveal direction="left" className="md:col-span-7">
              <p className="nav-caps mb-5 text-[color:var(--muted-foreground)]">Le studio</p>
              {data.title && <h1 className="text-[42px] font-extrabold uppercase leading-[1.02] tracking-[-0.02em] md:text-[72px]">{data.title}</h1>}
              {data.credentials.length > 0 && <ul className="accent-rule mt-9 space-y-3">{data.credentials.map((credential) => <li key={credential} className="text-[16px] font-semibold">{credential}</li>)}</ul>}
              {data.paragraphs.length > 0 && <div className="mt-9 max-w-2xl space-y-6 text-[17px] leading-[1.65]">{data.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}
               <div className="contact-strip mt-12 grid grid-cols-2 gap-4 p-5"><div className="nav-caps">{SITE.name}</div><a href={SITE.mailto} className="nav-caps text-right text-foreground hover:opacity-70">{SITE.email}</a></div>
            </Reveal>
            <Reveal direction="right" className="md:col-span-5 md:pt-20">
              {image ? (
                <img src={image} alt="Cliclac studio" className="w-full" loading="lazy" />
              ) : (
                <img src={ILLUSTRATIONS.perso2} alt="" aria-hidden="true" className="hero-illu mx-auto w-3/4" loading="lazy" />
              )}
            </Reveal>
          </section>
        )}

        {!data.hidden.process && (data.process_title || data.process_intro || data.process.length > 0 || data.process_note) && (
          <Reveal>
            <section className="section-color-block section-pad grid grid-cols-1 gap-8 md:grid-cols-12">
              <div className="md:col-span-4">{data.process_title && <h2 className="accent-rule text-[32px] font-extrabold leading-[1.05] md:text-[44px]">{data.process_title}</h2>}</div>
               <div className="md:col-span-8">{data.process_intro && <p className="max-w-2xl text-[16px] leading-[1.6]">{data.process_intro}</p>}<dl className="mt-10 grid gap-3">{data.process.map((process, index) => { const numeric = Number.parseInt(String(process.pct), 10); return <Reveal key={process.label} direction="right" delay={index * 0.08}><div className="rounded-[18px] bg-[var(--surface)] p-5"><div className="flex items-baseline justify-between gap-6"><div><dt className="text-[17px] font-semibold">{process.label}</dt>{process.note && <p className="mt-1 text-[14px] text-[color:var(--muted-foreground)]">{process.note}</p>}</div><dd className="shrink-0 text-[24px] font-extrabold">{Number.isFinite(numeric) ? <CountUp value={numeric} /> : process.pct}</dd></div>{Number.isFinite(numeric) && <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[color:var(--line)]"><div className="h-full rounded-full bg-[var(--foreground)]" style={{ width: `${Math.max(0, Math.min(100, numeric))}%` }} /></div>}</div></Reveal>; })}</dl>{data.process_note && <p className="mt-9 max-w-2xl text-[16px] leading-[1.6]">{data.process_note}</p>}</div>
            </section>
          </Reveal>
        )}

        {!data.hidden.clients && (data.clients_title || data.clients_intro || data.clients.length > 0) && (
          <Reveal>
            <section className="section-color-block section-color-block-blue section-pad grid grid-cols-1 gap-8 md:grid-cols-12">
              <div className="md:col-span-4"><p className="nav-caps mb-4 text-[color:var(--muted-foreground)]">Terrains de jeu</p>{data.clients_title && <h2 className="text-[32px] font-extrabold leading-[1.05] md:text-[44px]">{data.clients_title}</h2>}{data.clients_intro && <p className="mt-4 text-[16px] text-[color:var(--muted-foreground)]">{data.clients_intro}</p>}</div>
               <ul className="grid grid-cols-1 gap-5 md:col-span-8 md:grid-cols-3">{data.clients.map((client, index) => <Reveal key={client.title} direction="up" delay={index * 0.08}><li className={`card-surface client-card-${(index % 3) + 1} h-full`} style={{ padding: 24 }}><h3 className="text-[18px] font-extrabold">{client.title}</h3><p className="mt-3 text-[14px] leading-[1.6] text-[color:var(--muted-foreground)]">{client.body}</p></li></Reveal>)}</ul>
            </section>
          </Reveal>
        )}
      </main>
      <CtaContact />
      <SiteFooter />
    </div>
  );
}

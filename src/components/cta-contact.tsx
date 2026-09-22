import { ActionAnchor } from "@/components/action-link";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ILLUSTRATIONS } from "@/lib/illustrations";

export function CtaContact({
  title = "Un projet en tête ?",
  note = "Écris-nous quelques lignes : contexte, envies, échéance. On répond vite et on adore les idées neuves.",
}: {
  title?: string;
  note?: string;
}) {
  const SITE = useSiteSettings();
  const mailto = SITE.mailto;
  return (
    <section
      className="cta-contact-band mx-auto w-full max-w-[var(--container-width,1440px)] py-16 md:py-24"
      style={{ paddingLeft: "var(--page-margin)", paddingRight: "var(--page-margin)" }}
    >
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <h2 className="text-[36px] font-extrabold leading-[1.02] uppercase tracking-[-0.02em] md:text-[64px]">
            {title}
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-[1.6]">
            {note}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ActionAnchor href={mailto}>Écris-nous</ActionAnchor>
            <ActionAnchor href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`} variant="outline">
              {SITE.phone}
            </ActionAnchor>
          </div>
        </div>
        <div className="flex justify-center md:col-span-4 md:col-start-8">
          <img src={ILLUSTRATIONS.perso2} alt="" aria-hidden="true" className="hero-illu w-40 md:w-56" />
        </div>
      </div>
    </section>
  );
}

import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ILLUSTRATIONS } from "@/lib/illustrations";

function Sparkle({ src, className }: { src: string; className?: string }) {
  return <img src={src} alt="" aria-hidden="true" className={`sparkle hero-illu ${className ?? ""}`} />;
}

export function HomeHero() {
  const site = useSiteSettings();

  return (
    <section className="home-hero">
      {/* Étincelles dispersées */}
      <div className="absolute left-[12%] top-[14%]">
        <Sparkle src={ILLUSTRATIONS.sparkle2} className="sparkle-float w-8 md:w-12" />
      </div>
      <div className="absolute right-[10%] top-[10%]">
        <Sparkle src={ILLUSTRATIONS.sparkle1} className="sparkle-float-delayed w-6 md:w-9" />
      </div>
      <div className="absolute bottom-[24%] left-[8%] hidden md:block">
        <Sparkle src={ILLUSTRATIONS.sparkle1} className="sparkle-float w-5 md:w-8" />
      </div>
      <div className="absolute right-[16%] bottom-[30%] hidden md:block">
        <Sparkle src={ILLUSTRATIONS.sparkle2} className="sparkle-float-delayed w-7 md:w-10" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-[var(--page-margin)] py-24">
        <img
          src={ILLUSTRATIONS.perso1}
          alt=""
          aria-hidden="true"
          className="hero-top-character hero-illu"
        />
        <div>
          <img src={ILLUSTRATIONS.logo} alt={site.name} className="hero-logo-img" />
        </div>

        <h1 className="hero-baseline mt-10">
          {site.name ? <><span>Créateur d'identités</span><span>visuelles singulières</span></> : ""}
        </h1>

        <p className="mt-6 max-w-xl text-[16px] font-medium md:text-[18px]">
          {site.location ? "Branding illustré & illustration, pour les marques qui n'ont pas peur de montrer qui elles sont." : ""}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a href={site.mailto} className="btn-cta">Un projet ?</a>
          <Link to="/services" className="btn-cta btn-cta-outline">Voir les services</Link>
        </div>
      </div>

      <img
        src={ILLUSTRATIONS.perso3}
        alt=""
        aria-hidden="true"
        className="hero-illu absolute bottom-6 left-[4%] hidden w-36 md:block lg:w-48"
      />
      <img
        src={ILLUSTRATIONS.perso4}
        alt=""
        aria-hidden="true"
        className="hero-illu absolute bottom-6 right-[4%] hidden w-36 md:block lg:w-48"
      />
    </section>
  );
}

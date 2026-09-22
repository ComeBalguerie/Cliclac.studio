import { Reveal } from "@/components/reveal";
import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ILLUSTRATIONS } from "@/lib/illustrations";

export function SiteFooter() {
  const SITE = useSiteSettings();
  const year = new Date().getFullYear();
  return (
    <Reveal>
      <footer className="site-footer">
        <div className="mx-auto w-full max-w-[var(--container-width,1440px)] px-[var(--page-margin)] py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <img src={ILLUSTRATIONS.footerLogo} alt={SITE.name} className="footer-logo" />
              <p className="mt-6 max-w-sm text-[16px] font-medium">
                Créateur d'identités visuelles singulières, branding illustré & illustration.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 md:col-span-4 md:items-end">
              <a href={SITE.mailto} className="footer-link text-[18px] font-semibold">{SITE.email}</a>
              <a href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`} className="footer-link text-[16px]">{SITE.phone}</a>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="footer-link text-[16px]">@cliclac.studio</a>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-8">
            <nav className="flex flex-wrap gap-6">
              <Link to="/" className="footer-link nav-caps">Réalisations</Link>
              <Link to="/services" className="footer-link nav-caps">Services</Link>
              <Link to="/about" className="footer-link nav-caps">Studio</Link>
              <Link to="/contact" className="footer-link nav-caps">Contact</Link>
            </nav>
            <img src={ILLUSTRATIONS.footerCharacter} alt="" aria-hidden="true" className="hero-illu w-24 md:w-32" />
          </div>

          <div className="footer-signature mt-12 flex flex-col items-center gap-5 pt-8">
            <p className="footer-stats nav-caps text-center">Basé à Nice ✳ Des marques qui osent ✳ 100% sur mesure ✳ Illustrations maison</p>
            <img src={ILLUSTRATIONS.trefle} alt="" aria-hidden="true" className="w-8" />
            <p className="text-[13px] text-[color:var(--footer-muted)]">
              © {year} {SITE.name}, dessiné avec beaucoup de trait à {SITE.location}.
            </p>
          </div>
        </div>
      </footer>
    </Reveal>
  );
}

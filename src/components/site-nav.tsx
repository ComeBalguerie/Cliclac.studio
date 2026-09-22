import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { ILLUSTRATIONS } from "@/lib/illustrations";

const items = [
  { to: "/", label: "Réalisations", exact: true },
  { to: "/services", label: "Services", exact: false },
  { to: "/about", label: "Studio", exact: false },
  { to: "/contact", label: "Contact", exact: false },
];

export function SiteNav() {
  const site = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Le logo admin est chargé depuis la base (client uniquement) : on ne le
  // rend qu'après le montage pour garantir un rendu serveur/client identique.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header sticky top-0 z-40 ${scrolled ? "site-header-scrolled" : ""}`}>
      <div className="mx-auto grid w-full max-w-[var(--container-width,1440px)] grid-cols-[minmax(0,1fr)_auto] items-end gap-4 px-[var(--page-margin)] transition-[padding] duration-300 md:flex md:justify-between">
        <Link to="/" className="site-logo leading-none tracking-normal text-foreground hover:text-foreground" onClick={() => setMenuOpen(false)}>
          <img src={ILLUSTRATIONS.navTrefle} alt={`${site.name} | accueil`} />
        </Link>
        <nav className="hidden items-end gap-9 md:flex">
          {items.map((item) => (
            <Link key={item.to} to={item.to} className="nav-link nav-caps text-foreground" {...(item.exact ? { activeOptions: { exact: true } } : {})} activeProps={{ className: "nav-link nav-caps is-active text-foreground" }}>
              {item.label}
            </Link>
          ))}
          <a href={site.mailto} className="btn-cta !px-6 !py-2.5 text-[13px]">Écris-nous</a>
        </nav>
        <button type="button" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOpen} className="menu-toggle md:hidden" onClick={() => setMenuOpen((open) => !open)}>
          <span /><span /><span />
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.aside className="mobile-menu fixed inset-y-0 right-0 z-50 w-[min(88vw,360px)] border-l-2 border-[var(--foreground)] p-6" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.3, ease: "easeInOut" }}>
            <div className="flex justify-end">
              <button type="button" aria-label="Fermer le menu" className="menu-close nav-caps" onClick={() => setMenuOpen(false)}>Fermer ×</button>
            </div>
            <nav className="mt-16 flex flex-col items-start gap-8">
              {items.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="nav-link nav-caps text-foreground" {...(item.exact ? { activeOptions: { exact: true } } : {})} activeProps={{ className: "nav-link nav-caps is-active text-foreground" }}>
                  {item.label}
                </Link>
              ))}
              <a href={site.mailto} className="btn-cta">Écris-nous</a>
              <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} className="nav-caps text-foreground">{site.phone}</a>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}

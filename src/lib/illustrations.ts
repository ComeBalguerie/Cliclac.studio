import logoCliclac from "@/assets/logo-cliclac.svg.asset.json";
import perso1 from "@/assets/perso-cliclac-1.svg.asset.json";
import perso2 from "@/assets/perso-cliclac-2.svg.asset.json";
import perso3 from "@/assets/perso-cliclac-3.svg.asset.json";
import perso4 from "@/assets/perso-cliclac-4.svg.asset.json";
import sparkle1 from "@/assets/sparkle-1.svg.asset.json";
import sparkle2 from "@/assets/sparkle-2.svg.asset.json";
import trefle from "@/assets/trefle.svg.asset.json";
import navTrefle from "@/assets/logo-nav-trefle.svg.asset.json";
import footerLogo from "@/assets/new-logo-red.svg.asset.json";
import footerCharacter from "@/assets/footer-character-blue-v3.svg.asset.json";

/** Illustrations SVG de la marque, servies depuis le CDN. */
export const ILLUSTRATIONS = {
  logo: logoCliclac.url,
  perso1: perso1.url,
  perso2: perso2.url,
  perso3: perso3.url,
  perso4: perso4.url,
  sparkle1: sparkle1.url,
  sparkle2: sparkle2.url,
  trefle: trefle.url,
  navTrefle: navTrefle.url,
  footerLogo: footerLogo.url,
  footerCharacter: footerCharacter.url,
} as const;

import { SITE } from "@/lib/site";

export type Pillar = { title: string; body: string };

export type HomeSettings = {
  headline: string;
  subheadline: string;
  hero_subtext: string;
  cta_primary_label: string;
  cta_secondary_label: string;
  services: string[];
  pillars: Pillar[];
  stats: string[];
  projects_title: string;
  projects_subtitle: string;
  hidden: Record<string, boolean>;
};

export const HOME_DEFAULTS: HomeSettings = {
  headline: SITE.baseline,
  subheadline:
    "Cliclac studio, c'est du branding illustré : des marques qui racontent des histoires, avec du trait, du punch et beaucoup de caractère.",
  hero_subtext:
    "Pour les marques qui n'ont pas peur de montrer qui elles sont.",
  cta_primary_label: "Un projet ?",
  cta_secondary_label: "Voir les services",
  services: [
    "Branding illustré",
    "Illustration",
    "Identité visuelle",
    "Iconographie",
    "Refresh de marque",
  ],
  pillars: [
    {
      title: "Branding illustré",
      body: "Une marque qui a un visage : logos, personnages, icônes et illustrations qui portent sa voix partout où elle passe.",
    },
    {
      title: "Illustration",
      body: "Du trait sur mesure pour tes campagnes, ton site, tes produits. Des images qu'on ne confond avec aucune autre.",
    },
    {
      title: "Identité complète",
      body: "Palette, typographie, ton, iconographie : un système visuel cohérent, pensé pour vivre partout, du packaging à l'Insta.",
    },
  ],
  stats: [
    "Basé à Nice",
    "Des marques qui osent",
    "100% sur mesure",
    "Illustrations maison",
  ],
  projects_title: "Réalisations",
  projects_subtitle: "Un aperçu des mondes qu'on a dessinés",
  hidden: {},
};

export type ServicePackage = {
  label: string;
  title: string;
  pitch: string;
  why: string;
  items: string[];
  budget: string;
  timeline: string;
  cta_label: string;
};

export type ServicesSettings = {
  title: string;
  intro: string;
  cta_label: string;
  packages: ServicePackage[];
  included_title: string;
  included: string[];
  steps_title: string;
  steps: string[];
  footer_note: string;
  hidden: Record<string, boolean>;
};

export const SERVICES_DEFAULTS: ServicesSettings = {
  title: "Des idées qui claquent",
  intro:
    "Trois façons de travailler ensemble autour du branding illustré et de l'illustration. On en discute, on cadre, on dessine.",
  cta_label: "Écris-nous",
  packages: [
    {
      label: "Option 1 | Grande aventure",
      title: "Identité illustrée complète",
      pitch: "Ta marque de zéro, avec son propre monde illustré.",
      why: "On part de ton histoire et de ta personnalité pour construire un univers visuel complet : logo, personnages, icônes, motifs. C'est l'offre la plus complète, et la plus fun.",
      items: [
        "Immersion & audit de marque",
        "Direction créative & moodboard",
        "Logo + univers illustré (personnage, icônes, motifs)",
        "Palette, typographies & ton de voix",
        "Guidelines pour tout décliner",
        "2 rounds d'allers-retours",
      ],
      budget: "Sur devis",
      timeline: "4 à 6 semaines",
      cta_label: "Écris-nous",
    },
    {
      label: "Option 2 | Coup de frais",
      title: "Refresh illustré",
      pitch: "Ton image existe, elle a juste besoin de rajeunir.",
      why: "Tu as déjà une base qu'on aime bien. On la rafraîchit : logo allégé, palette neuve, nouvelles illustrations clés. Moins de stratégie à reconstruire, donc plus vite et plus léger.",
      items: [
        "Audit de ton identité actuelle",
        "Refresh du logo & de la palette",
        "Nouvelles illustrations clés",
        "Déclinaisons réseaux sociaux & print",
        "2 rounds d'allers-retours",
      ],
      budget: "Sur devis",
      timeline: "2 à 3 semaines",
      cta_label: "Écris-nous",
    },
    {
      label: "Option 3 | Pièce unique",
      title: "Illustration sur mesure",
      pitch: "Une image, une campagne, un personnage : du trait à la demande.",
      why: "Tu as besoin d'une image précise : mascotte, visuel de campagne, série d'icônes. On dessine, tu valides, tu récupères des fichiers prêts à l'emploi.",
      items: [
        "Brief & moodboard",
        "Croquis & direction artistique",
        "Illustration finale, fichiers prêts à l'emploi",
        "Déclinaisons de formats",
      ],
      budget: "Sur devis",
      timeline: "1 à 2 semaines",
      cta_label: "Écris-nous",
    },
  ],
  included_title: "Ce qui est inclus dans tous les projets",
  included: [
    "Direction artistique",
    "Illustrations maison",
    "Fichiers sources & prêts à l'emploi",
    "Déclinaisons réseaux sociaux",
    "Guidelines simples et lisibles",
    "Un vrai suivi après livraison",
  ],
  steps_title: "Comment ça marche",
  steps: [
    "Tu nous écris (email ou téléphone).",
    "On discute de ton projet, de tes envies, de ton budget.",
    "On cadre le brief ensemble.",
    "On propose un devis sur mesure.",
     "Si c'est go, on dessine. Livraison en 2 à 6 semaines selon l'offre.",
  ],
  footer_note: "Une question avant de se lancer ?",
  hidden: {},
};

export type ProcessStep = { pct: string; label: string; note: string };
export type ClientType = { title: string; body: string };

export type AboutSettings = {
  title: string;
  credentials: string[];
  paragraphs: string[];
  image_url: string | null;
  process_title: string;
  process_intro: string;
  process: ProcessStep[];
  process_note: string;
  clients_title: string;
  clients_intro: string;
  clients: ClientType[];
  hidden: Record<string, boolean>;
};

export const ABOUT_DEFAULTS: AboutSettings = {
  title: "Le studio qui dessine les marques",
  credentials: [
    "Branding illustré & illustration",
    "Des identités pensées comme des mondes",
    "Basé à Nice, inspiré partout",
  ],
  paragraphs: [
    "Cliclac studio est né d'une conviction simple : une marque n'est pas qu'un logo posé sur une carte de visite. C'est un personnage, un trait, une énergie, quelque chose qu'on reconnaît au premier coup d'œil.",
    "Ici, on pratique le branding illustré : on construit des identités qui racontent des histoires dessinées. Un personnage qui devient la mascotte de la marque, des icônes qui ont de la personnalité, des illustrations qu'on a envie d'afficher.",
    "Le process est simple : on écoute, on griffonne, on itère. Beaucoup de croquis, quelques fous rires, et à la fin une identité qui te ressemble, pas un template de plus.",
  ],
  image_url: null,
  process_title: "Comment on travaille",
  process_intro:
    "Chaque projet suit le même chemin : comprendre, dessiner, affiner. Voilà comment se répartit le temps.",
  process: [
    {
      pct: "40%",
      label: "Écoute & exploration",
      note: "On ne dessine pas avant d'avoir compris.",
    },
    { pct: "20%", label: "Croquis & pistes", note: "On teste des mondes." },
    {
      pct: "25%",
      label: "Illustration & construction",
      note: "Le trait prend forme.",
    },
    {
      pct: "15%",
      label: "Finalisation & déclinaisons",
      note: "La marque devient utilisable partout.",
    },
  ],
  process_note:
    "L'illustration n'est pas la cerise sur le gâteau : c'est la farine. Elle guide toutes les décisions visuelles.",
  clients_title: "Avec qui on travaille",
  clients_intro: "On s'éclate surtout avec :",
  clients: [
    {
      title: "Les marques qui se lancent",
      body: "Tu crées ta marque et tu veux une identité qui a de la gueule dès le premier jour, pas un logo générique.",
    },
    {
      title: "Celles qui veulent se réinventer",
      body: "Ton image a vieilli ou ne te ressemble plus. On la rafraîchit avec du trait et du caractère.",
    },
    {
      title: "Les projets qui aiment l'illustration",
      body: "Packaging, éditions, campagnes, apps : partout où une image dessinée fait mouche.",
    },
  ],
  hidden: {},
};

export type SiteSettings = {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  location: string;
};

export const SITE_DEFAULTS: SiteSettings = {
  name: SITE.name,
  email: SITE.email,
  phone: SITE.phone,
  instagram: SITE.instagram,
  location: SITE.location,
};

export const mailtoOf = (email: string) => `mailto:${email}`;
export const telOf = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

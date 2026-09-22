import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppearanceSettings = {
  /** Google Font family name, e.g. "Familjen Grotesk" */
  font_body: string;
  font_heading: string;
  color_background: string;
  color_foreground: string;
  color_accent: string;
  color_line: string;
  color_tag_bg: string;
  color_muted_foreground: string;
  logo_image_url: string | null;
  logo_size: number;
  logo_weight: number;
  nav_size: number;
  nav_tracking: number;
  page_margin_desktop: number;
  page_margin_mobile: number;
  container_width: number;
  radius: number;
  project_columns: number;
  hero_height: number;
  heading_weight: number;
  body_weight: number;
};

export type AppearanceOverride = Partial<AppearanceSettings>;

export const APPEARANCE_DEFAULTS: AppearanceSettings = {
  font_body: "DM Sans",
  font_heading: "Space Grotesk",
  color_background: "#ff0d00",
  color_foreground: "#1d1d1b",
  color_accent: "#1d1d1b",
  color_line: "rgba(29, 29, 27, 0.35)",
  color_tag_bg: "#1d1d1b",
  color_muted_foreground: "rgba(29, 29, 27, 0.72)",
  logo_image_url: null,
  logo_size: 22,
  logo_weight: 800,
  nav_size: 13,
  nav_tracking: 0.12,
  page_margin_desktop: 40,
  page_margin_mobile: 16,
  container_width: 1440,
  radius: 999,
  project_columns: 2,
  hero_height: 50,
  heading_weight: 800,
  body_weight: 400,
};

/** Page profiles that can override the global appearance. */
export const APPEARANCE_PAGES = [
  { id: "home", label: "Accueil", key: "appearance:home" },
  { id: "projects", label: "Projets", key: "appearance:projects" },
  { id: "about", label: "About", key: "appearance:about" },
  { id: "services", label: "Services", key: "appearance:services" },
  { id: "contact", label: "Contact", key: "appearance:contact" },
] as const;

export type AppearancePageId = (typeof APPEARANCE_PAGES)[number]["id"];

export const APPEARANCE_GLOBAL_KEY = "appearance";

export function pageKey(id: AppearancePageId) {
  return `appearance:${id}`;
}

/** Maps a pathname to the page profile that applies to it. */
export function pageForPath(pathname: string): AppearancePageId | null {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/projects")) return "projects";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/services")) return "services";
  if (pathname.startsWith("/contact")) return "contact";
  return null;
}

export const GOOGLE_FONTS = [
  "Space Grotesk",
  "DM Sans",
  "Bricolage Grotesque",
  "Familjen Grotesk",
  "Inter",
  "DM Sans",
  "Space Grotesk",
  "Work Sans",
  "Manrope",
  "Archivo",
  "Syne",
  "Sora",
  "Outfit",
  "Instrument Serif",
  "Playfair Display",
  "Cormorant Garamond",
  "Libre Baskerville",
  "EB Garamond",
  "Bebas Neue",
  "JetBrains Mono",
  "Space Mono",
];

// Familles avec une graisse 800 disponible sur Google Fonts.
const EXTRA_BOLD_FONTS = new Set([
  "Bricolage Grotesque",
  "Archivo",
  "Manrope",
  "Work Sans",
  "Outfit",
  "Syne",
  "Sora",
  "Playfair Display",
  "DM Sans",
  "Space Grotesk",
  "Inter",
  "Familjen Grotesk",
]);

const num = (v: unknown, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;
const str = (v: unknown, fallback: string) =>
  typeof v === "string" && v.trim() ? v : fallback;

export function normalizeAppearance(
  v: Partial<AppearanceSettings> | null,
): AppearanceSettings {
  if (!v) return APPEARANCE_DEFAULTS;
  const d = APPEARANCE_DEFAULTS;
  const bodyFont = str(v.font_body, d.font_body);
  const headingFont = str(v.font_heading, d.font_heading);
  return {
    font_body: bodyFont === "Bricolage Grotesque" ? d.font_body : bodyFont,
    font_heading: headingFont === "Bricolage Grotesque" ? d.font_heading : headingFont,
    color_background: str(v.color_background, d.color_background),
    color_foreground: str(v.color_foreground, d.color_foreground),
    color_accent: str(v.color_accent, d.color_accent),
    color_line: str(v.color_line, d.color_line),
    color_tag_bg: str(v.color_tag_bg, d.color_tag_bg),
    color_muted_foreground: str(
      v.color_muted_foreground,
      d.color_muted_foreground,
    ),
    logo_image_url: v.logo_image_url ?? null,
    logo_size: num(v.logo_size, d.logo_size),
    logo_weight: num(v.logo_weight, d.logo_weight),
    nav_size: num(v.nav_size, d.nav_size),
    nav_tracking: num(v.nav_tracking, d.nav_tracking),
    page_margin_desktop: num(v.page_margin_desktop, d.page_margin_desktop),
    page_margin_mobile: num(v.page_margin_mobile, d.page_margin_mobile),
    container_width: num(v.container_width, d.container_width),
    radius: num(v.radius, d.radius),
    project_columns: num(v.project_columns, d.project_columns),
    hero_height: num(v.hero_height, d.hero_height),
    heading_weight: num(v.heading_weight, d.heading_weight),
    body_weight: num(v.body_weight, d.body_weight),
  };
}

/** Keeps only the keys that exist on AppearanceSettings. */
export function normalizeOverride(v: unknown): AppearanceOverride {
  if (!v || typeof v !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(APPEARANCE_DEFAULTS)) {
    const val = (v as Record<string, unknown>)[k];
    if (val !== undefined) out[k] = val;
  }
  return out as AppearanceOverride;
}

export function mergeAppearance(
  base: AppearanceSettings,
  override: AppearanceOverride | undefined | null,
): AppearanceSettings {
  if (!override) return base;
  return normalizeAppearance({ ...base, ...override });
}

export type AppearanceBundle = {
  global: AppearanceSettings;
  pages: Partial<Record<AppearancePageId, AppearanceOverride>>;
};

export const appearanceQuery = () =>
  queryOptions({
    queryKey: ["settings", "appearance"],
    queryFn: async (): Promise<AppearanceBundle> => {
      const { data, error } = await supabase
        .from("settings")
        .select("key,value")
        .like("key", "appearance%");
      if (error) throw error;
      const rows = data ?? [];
      const globalRow = rows.find((r) => r.key === APPEARANCE_GLOBAL_KEY);
      const pages: Partial<Record<AppearancePageId, AppearanceOverride>> = {};
      for (const p of APPEARANCE_PAGES) {
        const row = rows.find((r) => r.key === p.key);
        if (row) pages[p.id] = normalizeOverride(row.value);
      }
      return {
        global: normalizeAppearance(
          (globalRow?.value ?? null) as Partial<AppearanceSettings> | null,
        ),
        pages,
      };
    },
  });

export function googleFontsHref(families: string[]): string {
  const params = Array.from(new Set(families))
    .map((f) => {
      const weights = EXTRA_BOLD_FONTS.has(f)
        ? "400;500;600;700;800"
        : "300;400;500;600;700";
      return `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@${weights}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export function appearanceCss(a: AppearanceSettings): string {
  return `:root{
  --background:${a.color_background};
  --foreground:${a.color_foreground};
  --accent:${a.color_accent};
  --line:${a.color_line};
  --tag-bg:${a.color_tag_bg};
  --muted:${a.color_tag_bg};
  --muted-foreground:${a.color_muted_foreground};
  --border:${a.color_line};
  --input:${a.color_line};
  --radius:${a.radius}px;
  --page-margin:${a.page_margin_mobile}px;
  --container-width:${a.container_width}px;
  --logo-size:${a.logo_size}px;
  --logo-weight:${a.logo_weight};
  --nav-size:${a.nav_size}px;
  --nav-tracking:${a.nav_tracking}em;
  --hero-height:${a.hero_height}vh;
  --project-columns:${a.project_columns};
   --font-body:"${a.font_body}", ui-sans-serif, system-ui, sans-serif;
   --font-heading:"${a.font_heading}", ui-sans-serif, system-ui, sans-serif;
   --heading-weight:${a.heading_weight};
   --body-weight:${a.body_weight};
 }
 @media (min-width:768px){:root{--page-margin:${a.page_margin_desktop}px;}}
  html,body{font-family:var(--font-body);font-weight:var(--body-weight);}
  h1,h2,h3,h4{font-family:var(--font-heading);font-weight:var(--heading-weight);}
 body .font-light{font-weight:var(--body-weight);}
 .nav-caps{font-size:var(--nav-size);letter-spacing:var(--nav-tracking);}
 @media (min-width:768px){.project-grid{grid-template-columns:repeat(var(--project-columns),minmax(0,1fr));}}
`;
}

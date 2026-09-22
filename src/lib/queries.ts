import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProjectRow = {
  id: string;
  title: string;
  short_description: string | null;
  long_description: string | null;
  cover_image_url: string | null;
  client: string | null;
  year: string | null;
  sector: string | null;
  discipline: string | null;
  case_study_problem: string | null;
  case_study_approach: string | null;
  case_study_results: string | null;
  status: string;
  display_order: number;
  created_at: string;
};

export type TagRow = { id: string; name: string; slug: string };
export type ProjectTag = { project_id: string; tag_id: string };
export type GalleryImage = {
  id: string;
  project_id: string;
  image_url: string;
  display_order: number;
};

export type ProjectWithTags = ProjectRow & {
  tags: TagRow[];
  gallery: GalleryImage[];
};

async function fetchPublishedProjects(): Promise<ProjectWithTags[]> {
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  const ids = (projects ?? []).map((p) => p.id);
  if (ids.length === 0) return [];
  const [{ data: pt }, { data: tags }, { data: gallery }] = await Promise.all([
    supabase.from("project_tags").select("*").in("project_id", ids),
    supabase.from("tags").select("*"),
    supabase
      .from("gallery_images")
      .select("*")
      .in("project_id", ids)
      .order("display_order", { ascending: true }),
  ]);
  const tagById = new Map((tags ?? []).map((t) => [t.id, t]));
  return (projects ?? []).map((p) => ({
    ...p,
    tags: (pt ?? [])
      .filter((r) => r.project_id === p.id)
      .map((r) => tagById.get(r.tag_id))
      .filter(Boolean) as TagRow[],
    gallery: (gallery ?? []).filter((g) => g.project_id === p.id),
  }));
}

export const publishedProjectsQuery = () =>
  queryOptions({
    queryKey: ["projects", "published"],
    queryFn: fetchPublishedProjects,
  });

export const allTagsQuery = () =>
  queryOptions({
    queryKey: ["tags"],
    queryFn: async (): Promise<TagRow[]> => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

export const settingsQuery = (key: string) =>
  queryOptions({
    queryKey: ["settings", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      return (data?.value as { text?: string; image_url?: string | null } | null) ?? null;
    },
  });

export type HeroSettings = {
  type: "carousel" | "video";
  images: string[];
  video_url: string | null;
};

export const heroQuery = () =>
  queryOptions({
    queryKey: ["settings", "hero"],
    queryFn: async (): Promise<HeroSettings | null> => {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "hero")
        .maybeSingle();
      if (error) throw error;
      const v = (data?.value ?? null) as Partial<HeroSettings> | null;
      if (!v) return null;
      return {
        type: v.type === "video" ? "video" : "carousel",
        images: Array.isArray(v.images) ? v.images.filter(Boolean) : [],
        video_url: v.video_url ?? null,
      };
    },
  });

export const allProjectsQuery = () =>
  queryOptions({
    queryKey: ["projects", "all"],
    queryFn: async (): Promise<ProjectRow[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const projectDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["projects", "detail", id],
    queryFn: async () => {
      const [{ data: project, error }, { data: pt }, { data: gallery }] =
        await Promise.all([
          supabase.from("projects").select("*").eq("id", id).maybeSingle(),
          supabase.from("project_tags").select("tag_id").eq("project_id", id),
          supabase
            .from("gallery_images")
            .select("*")
            .eq("project_id", id)
            .order("display_order"),
        ]);
      if (error) throw error;
      return {
        project: project as ProjectRow | null,
        tag_ids: (pt ?? []).map((r) => r.tag_id),
        gallery: (gallery ?? []) as GalleryImage[],
      };
    },
  });
import {
  HOME_DEFAULTS,
  SERVICES_DEFAULTS,
  ABOUT_DEFAULTS,
  SITE_DEFAULTS,
  type HomeSettings,
  type ServicesSettings,
  type AboutSettings,
  type SiteSettings,
} from "@/lib/content-defaults";

export { HOME_DEFAULTS, SERVICES_DEFAULTS, ABOUT_DEFAULTS, SITE_DEFAULTS };
export type { HomeSettings, ServicesSettings, AboutSettings, SiteSettings };

async function readSetting<T>(key: string): Promise<Partial<T> | null> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return (data?.value ?? null) as Partial<T> | null;
}

// A field that was explicitly saved as empty stays empty (the section is then
// hidden on the public site). Defaults only apply when the field was never set.
const str = (v: unknown, fallback: string) =>
  typeof v === "string" ? v.trim() : fallback;

const list = <T,>(v: unknown, fallback: T[]): T[] =>
  Array.isArray(v) ? (v.filter(Boolean) as T[]) : fallback;

// Sections masquées depuis l'admin (le contenu reste en base).
const hiddenMap = (v: unknown): Record<string, boolean> =>
  v && typeof v === "object" ? (v as Record<string, boolean>) : {};

export const homeQuery = () =>
  queryOptions({
    queryKey: ["settings", "home"],
    queryFn: async (): Promise<HomeSettings> => {
      const v = await readSetting<HomeSettings>("home");
      if (!v) return HOME_DEFAULTS;
      return {
        headline: str(v.headline, HOME_DEFAULTS.headline),
        subheadline: str(v.subheadline, HOME_DEFAULTS.subheadline),
        hero_subtext: str(v.hero_subtext, HOME_DEFAULTS.hero_subtext),
        cta_primary_label: str(v.cta_primary_label, HOME_DEFAULTS.cta_primary_label),
        cta_secondary_label: str(
          v.cta_secondary_label,
          HOME_DEFAULTS.cta_secondary_label,
        ),
        services: list(v.services, HOME_DEFAULTS.services),
        pillars: list(v.pillars, HOME_DEFAULTS.pillars),
        stats: list(v.stats, HOME_DEFAULTS.stats),
        projects_title: str(v.projects_title, HOME_DEFAULTS.projects_title),
        projects_subtitle: str(
          v.projects_subtitle,
          HOME_DEFAULTS.projects_subtitle,
        ),
        hidden: hiddenMap(v.hidden),
      };
    },
  });

export const servicesQuery = () =>
  queryOptions({
    queryKey: ["settings", "services"],
    queryFn: async (): Promise<ServicesSettings> => {
      const v = await readSetting<ServicesSettings>("services");
      if (!v) return SERVICES_DEFAULTS;
      return {
        title: str(v.title, SERVICES_DEFAULTS.title),
        intro: str(v.intro, SERVICES_DEFAULTS.intro),
        cta_label: str(v.cta_label, SERVICES_DEFAULTS.cta_label),
        packages: list(v.packages, SERVICES_DEFAULTS.packages).map((p) => ({
          ...p,
          why: typeof p.why === "string" ? p.why : "",
        })),
        included_title: str(v.included_title, SERVICES_DEFAULTS.included_title),
        included: list(v.included, SERVICES_DEFAULTS.included),
        steps_title: str(v.steps_title, SERVICES_DEFAULTS.steps_title),
        steps: list(v.steps, SERVICES_DEFAULTS.steps),
        footer_note: str(v.footer_note, SERVICES_DEFAULTS.footer_note),
        hidden: hiddenMap(v.hidden),
      };
    },
  });

export const aboutQuery = () =>
  queryOptions({
    queryKey: ["settings", "about"],
    queryFn: async (): Promise<AboutSettings> => {
      const v = (await readSetting<AboutSettings>(
        "about",
      )) as Partial<AboutSettings> | null;
      if (!v) return ABOUT_DEFAULTS;
      const clients = (
        list<unknown>(v.clients, ABOUT_DEFAULTS.clients) as unknown[]
      ).map((c) =>
        typeof c === "string"
          ? { title: c, body: "" }
          : (c as { title?: string; body?: string }),
      );
      return {
        title: str(v.title, ABOUT_DEFAULTS.title),
        credentials: list(v.credentials, ABOUT_DEFAULTS.credentials),
        paragraphs: list(v.paragraphs, ABOUT_DEFAULTS.paragraphs),
        image_url: v.image_url ?? null,
        process_title: str(v.process_title, ABOUT_DEFAULTS.process_title),
        process_intro: str(v.process_intro, ABOUT_DEFAULTS.process_intro),
        process: list(v.process, ABOUT_DEFAULTS.process).map((p) => ({
          ...p,
          note: typeof p.note === "string" ? p.note : "",
        })),
        process_note: str(v.process_note, ABOUT_DEFAULTS.process_note),
        clients_title: str(v.clients_title, ABOUT_DEFAULTS.clients_title),
        clients_intro: str(v.clients_intro, ABOUT_DEFAULTS.clients_intro),
        clients: clients.map((c) => ({
          title: c.title ?? "",
          body: c.body ?? "",
        })),
        hidden: hiddenMap(v.hidden),
      };
    },
  });


export const siteSettingsQuery = () =>
  queryOptions({
    queryKey: ["settings", "site"],
    queryFn: async (): Promise<SiteSettings> => {
      const v = await readSetting<SiteSettings>("site");
      if (!v) return SITE_DEFAULTS;
      // Contact details always keep a fallback: links must stay functional.
      const req = (x: unknown, fallback: string) =>
        typeof x === "string" && x.trim() ? x.trim() : fallback;
      return {
        name: req(v.name, SITE_DEFAULTS.name),
        email: req(v.email, SITE_DEFAULTS.email),
        phone: req(v.phone, SITE_DEFAULTS.phone),
        instagram: req(v.instagram, SITE_DEFAULTS.instagram),
        location: req(v.location, SITE_DEFAULTS.location),
      };
    },
  });

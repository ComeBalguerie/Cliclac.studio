import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery } from "@/lib/queries";
import { SITE_DEFAULTS, mailtoOf, type SiteSettings } from "@/lib/content-defaults";

export function useSiteSettings(): SiteSettings & { mailto: string } {
  const { data } = useQuery(siteSettingsQuery());
  const site = data ?? SITE_DEFAULTS;
  return { ...site, mailto: mailtoOf(site.email) };
}

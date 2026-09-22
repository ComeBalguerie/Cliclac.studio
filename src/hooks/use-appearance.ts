import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import {
  APPEARANCE_DEFAULTS,
  appearanceQuery,
  mergeAppearance,
  pageForPath,
  type AppearanceSettings,
} from "@/lib/appearance";

/** Appearance for the current page (global + page override). */
export function useAppearance(): AppearanceSettings {
  const { data } = useQuery(appearanceQuery());
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!data) return APPEARANCE_DEFAULTS;
  const page = pageForPath(pathname);
  return page ? mergeAppearance(data.global, data.pages[page]) : data.global;
}

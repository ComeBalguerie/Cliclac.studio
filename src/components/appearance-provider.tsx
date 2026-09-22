import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import {
  appearanceCss,
  appearanceQuery,
  googleFontsHref,
  mergeAppearance,
  pageForPath,
} from "@/lib/appearance";

/** Injects the admin-editable theme (fonts, colors, sizes) as CSS variables. */
export function AppearanceProvider() {
  const { data } = useQuery(appearanceQuery());
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!data) return null;
  const page = pageForPath(pathname);
  const effective = page
    ? mergeAppearance(data.global, data.pages[page])
    : data.global;
  const families = [
    data.global.font_body,
    data.global.font_heading,
    effective.font_body,
    effective.font_heading,
  ];
  return (
    <>
      <link rel="stylesheet" href={googleFontsHref(families)} />
      <style dangerouslySetInnerHTML={{ __html: appearanceCss(effective) }} />
    </>
  );
}

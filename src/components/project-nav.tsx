import { Link } from "@tanstack/react-router";
import type { ProjectWithTags } from "@/lib/queries";

export function ProjectNav({
  previous,
  next,
}: {
  previous: ProjectWithTags | null;
  next: ProjectWithTags | null;
}) {
  if (!previous && !next) return null;
  return (
    <nav className="section-color-block mt-16 grid grid-cols-2 gap-6 px-6 py-8">
      <div>
        {previous && (
          <Link
            to="/projects/$id"
            params={{ id: previous.id }}
            className="group block text-foreground"
          >
            <span className="nav-caps text-[color:var(--muted-foreground)]">
              Précédent
            </span>
            <span className="mt-2 block text-[20px] font-light transition-colors group-hover:text-[color:var(--accent)] md:text-[28px]">
              {previous.title}
            </span>
          </Link>
        )}
      </div>
      <div className="text-right">
        {next && (
          <Link
            to="/projects/$id"
            params={{ id: next.id }}
            className="group block text-foreground"
          >
            <span className="nav-caps text-[color:var(--muted-foreground)]">
              Projet suivant
            </span>
            <span className="mt-2 block text-[20px] font-light transition-colors group-hover:text-[color:var(--accent)] md:text-[28px]">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}

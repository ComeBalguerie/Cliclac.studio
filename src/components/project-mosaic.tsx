import { Link } from "@tanstack/react-router";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { PointerEvent } from "react";
import type { ProjectWithTags } from "@/lib/queries";
import { TagPill } from "@/components/tag-pill";

const withoutEmDash = (text: string) => text.replaceAll(" — ", ", ").replaceAll("—", ",");

function MosaicTile({
  src,
  alt,
  className,
  depth,
}: {
  src: string;
  alt: string;
  className: string;
  depth: number;
}) {
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 110, damping: 20 });
  const smoothY = useSpring(pointerY, { stiffness: 110, damping: 20 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [depth, -depth]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-depth, depth]);
  const imageX = useTransform(smoothX, [-0.5, 0.5], [-depth * 2, depth * 2]);
  const imageY = useTransform(smoothY, [-0.5, 0.5], [-depth * 2, depth * 2]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.div
      className={`project-mosaic-tile ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      style={reducedMotion ? undefined : { rotateX, rotateY }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={reducedMotion ? undefined : { x: imageX, y: imageY }}
      />
    </motion.div>
  );
}

function CoverTile({ src, alt }: { src: string; alt: string }) {
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 100, damping: 22 });
  const smoothY = useSpring(pointerY, { stiffness: 100, damping: 22 });
  const imageX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const imageY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      className="project-cover-tile"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={reducedMotion ? undefined : { x: imageX, y: imageY }}
      />
    </motion.div>
  );
}

export function ProjectMosaic({
  project,
  index,
  onTagClick,
}: {
  project: ProjectWithTags;
  index: number;
  onTagClick: (slug: string) => void;
}) {
  const images = [
    project.cover_image_url,
    ...project.gallery.map((image) => image.image_url),
  ].filter((image): image is string => Boolean(image));
  const cover = images[0];
  const triptych = images.slice(1, 4);
  const subtitle = [project.discipline, project.sector].filter(Boolean).join(" · ");

  return (
    <article className="project-story">
      <div className="project-story-copy">
        <p className="project-kicker">Projet {String(index + 1).padStart(2, "0")}</p>
        <h3>{project.title}</h3>
        {subtitle ? <p className="project-subtitle">{subtitle}</p> : null}
        {project.short_description ? (
          <p className="project-intro">{withoutEmDash(project.short_description)}</p>
        ) : null}
        {project.long_description ? (
          <p className="project-description">{withoutEmDash(project.long_description)}</p>
        ) : null}
        <div className="project-story-tags">
          {project.tags.map((tag) => (
            <TagPill key={tag.id} onClick={() => onTagClick(tag.slug)}>
              {tag.name}
            </TagPill>
          ))}
        </div>
        <Link
          to="/projects/$id"
          params={{ id: project.id }}
          className="project-story-link"
        >
          Voir le cas d'étude <span aria-hidden="true">→</span>
        </Link>
      </div>

      <Link
        to="/projects/$id"
        params={{ id: project.id }}
        className="project-mosaic"
        aria-label={`Découvrir le projet ${project.title}`}
      >
        {cover ? <CoverTile src={cover} alt={`${project.title}, visuel de couverture`} /> : null}
        {triptych.length > 0 ? <div className="project-triptych">{triptych.map((src, imageIndex) => (
          <MosaicTile
            key={`${project.id}-${src}`}
            src={src}
            alt={`${project.title}, aperçu ${imageIndex + 2}`}
            className="project-triptych-item"
            depth={imageIndex % 2 === 0 ? 3.5 : 2.25}
          />
        ))}</div> : null}
      </Link>
    </article>
  );
}
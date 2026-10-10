import "server-only";
import { readdir } from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";
import site from "@content/site.json";
import stack from "@content/stack.json";
import certifications from "@content/certifications.json";
import achievements from "@content/achievements.json";
import credits from "@content/credits.json";

/** Acceso a /content. Los componentes nunca hardcodean contenido: lo reciben de acá. */

export type Site = typeof site;
export type StackGroup = (typeof stack)[number];
export type Certification = (typeof certifications)[number];
export type Achievement = (typeof achievements)[number];
export type Credit = (typeof credits)[number];

export interface ProjectMeta {
  title: string;
  summary: string;
  year: number;
  stack: string[];
  /** Estado mostrado en la ficha: ONLINE, ARCHIVED, IN DEV… */
  status: string;
  cover: string;
  repo?: string;
  demo?: string;
  order: number;
}

export interface Project {
  slug: string;
  meta: ProjectMeta;
}

export function getSite(): Site {
  return site;
}

export function getStack(): StackGroup[] {
  return stack;
}

export function getCertifications(): Certification[] {
  return certifications;
}

export function getAchievements(): Achievement[] {
  return achievements;
}

/** Atribuciones obligatorias (modelos CC-BY, etc.). */
export function getCredits(): Credit[] {
  return credits;
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  const dir = path.join(process.cwd(), "content", "projects");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mdx"));
  const projects = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.mdx$/, "");
      const mod = await import(`@content/projects/${slug}.mdx`);
      return { slug, meta: mod.meta as ProjectMeta };
    }),
  );
  return projects.sort((a, b) => a.meta.order - b.meta.order);
}

/** Cuerpo MDX de un proyecto (para la vista de detalle del acto 4). */
export async function getProjectBody(slug: string): Promise<ComponentType> {
  const mod = await import(`@content/projects/${slug}.mdx`);
  return mod.default;
}

/** Todo el contenido junto: lo usan la home, /cv y la versión estática. */
export async function getAllContent() {
  return {
    site: getSite(),
    projects: await getProjects(),
    stack: getStack(),
    certifications: getCertifications(),
    achievements: getAchievements(),
    credits: getCredits(),
  };
}

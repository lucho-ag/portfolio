import type { ReactNode } from "react";
import Link from "next/link";
import type { Achievement, Certification, Credit, Project, Site, StackGroup } from "@/lib/content";
import PrintButton from "./PrintButton";

export interface CvData {
  site: Site;
  projects: Project[];
  stack: StackGroup[];
  certifications: Certification[];
  achievements: Achievement[];
  credits: Credit[];
}

/**
 * Modo reclutador: todo el contenido en una sola página, sin animaciones, legible e imprimible.
 * Se usa en /cv y como versión estática cuando el visitante pide reducir el movimiento.
 */
export default function CvView({ site, projects, stack, certifications, achievements, credits }: CvData) {
  return (
    <main className="cv mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-16">

      <header className="border-b border-phosphor-dim pb-6">
        <p className="font-display text-lg uppercase text-phosphor-dim">Curriculum vitae</p>
        <h1 className="font-display text-5xl uppercase leading-none text-phosphor md:text-6xl">{site.name}</h1>
        <p className="mt-2 font-display text-2xl uppercase text-phosphor-hot">{site.title}</p>
        <p className="mt-1 text-sm text-phosphor-dim">{site.location}</p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {site.contact.map((c) => (
            <li key={c.label}>
              <span className="text-phosphor-dim">{c.label}: </span>
              <a href={c.href} className="text-phosphor underline decoration-phosphor-dim underline-offset-4 hover:text-phosphor-hot">
                {c.value}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-4 font-display text-xl uppercase print:hidden">
          <PrintButton />
          <Link href="/" className="text-phosphor-dim hover:text-phosphor-hot">
            [←] Ver la experiencia completa
          </Link>
        </div>
      </header>

      <Section title="Perfil">
        <p className="text-phosphor">{site.about}</p>
      </Section>

      <Section title="Experiencia">
        {site.experience.map((e) => (
          <article key={e.company} className="mb-4">
            <h3 className="font-display text-2xl uppercase text-phosphor-hot">
              {e.role} — {e.company}
            </h3>
            <p className="text-sm text-phosphor-dim">{e.period}</p>
            <ul className="mt-2 space-y-1 text-sm text-phosphor">
              {e.highlights.map((h) => (
                <li key={h}>&gt; {h}</li>
              ))}
            </ul>
          </article>
        ))}
      </Section>

      <Section title="Proyectos">
        {projects.map(({ slug, meta }) => (
          <article key={slug} className="mb-4 break-inside-avoid">
            <h3 className="font-display text-2xl uppercase text-phosphor-hot">
              {meta.title} <span className="text-phosphor-dim">({meta.year})</span>
            </h3>
            <p className="text-sm text-phosphor">{meta.summary}</p>
            <p className="text-sm text-phosphor-dim">{meta.stack.join(" · ")}</p>
            <p className="text-sm">
              {meta.repo && (
                <a href={meta.repo} className="mr-4 text-phosphor underline decoration-phosphor-dim underline-offset-4">
                  Repo
                </a>
              )}
              {meta.demo && (
                <a href={meta.demo} className="text-phosphor underline decoration-phosphor-dim underline-offset-4">
                  Demo
                </a>
              )}
            </p>
          </article>
        ))}
      </Section>

      <Section title="Stack">
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          {stack.map((g) => (
            <div key={g.group} className="contents">
              <dt className="font-display text-lg uppercase text-phosphor-dim">{g.group}</dt>
              <dd className="text-phosphor">{g.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Certificaciones">
        <ul className="space-y-1 text-sm">
          {certifications.map((c) => (
            <li key={c.id} className="text-phosphor">
              {c.title} <span className="text-phosphor-dim">— {[c.issuer, c.date].filter(Boolean).join(", ")}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Logros y actividades">
        <ul className="space-y-2 text-sm">
          {achievements.map((a) => (
            <li key={a.id}>
              <span className="text-phosphor-hot">★ {a.title}</span>
              <span className="block text-phosphor-dim">{a.description}</span>
            </li>
          ))}
        </ul>
      </Section>

      <footer className="mt-10 border-t border-phosphor-dim pt-4 text-xs text-phosphor-dim print:hidden">
        Modelos 3D:{" "}
        {credits.map((c, i) => (
          <span key={c.source}>
            {i > 0 && " · "}
            <a href={c.source} className="underline underline-offset-2">
              {c.work}
            </a>{" "}
            de {c.author} (CC-BY-4.0)
          </span>
        ))}
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 break-inside-avoid-page">
      <h2 className="mb-3 font-display text-xl uppercase text-phosphor-dim">
        <span aria-hidden>{"// "}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

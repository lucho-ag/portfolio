"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/animation/reveal";
import type { Achievement, Certification, Credit, Project, Site, StackGroup } from "@/lib/content";
import { useScene } from "@/store/useScene";
import Terminal from "../terminal/Terminal";
import Window from "../ui/Window";

type Tab = "terminal" | "projects" | "certs" | "about" | "contact" | "help";

const MENU: { key: string; tab: Tab; label: string }[] = [
  { key: "T", tab: "terminal", label: "Terminal" },
  { key: "P", tab: "projects", label: "Projects" },
  { key: "C", tab: "certs", label: "Certs" },
  { key: "A", tab: "about", label: "About" },
  { key: "M", tab: "contact", label: "Contact" },
  { key: "H", tab: "help", label: "Help" },
];

/**
 * Acto 4: dentro del CRT. Una ventana a la vez, navegable con atajos reales de teclado,
 * para que todo entre en el alto de la pantalla. Arranca en la terminal.
 */
export default function Inside({
  site,
  projects,
  certifications,
  achievements,
  stack,
  credits,
}: {
  site: Site;
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
  stack: StackGroup[];
  credits: Credit[];
}) {
  const [tab, setTab] = useState<Tab>("terminal");
  const active = useScene((s) => s.activeAct === "inside");
  const contentRef = useRef<HTMLDivElement>(null);
  useReveal(contentRef, active, tab);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Mientras se escribe en la terminal, las letras son texto, no atajos.
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const item = MENU.find((m) => m.key === e.key.toUpperCase());
      if (item) setTab(item.tab);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <div data-act="inside" className="invisible absolute inset-0 flex justify-center bg-void px-4 pb-6 pt-16 md:px-8 md:pb-20 md:pt-6">
      <div className="flex h-full w-full max-w-5xl flex-col gap-4">
        <nav className="flex flex-wrap gap-x-6 gap-y-1 font-display text-xl uppercase md:text-2xl">
          {MENU.map((m) => (
            <button
              key={m.tab}
              onClick={() => setTab(m.tab)}
              aria-pressed={tab === m.tab}
              className={
                tab === m.tab
                  ? "bg-phosphor px-1 text-void"
                  : "px-1 text-phosphor-dim hover:text-phosphor-hot"
              }
            >
              [{m.key}] {m.label}
            </button>
          ))}
        </nav>

        <div ref={contentRef} className="min-h-0 flex-1">
          {tab === "terminal" && (
            <Window subject="TERMINAL" status="TTY1" className="flex h-full flex-col">
              <Terminal data={{ site, projects, certifications, achievements, stack, credits }} active={active} />
            </Window>
          )}

          {tab === "about" && (
            <Window subject="ABOUT" status={site.location.toUpperCase()} className="flex max-h-full flex-col">
              <Scroll>
                <p data-fx="lines" className="text-phosphor">
                  {site.about}
                </p>
                {site.experience.map((e) => (
                  <article key={e.company} className="mt-6">
                    <h3 data-fx="scramble" className="font-display text-xl uppercase text-phosphor">
                      {`${e.role} @ ${e.company}`}
                    </h3>
                    <p data-fx="type" className="text-sm text-phosphor-dim">
                      {e.period}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-phosphor">
                      {e.highlights.map((h) => (
                        <li key={h} data-fx="lines">
                          &gt; {h}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </Scroll>
            </Window>
          )}

          {tab === "projects" && (
            <Window subject="PROJECTS" status={`${projects.length} DISCS`} className="flex max-h-full flex-col">
              <Scroll>
                <ol className="space-y-4">
                  {projects.map(({ slug, meta }, i) => (
                    <li key={slug}>
                      <h3 className="font-display text-xl uppercase text-phosphor">
                        <span className="text-phosphor-dim">[{i + 1}]</span>{" "}
                        <span data-fx="scramble">{`${meta.title} (${meta.year})`}</span>
                      </h3>
                      <p data-fx="lines" className="text-sm text-phosphor">
                        {meta.summary}
                      </p>
                      <p data-fx="type" className="text-sm text-phosphor-dim">
                        {meta.stack.join(" · ")}
                      </p>
                    </li>
                  ))}
                </ol>
              </Scroll>
            </Window>
          )}

          {tab === "certs" && (
            <Window subject="CERTS & ACHIEVEMENTS" status={`${certifications.length + achievements.length} FILES`} className="flex max-h-full flex-col">
              <Scroll>
                <ul className="space-y-3">
                  {certifications.map((c) => (
                    <li key={c.id}>
                      <span data-fx="scramble" className="block font-display text-xl uppercase text-phosphor">
                        {c.title}
                      </span>
                      <span data-fx="type" className="block text-sm text-phosphor-dim">
                        {[c.issuer, c.date].filter(Boolean).join(" — ")}
                      </span>
                    </li>
                  ))}
                  {achievements.map((a) => (
                    <li key={a.id}>
                      <span className="block font-display text-xl uppercase text-phosphor">
                        <span data-fx="item" className="text-phosphor-hot">★</span>{" "}
                        <span data-fx="scramble">{a.title}</span>
                      </span>
                      <span data-fx="lines" className="block text-sm text-phosphor-dim">
                        {a.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </Scroll>
            </Window>
          )}

          {tab === "contact" && (
            <Window subject="CONTACT" status="AWAITING INPUT">
              <ul className="space-y-1">
                {site.contact.map((c) => (
                  <li key={c.label}>
                    <span data-fx="type" className="text-phosphor-dim">{`> ${c.label}:`}</span>{" "}
                    <a data-fx="scramble" href={c.href} className="text-phosphor hover:text-phosphor-hot">
                      {c.value}
                    </a>
                  </li>
                ))}
              </ul>
            </Window>
          )}

          {tab === "help" && (
            <Window subject="HELP" status="MAN PAGE">
              <ul className="space-y-1 text-phosphor">
                {MENU.map((m) => (
                  <li key={m.tab} data-fx="type">
                    {`[${m.key}] ${m.label}`}
                  </li>
                ))}
                <li data-fx="lines" className="pt-2 text-phosphor-dim">
                  En la terminal escribí help. ESC suelta el teclado para usar los atajos.
                </li>
                <li data-fx="lines" className="text-phosphor-dim">Scroll hacia arriba para volver a la estación.</li>
                <li data-fx="type" className="pt-2 text-phosphor-dim">Créditos 3D (CC-BY-4.0):</li>
                {credits.map((c) => (
                  <li key={c.source} data-fx="type">
                    <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-phosphor-dim hover:text-phosphor-hot">
                      {`${c.work} — ${c.author}`}
                    </a>
                  </li>
                ))}
              </ul>
            </Window>
          )}
        </div>
      </div>
    </div>
  );
}

/** Área con scroll interno (.crt-scroll: Lenis le cede la rueda cuando hay contenido que scrollear). */
function Scroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="crt-scroll min-h-0 flex-1 overflow-y-auto pr-2">
      {children}
    </div>
  );
}

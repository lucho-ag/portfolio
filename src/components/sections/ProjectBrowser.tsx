"use client";

import { useEffect, useRef } from "react";
import { useReveal } from "@/animation/reveal";
import type { Project } from "@/lib/content";
import { useScene } from "@/store/useScene";

const STATUS_COLOR: Record<string, string> = {
  ONLINE: "bg-phosphor-hot crt-blink",
  COMPLETED: "bg-phosphor",
  "IN DEV": "bg-alert",
  ARCHIVED: "bg-teal-dim",
};

/**
 * Lista de discos + ficha técnica del seleccionado. La selección vive en el store
 * para que el DVD 3D muestre la misma portada.
 */
export default function ProjectBrowser({ projects }: { projects: Project[] }) {
  const selected = useScene((s) => s.selectedProject);
  const setSelected = useScene((s) => s.setSelectedProject);
  const active = useScene((s) => s.activePause === "projects");
  const detailRef = useRef<HTMLDivElement>(null);
  useReveal(detailRef, active, selected);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const n = projects.length;
      const current = useScene.getState().selectedProject;
      const key = e.key.toLowerCase();
      if (e.key === "ArrowDown" || key === "s") {
        e.preventDefault();
        setSelected((current + 1) % n);
      } else if (e.key === "ArrowUp" || key === "w") {
        e.preventDefault();
        setSelected((current - 1 + n) % n);
      } else if (/^[1-9]$/.test(e.key) && Number(e.key) <= n) {
        setSelected(Number(e.key) - 1);
      } else if (key === "r" || key === "d") {
        const url = key === "r" ? projects[current].meta.repo : projects[current].meta.demo;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, projects, setSelected]);

  const { meta } = projects[selected] ?? projects[0];

  return (
    <>
      <ol aria-label="Proyectos" className="space-y-1">
        {projects.map(({ slug, meta: m }, i) => {
          const isSelected = i === selected;
          return (
            <li key={slug}>
              <button
                onClick={() => setSelected(i)}
                aria-current={isSelected}
                className={`flex w-full items-baseline gap-2 px-1 text-left font-display text-xl uppercase ${
                  isSelected ? "bg-phosphor text-void" : "text-phosphor hover:text-phosphor-hot"
                }`}
              >
                <span aria-hidden>{isSelected ? "▶" : " "}</span>
                <span>[{i + 1}]</span>
                <span data-fx="scramble">{m.title}</span>
                <span className={`ml-auto text-base ${isSelected ? "text-void" : "text-phosphor-dim"}`}>{m.year}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* key: cada selección monta una ficha nueva, así el revelado parte del texto correcto. */}
      <div key={selected} ref={detailRef} data-fx-own className="relative mt-4 pt-3">
        <span data-fx-edge="x" aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-phosphor-dim" />
        <p data-fx="lines" className="text-sm text-phosphor">
          {meta.summary}
        </p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1 text-sm">
          <dt className="font-display text-lg text-phosphor-dim">YEAR</dt>
          <dd data-fx="type" className="text-phosphor">
            {String(meta.year)}
          </dd>
          <dt className="font-display text-lg text-phosphor-dim">STACK</dt>
          <dd data-fx="type" className="text-phosphor">
            {meta.stack.join(" · ")}
          </dd>
          <dt className="font-display text-lg text-phosphor-dim">STATUS</dt>
          <dd className="flex items-center gap-2 text-phosphor">
            <span aria-hidden className={`inline-block size-2 ${STATUS_COLOR[meta.status] ?? "bg-phosphor-dim"}`} />
            <span data-fx="scramble">{meta.status}</span>
          </dd>
        </dl>
        <div className="mt-3 flex gap-4 font-display text-lg uppercase">
          {meta.repo && (
            <a data-fx="item" href={meta.repo} target="_blank" rel="noopener noreferrer" className="text-phosphor hover:text-phosphor-hot">
              [R] Repo
            </a>
          )}
          {meta.demo && (
            <a data-fx="item" href={meta.demo} target="_blank" rel="noopener noreferrer" className="text-phosphor hover:text-phosphor-hot">
              [D] Demo
            </a>
          )}
        </div>
      </div>

      <p className="mt-4 font-display text-base uppercase text-phosphor-dim">
        ↑↓ Select · 1–{projects.length} Jump · Drag disc
      </p>
    </>
  );
}

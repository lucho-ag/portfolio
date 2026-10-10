"use client";

import { useEffect, useRef, useState } from "react";
import { chapterAt, goToChapter, stepChapter, subscribeProgress } from "@/animation/navigation";
import { CHAPTERS } from "@/sequence/manifest";
import { useScene } from "@/store/useScene";

const pad = (n: number) => String(n).padStart(2, "0");

/** Barra de progreso segmentada (como un medidor de los 90), la escala el scroll sin re-render. */
function ProgressBar({ barRef }: { barRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="h-[3px] bg-ambient">
      <div
        ref={barRef}
        className="h-full origin-left bg-phosphor [mask-image:repeating-linear-gradient(90deg,#000_0_6px,transparent_6px_8px)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/**
 * HUD de navegación: alternativa al scroll para recorrer la experiencia. Saltar a un capítulo
 * scrollea la página hasta ahí (ver animation/navigation.ts). Teclado: ← → / RePág AvPág / Inicio Fin.
 */
export default function Hud() {
  const booted = useScene((s) => s.booted);
  const [index, setIndex] = useState(0);
  const desktopBar = useRef<HTMLDivElement>(null);
  const mobileBar = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      subscribeProgress((time, duration) => {
        const scale = `scaleX(${duration ? time / duration : 0})`;
        if (desktopBar.current) desktopBar.current.style.transform = scale;
        if (mobileBar.current) mobileBar.current.style.transform = scale;
        const next = chapterAt(time);
        setIndex((prev) => (prev === next ? prev : next));
      }),
    [],
  );

  useEffect(() => {
    if (!booted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const action: Record<string, () => void> = {
        ArrowRight: () => stepChapter(1),
        PageDown: () => stepChapter(1),
        ArrowLeft: () => stepChapter(-1),
        PageUp: () => stepChapter(-1),
        Home: () => goToChapter(0),
        End: () => goToChapter(CHAPTERS.length - 1),
      };
      if (!action[e.key]) return;
      e.preventDefault();
      action[e.key]();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booted]);

  if (!booted) return null;

  const arrow = "px-2 text-phosphor-dim hover:text-phosphor-hot";

  return (
    <>
      {/* Desktop: barra de capítulos abajo al centro. */}
      <nav
        aria-label="Capítulos"
        className="fixed bottom-4 left-1/2 z-[44] hidden -translate-x-1/2 border border-phosphor-dim bg-void/85 font-display text-lg uppercase backdrop-blur-sm md:block"
      >
        <div className="flex items-stretch">
          <button onClick={() => stepChapter(-1)} className={arrow} aria-label="Capítulo anterior (←)" title="Anterior (←)">
            ◄
          </button>
          {CHAPTERS.map((chapter, i) => {
            const active = i === index;
            return (
              <button
                key={chapter.id}
                onClick={() => goToChapter(i)}
                aria-current={active ? "step" : undefined}
                className={`flex items-baseline gap-1.5 px-2.5 py-0.5 ${
                  active ? "bg-phosphor text-void" : "text-phosphor-dim hover:text-phosphor-hot"
                }`}
              >
                <span>{pad(i + 1)}</span>
                <span className="max-lg:hidden">{chapter.label}</span>
              </button>
            );
          })}
          <button onClick={() => stepChapter(1)} className={arrow} aria-label="Capítulo siguiente (→)" title="Siguiente (→)">
            ►
          </button>
        </div>
        <ProgressBar barRef={desktopBar} />
      </nav>

      {/* Mobile: indicador compacto arriba (los paneles van abajo). */}
      <nav
        aria-label="Capítulos"
        className="fixed left-4 top-4 z-[44] border border-phosphor-dim bg-void/85 font-display text-lg uppercase backdrop-blur-sm md:hidden"
      >
        <div className="flex items-center">
          <button onClick={() => stepChapter(-1)} className={`${arrow} py-0.5`} aria-label="Capítulo anterior">
            ◄
          </button>
          <span className="min-w-[8.5rem] text-center text-phosphor">
            {pad(index + 1)}/{pad(CHAPTERS.length)} {CHAPTERS[index].label}
          </span>
          <button onClick={() => stepChapter(1)} className={`${arrow} py-0.5`} aria-label="Capítulo siguiente">
            ►
          </button>
        </div>
        <ProgressBar barRef={mobileBar} />
      </nav>
    </>
  );
}

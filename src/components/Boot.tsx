"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { frameStore } from "@/sequence/loader";
import { useScene } from "@/store/useScene";

gsap.registerPlugin(useGSAP, TextPlugin);

const BAR_SEGMENTS = 24;
/** Debajo de este ancho se cargan los fotogramas de 960 px (public/sequences/clipN/mobile). */
const MOBILE_QUERY = "(max-width: 767px)";

/** Acto 0: terminal BIOS que tipea. Es el preloader real: espera a que cargue el clip 1. */
export default function Boot({ lines }: { lines: string[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const { booted, setBooted, setBootProgress } = useScene();

  useEffect(() => {
    document.documentElement.style.overflow = booted ? "" : "hidden";
    // Si el Boot se desmonta antes de terminar (p. ej. MotionGate pasa a la versión estática),
    // la página no puede quedar sin scroll.
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [booted]);

  useGSAP(
    () => {
      const typing = gsap.timeline();
      gsap.utils.toArray<HTMLElement>("[data-line]").forEach((el, i) => {
        typing.to(el, { text: lines[i], duration: lines[i].length * 0.02, ease: "none" });
      });

      frameStore.variant = window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop";
      const clip1 = frameStore.loadClip("clip1", (p) => {
        setBootProgress(p);
        const filled = Math.round(p * BAR_SEGMENTS);
        if (barRef.current) barRef.current.textContent = "█".repeat(filled) + "░".repeat(BAR_SEGMENTS - filled);
      });

      Promise.all([clip1.then(() => frameStore.warmup(0)), typing.then()]).then(() => {
        gsap.to(rootRef.current, {
          autoAlpha: 0,
          duration: 0.4,
          ease: "steps(4)",
          onComplete: () => {
            setBooted(true);
            frameStore.loadAllInBackground();
          },
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-40 flex flex-col justify-end bg-void p-8 font-display text-2xl text-phosphor"
      role="status"
      aria-live="polite"
    >
      {lines.map((_, i) => (
        <p key={i} data-line />
      ))}
      <p>
        [<span ref={barRef}>{"░".repeat(BAR_SEGMENTS)}</span>]<span className="crt-cursor text-phosphor-hot">_</span>
      </p>
    </div>
  );
}

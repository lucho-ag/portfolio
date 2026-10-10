"use client";

import { useEffect, useRef } from "react";
import type { StackGroup } from "@/lib/content";
import { siteFor } from "@/scene/pcbSites";
import { useScene } from "@/store/useScene";

/** Cada cuánto pasa al siguiente grupo cuando nadie interactúa (ms). */
const AUTO_CYCLE_MS = 2400;

/**
 * Grupos de tecnologías como componentes de la placa: cada uno lleva el designador del chip que
 * enciende en la PCB 3D. Hover, foco o ↑↓ eligen; sin interacción, recorre los grupos solo.
 */
export default function StackBrowser({ stack }: { stack: StackGroup[] }) {
  const activeGroup = useScene((s) => s.activeStackGroup);
  const setActiveGroup = useScene((s) => s.setActiveStackGroup);
  const active = useScene((s) => s.activePause === "stack");
  const interacting = useRef(false);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      if (interacting.current) return;
      setActiveGroup((useScene.getState().activeStackGroup + 1) % stack.length);
    }, AUTO_CYCLE_MS);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      interacting.current = true;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActiveGroup((useScene.getState().activeStackGroup + step + stack.length) % stack.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [active, stack.length, setActiveGroup]);

  const select = (i: number) => {
    interacting.current = true;
    setActiveGroup(i);
  };

  return (
    <>
      <dl className="space-y-1" onMouseLeave={() => (interacting.current = false)}>
        {stack.map((g, i) => {
          const isActive = i === activeGroup;
          return (
            <div
              key={g.group}
              tabIndex={0}
              onMouseEnter={() => select(i)}
              onFocus={() => select(i)}
              className={`cursor-default px-2 py-1 outline-none ${isActive ? "bg-phosphor/10 shadow-[inset_2px_0_0_var(--phosphor)]" : ""}`}
            >
              <dt className="flex items-baseline gap-3 font-display text-xl uppercase">
                <span className={isActive ? "text-phosphor-hot" : "text-phosphor-dim"}>{siteFor(i).designator}</span>
                <span data-fx="scramble" className={isActive ? "text-phosphor-hot" : "text-phosphor"}>
                  {g.group}
                </span>
                {isActive && (
                  <span aria-hidden className="crt-blink ml-auto text-base text-phosphor-hot">
                    ● ON
                  </span>
                )}
              </dt>
              <dd data-fx="lines" className="text-sm text-phosphor-dim">
                {g.items.join(" · ")}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-3 font-display text-base uppercase text-phosphor-dim">↑↓ Probe · Hover a chip</p>
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { Achievement, Certification } from "@/lib/content";
import { useScene } from "@/store/useScene";
import Window from "../ui/Window";

/** Cada cuánto pasa al siguiente documento cuando nadie interactúa (ms). */
const AUTO_CYCLE_MS = 3200;

/**
 * Certificaciones y logros. El documento activo es el que muestra el certificado 3D
 * (índices: primero las certificaciones, después los logros).
 */
export default function CertsBrowser({
  certifications,
  achievements,
}: {
  certifications: Certification[];
  achievements: Achievement[];
}) {
  const selected = useScene((s) => s.selectedDocument);
  const setSelected = useScene((s) => s.setSelectedDocument);
  const active = useScene((s) => s.activePause === "certs");
  const interacting = useRef(false);
  const total = certifications.length + achievements.length;

  useEffect(() => {
    if (!active || total === 0) return;
    const id = window.setInterval(() => {
      if (interacting.current) return;
      setSelected((useScene.getState().selectedDocument + 1) % total);
    }, AUTO_CYCLE_MS);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      interacting.current = true;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setSelected((useScene.getState().selectedDocument + step + total) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [active, total, setSelected]);

  const itemProps = (i: number) => ({
    tabIndex: 0,
    onMouseEnter: () => {
      interacting.current = true;
      setSelected(i);
    },
    onFocus: () => {
      interacting.current = true;
      setSelected(i);
    },
    className: `cursor-default px-2 py-1 outline-none ${
      i === selected ? "bg-phosphor/10 shadow-[inset_2px_0_0_var(--phosphor)]" : ""
    }`,
  });
  const titleClass = (i: number) => `font-display text-xl uppercase ${i === selected ? "text-phosphor-hot" : "text-phosphor"}`;

  return (
    <div className="flex max-h-[58vh] flex-col gap-3 md:max-h-[80vh]" onMouseLeave={() => (interacting.current = false)}>
      <Window subject="CERTIFICATIONS" status={`${certifications.length} FILES`} className="min-h-0 shrink">
        <ul className="space-y-1">
          {certifications.map((c, i) => (
            <li key={c.id} {...itemProps(i)}>
              <span data-fx="scramble" className={`block ${titleClass(i)}`}>
                {c.title}
              </span>
              <span data-fx="lines" className="block text-sm text-phosphor-dim">
                {[c.issuer, c.date].filter(Boolean).join(" — ")}
              </span>
            </li>
          ))}
        </ul>
      </Window>
      <Window subject="ACHIEVEMENTS" status={`${achievements.length} UNLOCKED`} className="min-h-0 shrink">
        <ul className="space-y-1">
          {achievements.map((a, j) => {
            const i = certifications.length + j;
            return (
              <li key={a.id} {...itemProps(i)}>
                <span className={`block ${titleClass(i)}`}>
                  <span data-fx="item" className="text-phosphor-hot">
                    ★
                  </span>{" "}
                  <span data-fx="scramble">{a.title}</span>
                </span>
                <span data-fx="lines" className="block text-sm text-phosphor-dim">
                  {a.description}
                </span>
              </li>
            );
          })}
        </ul>
      </Window>
      <p className="shrink-0 font-display text-base uppercase text-phosphor-dim max-md:hidden">↑↓ Browse · Hover to print</p>
    </div>
  );
}

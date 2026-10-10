"use client";

import { useScene } from "@/store/useScene";

const ch = (n: number) => `CH ${String(n + 1).padStart(2, "0")}`;

/**
 * Cambio de canal para los saltos largos del HUD (ver animation/navigation.ts): estática con
 * una banda que rueda y el cartel en pantalla (OSD) con el canal de origen y el de destino.
 * Queda montado siempre; se enciende y apaga con opacidad en pasos, como el resto de la UI.
 */
export default function ChannelSwitch() {
  const channel = useScene((s) => s.channelSwitch);
  const on = channel !== null;

  return (
    <div
      aria-hidden={!on}
      className={`crt-static pointer-events-none fixed inset-0 z-[43] overflow-hidden transition-opacity duration-200 ease-[steps(3)] ${
        on ? "opacity-100" : "opacity-0"
      }`}
    >
      {channel && (
        <div role="status" className="absolute left-6 top-16 font-display uppercase text-phosphor-hot md:left-10 md:top-10">
          <p className="text-5xl leading-none drop-shadow-[0_0_8px_var(--phosphor)] md:text-6xl">
            {ch(channel.from)} ▸ {ch(channel.to)}
          </p>
          <p className="mt-2 text-2xl text-phosphor">{channel.label}</p>
          <p className="crt-blink mt-1 text-lg text-phosphor-dim">Tuning…</p>
        </div>
      )}
    </div>
  );
}

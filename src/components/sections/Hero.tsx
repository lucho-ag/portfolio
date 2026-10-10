import type { Site } from "@/lib/content";
import { handle } from "../terminal/commands";
import Reveal from "../Reveal";
import Window from "../ui/Window";

/**
 * Pausa 2a: nombre y título al llegar a la estación. Van dentro de una ventana de consola
 * con fondo oscuro: el video de fondo es una pantalla verde y el texto verde se perdía.
 */
export default function Hero({ site }: { site: Site }) {
  return (
    <Reveal pause="hero" className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4">
      <Window subject="IDENTITY" status="AUTHENTICATED" className="w-full max-w-2xl">
        <div className="px-2 py-4 text-center md:px-6">
          <p className="text-left text-sm">
            <span className="text-phosphor-hot">guest@{handle(site)}:~$</span>{" "}
            <span data-fx="type" className="text-phosphor">
              whoami
            </span>
          </p>
          <h1
            data-fx="scramble"
            className="crt-glitch mt-4 font-display text-[clamp(2.75rem,8vh,5.5rem)] leading-none uppercase text-phosphor"
          >
            {site.name}
          </h1>
          <p data-fx="scramble" className="mt-2 font-display text-[clamp(1.4rem,3.6vh,2.1rem)] uppercase text-phosphor-hot">
            {site.title}
            <span aria-hidden className="crt-cursor text-phosphor-hot">
              _
            </span>
          </p>
        </div>
      </Window>
      <p data-fx="item" className="crt-blink bg-void/85 px-2 font-display text-xl uppercase text-phosphor-dim">
        Scroll ▼ <span className="max-md:hidden">· ← → Capítulos</span>
      </p>
    </Reveal>
  );
}

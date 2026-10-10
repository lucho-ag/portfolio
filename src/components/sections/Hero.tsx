import type { Site } from "@/lib/content";
import Reveal from "../Reveal";

/** Pausa 2a: nombre y título superpuestos al llegar a la estación. */
export default function Hero({ site }: { site: Site }) {
  return (
    <Reveal pause="hero" className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <h1
        data-fx="scramble"
        className="crt-glitch font-display text-[clamp(3rem,9vh,6rem)] leading-none uppercase text-phosphor"
      >
        {site.name}
      </h1>
      <p data-fx="scramble" className="mt-2 font-display text-[clamp(1.5rem,4vh,2.25rem)] uppercase text-phosphor-dim">
        {site.title}
      </p>
      <p className="mt-4 max-w-xl text-phosphor">
        <span data-fx="type">{site.tagline}</span>
        <span aria-hidden className="crt-cursor text-phosphor-hot">
          _
        </span>
      </p>
      <p data-fx="item" className="crt-blink absolute bottom-[8vh] font-display text-xl uppercase text-phosphor-dim">
        Scroll ▼
      </p>
    </Reveal>
  );
}

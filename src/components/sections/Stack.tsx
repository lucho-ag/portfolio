import type { StackGroup } from "@/lib/content";
import Reveal from "../Reveal";
import Window from "../ui/Window";
import StackBrowser from "./StackBrowser";

/** Pausa 2c: tecnologías como componentes de la PCB; el grupo activo enciende su chip en 3D. */
export default function Stack({ stack }: { stack: StackGroup[] }) {
  return (
    <Reveal
      pause="stack"
      className="absolute inset-x-[4vw] bottom-0 flex items-end pb-6 md:inset-x-auto md:inset-y-0 md:left-[4vw] md:w-[min(28rem,92vw)] md:items-center md:py-8"
    >
      <Window subject="STACK" status={`${stack.length} ICs ONLINE`} className="max-h-[55vh] w-full md:max-h-[85vh]">
        <StackBrowser stack={stack} />
      </Window>
    </Reveal>
  );
}

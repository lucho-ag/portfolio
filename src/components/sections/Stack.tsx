import type { StackGroup } from "@/lib/content";
import Reveal from "../Reveal";
import Window from "../ui/Window";
import StackBrowser from "./StackBrowser";

/** Pausa 2c: tecnologías como componentes de la PCB; el grupo activo enciende su chip en 3D. */
export default function Stack({ stack }: { stack: StackGroup[] }) {
  return (
    <Reveal pause="stack" className="absolute inset-y-0 left-[4vw] flex w-[min(28rem,92vw)] items-center py-8">
      <Window subject="STACK" status={`${stack.length} ICs ONLINE`} className="w-full">
        <StackBrowser stack={stack} />
      </Window>
    </Reveal>
  );
}

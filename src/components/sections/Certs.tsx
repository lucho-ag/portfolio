import type { Achievement, Certification } from "@/lib/content";
import Reveal from "../Reveal";
import CertsBrowser from "./CertsBrowser";

/** Pausa 2d: certificaciones y logros; el elegido se imprime en el certificado 3D. */
export default function Certs({
  certifications,
  achievements,
}: {
  certifications: Certification[];
  achievements: Achievement[];
}) {
  return (
    <Reveal
      pause="certs"
      className="absolute inset-x-[4vw] bottom-0 flex flex-col justify-end pb-6 md:inset-x-auto md:inset-y-0 md:right-[4vw] md:w-[min(28rem,92vw)] md:justify-center md:py-8"
    >
      <CertsBrowser certifications={certifications} achievements={achievements} />
    </Reveal>
  );
}

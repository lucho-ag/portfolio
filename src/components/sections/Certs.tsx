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
    <Reveal pause="certs" className="absolute inset-y-0 right-[4vw] flex w-[min(28rem,92vw)] flex-col justify-center py-8">
      <CertsBrowser certifications={certifications} achievements={achievements} />
    </Reveal>
  );
}
